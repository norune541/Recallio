import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { GraphqlQueryError } from '@shopify/shopify-api';
import { createShopifyGraphqlClient } from '../../shopify-api.client.js';
import { GetValidShopifyAccessTokenUseCase } from '../auth/get-valid-shopify-access-token.use-case.js';

import { ShopifyDao } from '../../dao/shopify.dao.js';
import { ClaudeMessageAdapter } from 'backend/src/modules/claude/claudeMessageAdapter.js';

import { UserNotFoundException } from 'backend/src/modules/user/dto/UserNotFound.dto.js';
import { ShopNotFoundException } from '../../dto/shop-notFound.dto.js';
import type { ShopifyProductNode } from 'backend/src/common/types/products.js';
import type { ShopifyProductsResponseDto } from '../../dto/shopify-products.dto.js';

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

/**
 * Retrieves Shopify products associated with the authenticated Clerk user.
 *
 * @remarks
 * The method performs the following steps:
 * 1. Finds the internal user record using the user's email.
 * 2. Retrieves the shop associated with the user.
 * 3. Obtains a valid Shopify access token.
 * 4. Creates a Shopify GraphQL client.
 * 5. Fetches the first 10 products, sorted alphabetically by title.
 *
 * @param email - The user's email.
 * @returns A list of Shopify products, or an empty array if no products are found.
 * @throws NotFoundException If the user or their associated shop is not found.
 * @throws BadGatewayException If Shopify returns a network or GraphQL error.
 */
@Injectable()
export class GetProductsUseCase {
  constructor(
    private readonly shopifyDao: ShopifyDao,
    private readonly getValidToken: GetValidShopifyAccessTokenUseCase,
    private readonly claudeAdapter: ClaudeMessageAdapter,
  ) {}

  async execute(
    email: string,
    limit: number,
    after?: string,
  ): Promise<ShopifyProductsResponseDto> {
    const user = await this.shopifyDao.findUserIdByEmail(email);

    if (!user) {
      throw new UserNotFoundException();
    }

    const shop = await this.shopifyDao.findShopByUserId(user.id);

    if (!shop) {
      throw new ShopNotFoundException();
    }

    const accessToken = await this.getValidToken.execute(shop.shopDomain);

    try {
      const client = createShopifyGraphqlClient(
        shop.shopDomain,
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

      const ai = await this.claudeAdapter.analyzeProducts(data?.products.nodes);
      console.log(ai);
      return {
        aiReview: ai,
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
