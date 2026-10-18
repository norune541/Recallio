import { Injectable, NotFoundException } from '@nestjs/common';
import { BadGatewayException } from '@nestjs/common';

import { ShopifyDao } from '../../dao/shopify.dao.js';
import { GetValidShopifyAccessTokenUseCase } from '../auth/get-valid-shopify-access-token.use-case.js';
import { createShopifyGraphqlClient } from '../../shopify-api.client.js';
import { ShopifyShopDto } from '../../dto/shopify-shop.dto.js';

interface ShopifyShopData {
  shop: ShopifyShopDto;
}

const SHOP_QUERY = `#graphql
  query Shop {
    shop {
      id
      name
      myshopifyDomain
      url
      email
      contactEmail
      shopOwnerName
      currencyCode
      enabledPresentmentCurrencies
      ianaTimezone
      timezoneAbbreviation
      createdAt
      primaryDomain {
        host
        url
      }
      plan {
        displayName
        partnerDevelopment
        shopifyPlus
      }
      shipsToCountries
      setupRequired
    }
  }
`;
@Injectable()
export class GetShopUseCase {
  constructor(
    private readonly shopifyDao: ShopifyDao,
    private readonly getValidToken: GetValidShopifyAccessTokenUseCase,
  ) {}

  async execute(clerkUserId: string): Promise<ShopifyShopDto> {
    const user = await this.shopifyDao.findUserIdByClerkUserId(clerkUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const shop = await this.shopifyDao.findShopByUserId(user.id);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const accessToken = await this.getValidToken.execute(shop.shopDomain);

    const client = createShopifyGraphqlClient(
      shop.shopDomain,
      accessToken,
      'read_products',
    );

    const { data, errors } = await client.request<ShopifyShopData>(SHOP_QUERY);

    if (errors) {
      throw new BadGatewayException(
        errors.message ?? 'Shopify GraphQL request failed',
      );
    }
    if (!data) {
      throw new BadGatewayException('Shopify returned an empty response');
    }

    return data.shop;
  }
}
