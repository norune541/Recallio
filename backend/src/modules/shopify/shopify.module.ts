import { Module } from '@nestjs/common';

import { ShopifyController } from './shopify.controller.js';
import { ShopifyDao } from './dao/shopify.dao.js';
import { ShopifyApiClient } from './shopify-api.client.js';
import { ShopifyOAuthUtils } from './shopify-oauth.utils.js';
import { BeginShopifyAuthUseCase } from './use-cases/auth/begin-shopify-auth.use-case.js';
import { CompleteShopifyAuthUseCase } from './use-cases/auth/complete-shopify-auth.use-case.js';
import { GetValidShopifyAccessTokenUseCase } from './use-cases/auth/get-valid-shopify-access-token.use-case.js';
import { RefreshShopifyAccessTokenUseCase } from './use-cases/auth/refresh-shopify-access-token.use-case.js';
import { GetProductsUseCase } from './use-cases/api/get-products.js';
import { GetShopUseCase } from './use-cases/api/get-shop.js';
import { DeleteShop } from './use-cases/shop/delete-shopify-membership.use-case.js';

@Module({
  controllers: [ShopifyController],
  providers: [
    ShopifyDao,
    ShopifyApiClient,
    ShopifyOAuthUtils,
    BeginShopifyAuthUseCase,
    CompleteShopifyAuthUseCase,
    GetValidShopifyAccessTokenUseCase,
    RefreshShopifyAccessTokenUseCase,
    GetProductsUseCase,
    GetShopUseCase,
    DeleteShop,
  ],
})
export class ShopifyModule {}
