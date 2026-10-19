import { BadGatewayException, Injectable } from '@nestjs/common';
import { createShopifyGraphqlClient } from '../../shopify-api.client.js';
import { GetValidShopifyAccessTokenUseCase } from '../auth/get-valid-shopify-access-token.use-case.js';
import { ShopifyDao } from '../../dao/shopify.dao.js';
import { UserNotFoundException } from 'backend/src/modules/user/dto/UserNotFound.dto.js';
import { ShopNotFoundException } from '../../dto/shop-notFound.dto.js';

type ProductStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'UNLISTED';
type Money = { amount: string; currencyCode: string };
type ProductImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

type ShopifyProductNode = {
  // Identification
  id: string;
  title: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];

  // Status and dates
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;

  // Inventory
  totalInventory: number;

  // Media
  featuredMedia: { preview: { image: ProductImage | null } | null } | null;

  // Storefront links
  onlineStoreUrl: string | null;
  onlineStorePreviewUrl: string | null;

  // Pricing
  priceRangeV2: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
};

type ShopifyProductListData = {
  products: {
    nodes: ShopifyProductNode[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

const PRODUCTS_QUERY = `#graphql
  query Products {
    products(first: 10, sortKey: TITLE, reverse: false) {
      nodes {
        id
        title
        handle
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
        priceRangeV2 {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
        featuredMedia {
          preview {
            image { url altText width height }
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
 * 1. Finds the internal user record using the Clerk user ID.
 * 2. Retrieves the shop associated with the user.
 * 3. Obtains a valid Shopify access token.
 * 4. Creates a Shopify GraphQL client.
 * 5. Fetches the first 10 products, sorted alphabetically by title.
 *
 * @param clerkUserId - The user's Clerk ID provided by ClerkAuthGuard.
 * @returns A list of Shopify products, or an empty array if no products are found.
 * @throws NotFoundException If the user or their associated shop is not found.
 * @throws BadGatewayException If Shopify returns a network or GraphQL error.
 */
@Injectable()
export class GetProductsUseCase {
  constructor(
    private readonly shopifyDao: ShopifyDao,
    private readonly getValidToken: GetValidShopifyAccessTokenUseCase,
  ) {}

  async execute(clerkUserId: string): Promise<ShopifyProductNode[]> {
    const user = await this.shopifyDao.findUserIdByClerkUserId(clerkUserId);

    if (!user) {
      throw new UserNotFoundException();
    }

    const shop = await this.shopifyDao.findShopByUserId(user.id);

    if (!shop) {
      throw new ShopNotFoundException();
    }

    const accessToken = await this.getValidToken.execute(shop.shopDomain);

    const client = createShopifyGraphqlClient(
      shop.shopDomain,
      accessToken,
      'read_products',
    );

    const { data, errors } =
      await client.request<ShopifyProductListData>(PRODUCTS_QUERY);

    if (errors) {
      throw new BadGatewayException(
        errors.message ?? 'Shopify GraphQL request failed',
      );
    }

    return data?.products.nodes ?? [];
  }
}
