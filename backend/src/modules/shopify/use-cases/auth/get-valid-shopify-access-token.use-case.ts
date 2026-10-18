import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ShopifyDao } from '../../dao/shopify.dao.js';
import {
  ShopifyOAuthUtils,
  TOKEN_REFRESH_WINDOW_MS,
} from '../../shopify-oauth.utils.js';
import { RefreshShopifyAccessTokenUseCase } from './refresh-shopify-access-token.use-case.js';

@Injectable()
export class GetValidShopifyAccessTokenUseCase {
  constructor(
    private readonly shopifyDao: ShopifyDao,
    private readonly shopifyOAuthUtils: ShopifyOAuthUtils,
    private readonly refreshShopifyAccessToken: RefreshShopifyAccessTokenUseCase,
  ) {}

  /** Server-side only: never return Shopify access tokens to the browser. */
  async execute(shopDomainInput: string): Promise<string> {
    const shopDomain = this.shopifyOAuthUtils
      .validateShopDomain(shopDomainInput)
      .toLowerCase();
    const shop = await this.shopifyDao.findTokenState(shopDomain);

    if (!shop || shop.status !== 'CONNECTED' || !shop.accessTokenEncrypted) {
      throw new NotFoundException('This Shopify store is not connected.');
    }

    const accessTokenIsStillValid =
      shop.accessTokenExpiresAt !== null &&
      shop.accessTokenExpiresAt.getTime() >
        Date.now() + TOKEN_REFRESH_WINDOW_MS;

    if (accessTokenIsStillValid) {
      return this.shopifyOAuthUtils.decryptToken(shop.accessTokenEncrypted);
    }

    if (
      !shop.refreshTokenEncrypted ||
      !shop.refreshTokenExpiresAt ||
      shop.refreshTokenExpiresAt.getTime() <= Date.now()
    ) {
      await this.shopifyDao.markShopDisconnected(shopDomain);
      throw new UnauthorizedException(
        'Shopify token expired. Reconnect the store to continue.',
      );
    }

    return this.refreshShopifyAccessToken.execute(shopDomain);
  }
}
