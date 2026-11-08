import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { GraphqlQueryError } from '@shopify/shopify-api';
import { createShopifyGraphqlClient } from '../shopify-api.client.js';
import { GetValidShopifyAccessTokenUseCase } from '../use-cases/auth/get-valid-shopify-access-token.use-case.js';

import type { ShopifyProductNode } from 'backend/src/common/types/products.js';

export type AnalyzeProductsResult = {
  items: ShopifyProductNode[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};
type ShopifyProductListData = {
  products: {
    nodes: ShopifyProductNode[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
};

const PRODUCTS_QUERY = `#graphql
  query Products(
    $first: Int!
    $after: String
    $searchQuery: String
  ) {
    products(
      first: $first
      after: $after
      query: $searchQuery
      sortKey: UPDATED_AT
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
    updatedAfter?: Date,
  ): Promise<AnalyzeProductsResult> {
    const accessToken = await this.getValidToken.execute(shopDomain);

    try {
      const client = createShopifyGraphqlClient(
        shopDomain,
        accessToken,
        'read_products',
      );

      const searchQuery = updatedAfter
        ? `updated_at:>${updatedAfter.toISOString()}`
        : undefined;

      const { data, errors } = await client.request<ShopifyProductListData>(
        PRODUCTS_QUERY,
        {
          variables: {
            first: limit,
            after,
            searchQuery,
          },
        },
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
        items: data.products.nodes,
        pageInfo: data.products.pageInfo,
      };
    } catch (err) {
      if (err instanceof GraphqlQueryError) {
        const body = err.body as
          | {
              errors?: {
                graphQLErrors?: Array<{ message?: string }>;
              };
            }
          | undefined;
        const graphQLErrors = body?.errors?.graphQLErrors;
        const message = graphQLErrors?.[0]?.message;

        throw new BadRequestException(
          message ?? 'Shopify GraphQL query failed',
        );
      }

      if (
        err instanceof BadGatewayException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }

      throw new BadGatewayException('Failed to retrieve Shopify products');
    }
  }
}
