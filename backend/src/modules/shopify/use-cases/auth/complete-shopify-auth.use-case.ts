import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ShopifyDao } from '../../dao/shopify.dao.js';
import { ShopifyApiClient } from '../../shopify-api.client.js';
import { ShopifyOAuthUtils } from '../../shopify-oauth.utils.js';

@Injectable()
export class CompleteShopifyAuthUseCase {
  constructor(
    private readonly shopifyDao: ShopifyDao,
    private readonly shopifyOAuthUtils: ShopifyOAuthUtils,
    private readonly shopifyApiClient: ShopifyApiClient,
  ) {}

  /** Handles Shopify's external OAuth callback; it intentionally is not Clerk-protected. */
  async execute(
    rawQuery: Record<string, unknown>,
  ): Promise<{ shopDomain: string }> {
    const query = this.shopifyOAuthUtils.normalizeQuery(rawQuery);

    if (query.error) {
      throw new ForbiddenException('Shopify authorization was declined.');
    }

    const { hmac, state, shop: shopInput, code } = query;
    if (!hmac || !state || !shopInput || !code || !query.timestamp) {
      throw new BadRequestException(
        'Shopify callback is missing hmac, state, shop, timestamp, or code.',
      );
    }

    this.shopifyOAuthUtils.validateCallbackTimestamp(query.timestamp);

    const shopDomain = this.shopifyOAuthUtils
      .validateShopDomain(shopInput)
      .toLowerCase();
    this.shopifyOAuthUtils.verifyCallbackHmac(query, hmac);

    // Resolve and consume state exactly once to prevent callback replay.
    const stateHash = this.shopifyOAuthUtils.hashState(state, shopDomain);
    const attempt =
      await this.shopifyDao.findOAuthAttemptByStateHash(stateHash);
    if (
      !attempt ||
      attempt.consumedAt ||
      attempt.expiresAt.getTime() <= Date.now()
    ) {
      throw new ForbiddenException('Invalid or expired Shopify OAuth state.');
    }

    const consumed = await this.shopifyDao.consumeOAuthAttempt(attempt.id);
    if (!consumed) {
      throw new ForbiddenException(
        'Shopify OAuth state has already been used.',
      );
    }

    const tokenResponse = await this.shopifyApiClient.exchangeAuthorizationCode(
      shopDomain,
      code,
    );
    const accessToken = this.shopifyOAuthUtils.requireString(
      tokenResponse.access_token,
      'Shopify did not return an access token.',
    );
    const refreshToken = this.shopifyOAuthUtils.requireString(
      tokenResponse.refresh_token,
      'Shopify did not return a refresh token for the expiring offline token.',
    );
    const accessTokenLifetime = this.shopifyOAuthUtils.requirePositiveSeconds(
      tokenResponse.expires_in,
      'Shopify did not return a valid expires_in value.',
    );
    const refreshTokenLifetime = this.shopifyOAuthUtils.requirePositiveSeconds(
      tokenResponse.refresh_token_expires_in,
      'Shopify did not return a valid refresh_token_expires_in value.',
    );
    const grantedScopes = this.shopifyOAuthUtils.parseGrantedScopes(
      tokenResponse.scope,
    );
    const missingScopes = this.shopifyOAuthUtils
      .getRequestedScopes()
      .filter(
        (scope) => !this.shopifyOAuthUtils.scopeIsGranted(scope, grantedScopes),
      );

    if (missingScopes.length > 0) {
      throw new ForbiddenException(
        `Shopify did not grant the required scopes: ${missingScopes.join(', ')}`,
      );
    }

    const now = new Date();
    const accessTokenExpiresAt = new Date(
      now.getTime() + accessTokenLifetime * 1000,
    );
    const refreshTokenExpiresAt = new Date(
      now.getTime() + refreshTokenLifetime * 1000,
    );

    await this.shopifyApiClient.verifyAdminApiAccess(shopDomain, accessToken);

    await this.shopifyDao.saveConnectedShopAndMember({
      shopDomain,
      userId: attempt.userId,
      grantedScopes,
      accessTokenEncrypted: this.shopifyOAuthUtils.encryptToken(accessToken),
      refreshTokenEncrypted: this.shopifyOAuthUtils.encryptToken(refreshToken),
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      connectedAt: now,
    });

    return { shopDomain };
  }
}
