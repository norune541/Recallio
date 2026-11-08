import { Injectable, Logger } from '@nestjs/common';

import { ShopifyDao } from '../dao/shopify.dao.js';
import { ShopifySyncProvider } from '../providers/shopify-sync.provider.js';

import { UserNotFoundException } from '../../user/dto/UserNotFound.dto.js';
import { ShopNotFoundException } from '../dto/shop-notFound.dto.js';

@Injectable()
export class SyncShopProductsUseCase {
  private readonly logger = new Logger(SyncShopProductsUseCase.name);

  constructor(
    private readonly shopifyDao: ShopifyDao,
    private readonly shopifyProvider: ShopifySyncProvider,
  ) {}

  async execute(email: string) {
    const user = await this.shopifyDao.findUserIdByEmail(email);
    if (!user) throw new UserNotFoundException();

    const shop = await this.shopifyDao.findShopByUserId(user.id);
    if (!shop) throw new ShopNotFoundException();

    const result = await this.shopifyDao.tryStartShopifySync(shop.id);
    if (result.count === 0) {
      return this.shopifyDao.getShopifySyncStatus(shop.id);
    }

    void this.shopifyProvider
      .syncShop({
        id: shop.id,
        shopDomain: shop.shopDomain,
      })
      .then(async (success) => {
        await this.shopifyDao.updateShopifySyncStatus(
          shop.id,
          success ? 'CONNECTED' : 'FAILED',
        );
      })
      .catch(async (err) => {
        this.logger.error(
          `Shopify sync failed for ${shop.shopDomain}`,
          err instanceof Error ? err.stack : String(err),
        );

        await this.shopifyDao.updateShopifySyncStatus(shop.id, 'FAILED');
      });

    return 'PENDING';
  }
}
