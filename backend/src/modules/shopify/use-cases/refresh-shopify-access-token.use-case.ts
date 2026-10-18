import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ShopifyDao } from '../dao/shopify.dao.js';
import { ShopifyApiClient } from '../shopify-api.client.js';
import { ShopifyOAuthUtils } from '../shopify-oauth.utils.js';

@Injectable()
export class RefreshShopifyAccessTokenUseCase {
  /** Prevent duplicate refreshes for the same shop inside this Node process. */
  private readonly refreshInFlight = new Map<string, Promise<string>>();

  constructor(
    private readonly shopifyDao: ShopifyDao,
    private readonly shopifyOAuthUtils: ShopifyOAuthUtils,
    private readonly shopifyApiClient: ShopifyApiClient,
  ) {}

  execute(shopDomain: string): Promise<string> {
    const current = this.refreshInFlight.get(shopDomain);
    if (current) return current;

    const refreshPromise = this.performRefresh(shopDomain);
    this.refreshInFlight.set(shopDomain, refreshPromise);

    return refreshPromise.finally(() => {
      if (this.refreshInFlight.get(shopDomain) === refreshPromise) {
        this.refreshInFlight.delete(shopDomain);
      }
    });
  }

  private async performRefresh(shopDomain: string): Promise<string> {
    const shop = await this.shopifyDao.findRefreshState(shopDomain);
    if (!shop || shop.status !== 'CONNECTED' || !shop.refreshTokenEncrypted) {
      throw new UnauthorizedException(
        'Shopify refresh token is unavailable. Reconnect the store.',
      );
    }

    let tokenResponse;
    try {
      tokenResponse = await this.shopifyApiClient.refreshAccessToken(
        shopDomain,
        this.shopifyOAuthUtils.decryptToken(shop.refreshTokenEncrypted),
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        await this.shopifyDao.markShopDisconnected(shopDomain);
      }
      throw error;
    }

    const accessToken = this.shopifyOAuthUtils.requireString(
      tokenResponse.access_token,
      'Shopify refresh response did not include an access token.',
    );
    const refreshToken = this.shopifyOAuthUtils.requireString(
      tokenResponse.refresh_token,
      'Shopify refresh response did not include a rotated refresh token.',
    );
    const accessLifetime = this.shopifyOAuthUtils.requirePositiveSeconds(
      tokenResponse.expires_in,
      'Shopify refresh response did not include a valid expires_in value.',
    );
    const refreshLifetime = this.shopifyOAuthUtils.requirePositiveSeconds(
      tokenResponse.refresh_token_expires_in,
      'Shopify refresh response did not include a valid refresh token expiry.',
    );
    const scopes = tokenResponse.scope
      ? this.shopifyOAuthUtils.parseGrantedScopes(tokenResponse.scope)
      : shop.grantedScopes;
    const now = new Date();

    await this.shopifyDao.saveRefreshedTokens({
      shopDomain,
      accessTokenEncrypted: this.shopifyOAuthUtils.encryptToken(accessToken),
      refreshTokenEncrypted: this.shopifyOAuthUtils.encryptToken(refreshToken),
      accessTokenExpiresAt: new Date(now.getTime() + accessLifetime * 1000),
      refreshTokenExpiresAt: new Date(now.getTime() + refreshLifetime * 1000),
      grantedScopes: scopes,
    });

    return accessToken;
  }
}
