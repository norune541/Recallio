import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { GraphqlQueryError } from '@shopify/shopify-api';
import { createShopifyGraphqlClient } from '../shopify-api.client.js';
import { GetValidShopifyAccessTokenUseCase } from '../use-cases/auth/get-valid-shopify-access-token.use-case.js';

import type { ShopifyProductNode } from 'backend/src/common/types/products.js';
import type { ShopifyProductsResponseDto } from '../dto/shopify-products.dto.js';

type ShopifyProductListData = {
  products: {
    nodes: ShopifyProductNode[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

const PRODUCTS_QUERY = `#graphql
  query Products($first: Int!, $after: String) {
    products(
      first: $first,
      after: $after,
      sortKey: TITLE,
      reverse: false
    ) {
      nodes {
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

      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

@Injectable()
export class AnalyzeProductsUseCase {
  constructor(
    private readonly getValidToken: GetValidShopifyAccessTokenUseCase,
  ) {}

  async execute(
    shopDomain: string,
    limit: number,
    after?: string,
  ): Promise<ShopifyProductsResponseDto> {
    const accessToken = await this.getValidToken.execute(shopDomain);

    try {
      const client = createShopifyGraphqlClient(
        shopDomain,
        accessToken,
        'read_products',
      );

      const { data, errors } = await client.request<ShopifyProductListData>(
        PRODUCTS_QUERY,
        { variables: { first: limit, after } },
      );

      if (errors) {
        throw new BadGatewayException(
          errors.message ?? 'Shopify GraphQL request failed',
        );
      }
      if (!data) {
        throw new BadGatewayException('Failed to retrieve Shopify products');
      }

      return {
        items: data?.products.nodes ?? [],
        pageInfo: data?.products.pageInfo ?? {
          hasNextPage: false,
          endCursor: null,
        },
      };
    } catch (err) {
      if (err instanceof GraphqlQueryError) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const graphQLErrors = err.body?.errors.graphQLErrors;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const message = graphQLErrors[0]?.message;
        throw new BadRequestException(message);
      }

      throw new BadGatewayException('Failed to retrieve Shopify products');
    }
  }
}
