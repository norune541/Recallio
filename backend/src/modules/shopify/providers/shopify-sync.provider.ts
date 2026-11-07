import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ShopifyDao } from '../dao/shopify.dao.js';
import { AnalyzeProductsUseCase } from '../sync/analyze-products.sync.js';
import { AnalyzeProductUseCase } from '../sync/analyze-product.sync.js';

@Injectable()
export class ShopifySyncProvider {
  private readonly logger = new Logger(ShopifySyncProvider.name);

  constructor(
    private readonly shopifyDao: ShopifyDao,
    private readonly getProducts: AnalyzeProductsUseCase,
    private readonly analyzeProduct: AnalyzeProductUseCase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'UTC',
  })
  async syncProducts(): Promise<void> {
    this.logger.log('Starting daily Shopify product synchronization');

    try {
      const shops = await this.shopifyDao.findConnectedShops();

      for (const shop of shops) {
        try {
          let after: string | undefined;

          do {
            const result = await this.getProducts.execute(
              shop.shopDomain,
              100,
              after,
            );
            const existingProducts =
              await this.shopifyDao.findProductsUpdatedAt(
                shop.id,
                result.items.map((product) => product.id),
              );

            const existingProductsMap = new Map(
              existingProducts.map((product) => [
                product.shopifyProductId,
                product.updatedAt,
              ]),
            );

            for (const product of result.items) {
              try {
                const existingUpdatedAt = existingProductsMap.get(product.id);

                if (
                  existingUpdatedAt &&
                  existingUpdatedAt.getTime() ===
                    new Date(product.updatedAt).getTime()
                ) {
                  this.logger.debug(`Skipping unchanged product ${product.id}`);
                  continue;
                }

                const review = await this.analyzeProduct.execute(
                  shop.shopDomain,
                  product.id,
                );

                await this.shopifyDao.upsertProductWithReview(
                  shop.id,
                  review.product,
                  review.aiReview,
                );

                this.logger.debug(`Successfully synced product ${product.id}`);
              } catch (error) {
                this.logger.error(
                  `Failed to sync product ${product.id} for shop ${shop.shopDomain}`,
                  error instanceof Error ? error.stack : String(error),
                );
              }
            }

            if (!result.pageInfo.hasNextPage) break;

            after = result.pageInfo.endCursor ?? undefined;
          } while (after);
        } catch (error) {
          this.logger.error(
            `Failed to sync products for shop ${shop.shopDomain}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }

      this.logger.log('Daily Shopify product synchronization completed');
    } catch (error) {
      this.logger.error(
        'Daily Shopify product synchronization failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
