import { Module } from '@nestjs/common';

import { ShopifyController } from './shopify.controller.js';
import { ShopifyDao } from './dao/shopify.dao.js';
import { ShopifyApiClient } from './shopify-api.client.js';
import { ShopifyOAuthUtils } from './shopify-oauth.utils.js';
import { BeginShopifyAuthUseCase } from './use-cases/begin-shopify-auth.use-case.js';
import { CompleteShopifyAuthUseCase } from './use-cases/complete-shopify-auth.use-case.js';
import { GetValidShopifyAccessTokenUseCase } from './use-cases/get-valid-shopify-access-token.use-case.js';
import { RefreshShopifyAccessTokenUseCase } from './use-cases/refresh-shopify-access-token.use-case.js';
import { GetProductsUseCase } from './use-cases/api/get-products.js';

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
  ],
})
export class ShopifyModule {}
