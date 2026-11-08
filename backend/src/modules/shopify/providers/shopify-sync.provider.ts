import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import pLimit from 'p-limit';

import { ShopifyDao } from '../dao/shopify.dao.js';
import { AnalyzeProductsUseCase } from '../sync/analyze-products.sync.js';
import { ClaudeMessageAdapter } from '../../claude/claudeMessageAdapter.js';

@Injectable()
export class ShopifySyncProvider {
  private readonly logger = new Logger(ShopifySyncProvider.name);
  private readonly shopLimit = pLimit(10);
  private readonly productLimit = pLimit(200);
  private readonly claudeLimit = pLimit(200);

  constructor(
    private readonly shopifyDao: ShopifyDao,
    private readonly getProducts: AnalyzeProductsUseCase,
    private readonly claudeAdapter: ClaudeMessageAdapter,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncProducts(): Promise<void> {
    const startedAt = Date.now();

    this.logger.log('Starting Shopify product synchronization');

    try {
      const shops = await this.shopifyDao.findConnectedShops();
      this.logger.log(`Connected shops found: ${shops.length}`);

      const results = await Promise.all(
        shops.map((shop) => this.shopLimit(() => this.syncShop(shop))),
      );

      const duration = ((Date.now() - startedAt) / 1000).toFixed(2);
      const successfulShops = results.filter(Boolean).length;
      const failedShops = results.length - successfulShops;

      this.logger.log(
        `Shopify synchronization completed:
        Total shops: ${shops.length}
        Successful shops: ${successfulShops}
        Failed shops: ${failedShops}
        Total duration: ${duration}s`,
      );
    } catch (error) {
      this.logger.error(
        'Shopify product synchronization failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  public async syncShop(shop: {
    id: string;
    shopDomain: string;
  }): Promise<boolean> {
    const startedAt = Date.now();

    let productsFetched = 0;
    let productsSkipped = 0;
    let productsAnalyzed = 0;
    let productsSynced = 0;
    let productsFailed = 0;
    let pages = 0;

    try {
      const syncStartedAt = new Date();
      const lastSyncedAt = await this.shopifyDao.getLastSyncedAt(shop.id);

      const updatedAfter = lastSyncedAt
        ? new Date(lastSyncedAt.getTime() - 60_000)
        : undefined;

      let after: string | undefined;
      let hasErrors = false;

      do {
        const result = await this.getProducts.execute(
          shop.shopDomain,
          100,
          after,
          updatedAfter,
        );

        pages++;
        productsFetched += result.items.length;

        const existingProducts = await this.shopifyDao.findProductsUpdatedAt(
          shop.id,
          result.items.map((product) => product.id),
        );

        const existingProductsMap = new Map(
          existingProducts.map((product) => [
            product.shopifyProductId,
            product.updatedAt,
          ]),
        );

        await Promise.all(
          result.items.map((product) =>
            this.productLimit(async () => {
              try {
                const existingUpdatedAt = existingProductsMap.get(product.id);

                if (
                  existingUpdatedAt &&
                  existingUpdatedAt.getTime() ===
                    new Date(product.updatedAt).getTime()
                ) {
                  productsSkipped++;
                  return;
                }

                const aiReview = await this.claudeLimit(() =>
                  this.claudeAdapter.analyzeProduct(product),
                );

                productsAnalyzed++;

                await this.shopifyDao.upsertProductWithReview(
                  shop.id,
                  product,
                  aiReview,
                );

                productsSynced++;
              } catch (error) {
                hasErrors = true;
                productsFailed++;

                this.logger.error(
                  `Failed to sync product ${product.id} for shop ${shop.shopDomain}`,
                  error instanceof Error ? error.stack : String(error),
                );
              }
            }),
          ),
        );

        if (!result.pageInfo.hasNextPage) break;

        if (!result.pageInfo.endCursor) {
          throw new Error(
            `Shopify returned hasNextPage=true without endCursor for ${shop.shopDomain}`,
          );
        }

        after = result.pageInfo.endCursor;
      } while (after);

      if (hasErrors) {
        this.logger.warn(
          `Shop ${shop.shopDomain}: checkpoint was not updated because some products failed to sync`,
        );
      } else {
        await this.shopifyDao.updateLastSyncedAt(shop.id, syncStartedAt);
      }

      const duration = ((Date.now() - startedAt) / 1000).toFixed(2);

      this.logger.log(
        `Shop synchronization summary:
        Shop: ${shop.shopDomain}
        Status: ${hasErrors ? 'PARTIAL FAILURE' : 'SUCCESS'}
        Pages: ${pages}
        Products fetched: ${productsFetched}
        Products skipped: ${productsSkipped}
        Products analyzed: ${productsAnalyzed}
        Products synced: ${productsSynced}
        Products failed: ${productsFailed}
        Duration: ${duration}s`,
      );

      return !hasErrors;
    } catch (error) {
      const duration = ((Date.now() - startedAt) / 1000).toFixed(2);

      this.logger.error(
        `Failed to sync products for shop ${shop.shopDomain}. Duration: ${duration}s`,
        error instanceof Error ? error.stack : String(error),
      );

      return false;
    }
  }
}
