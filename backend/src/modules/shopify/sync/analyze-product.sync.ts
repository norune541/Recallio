import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GraphqlQueryError } from '@shopify/shopify-api';

import { createShopifyGraphqlClient } from '../shopify-api.client.js';
import { GetValidShopifyAccessTokenUseCase } from '../use-cases/auth/get-valid-shopify-access-token.use-case.js';
import { ClaudeMessageAdapter } from 'backend/src/modules/claude/claudeMessageAdapter.js';

import type { ProductReviewResponseDto } from 'backend/src/modules/shopify/dto/product-review-response.js';
import type { ShopifyProductNode } from 'backend/src/common/types/products.js';

type ShopifyProductData = {
  shop: {
    primaryDomain: {
      url: string;
    } | null;
  };
  product: ShopifyProductNode | null;
};

const PRODUCT_QUERY = `#graphql
  query GetProduct($id: ID!) {
    shop {
      primaryDomain {
        url
      }
    }
    product(id: $id) {
      id
      title
      handle
      description
      descriptionHtml
      vendor
      productType
      tags
      status
      createdAt
      updatedAt
      publishedAt
      totalInventory
      onlineStoreUrl
      onlineStorePreviewUrl

      seo {
        title
        description
      }

      priceRangeV2 {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }

      featuredMedia {
        preview {
          image {
            url
            altText
            width
            height
          }
        }
      }

      variants(first: 100) {
        nodes {
          id
          title
          sku
          barcode
          price
          compareAtPrice
          inventoryQuantity
          inventoryPolicy
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

@Injectable()
export class AnalyzeProductUseCase {
  constructor(
    private readonly getValidToken: GetValidShopifyAccessTokenUseCase,
    private readonly claudeAdapter: ClaudeMessageAdapter,
  ) {}

  async execute(
    shopDomain: string,
    productId: string,
  ): Promise<ProductReviewResponseDto> {
    const accessToken = await this.getValidToken.execute(shopDomain);

    try {
      const client = createShopifyGraphqlClient(
        shopDomain,
        accessToken,
        'read_products',
      );

      const { data, errors } = await client.request<ShopifyProductData>(
        PRODUCT_QUERY,
        {
          variables: { id: productId },
        },
      );

      if (errors) {
        throw new BadRequestException(
          errors.message ?? 'Shopify GraphQL request failed',
        );
      }

      if (!data?.product) {
        throw new NotFoundException('Shopify product not found');
      }

      const aiReview = await this.claudeAdapter.analyzeProduct(data.product);

      return {
        shop: data.shop,
        product: data.product,
        aiReview,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      if (err instanceof GraphqlQueryError) {
        throw new BadRequestException('Shopify GraphQL request failed');
      }

      throw new BadRequestException('Failed to retrieve Shopify product');
    }
  }
}
