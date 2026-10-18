import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { env } from '../../../../config/env.js';
import { ShopifyDao } from '../../dao/shopify.dao.js';
import {
  OAUTH_ATTEMPT_TTL_MS,
  ShopifyOAuthUtils,
} from '../../shopify-oauth.utils.js';

@Injectable()
export class BeginShopifyAuthUseCase {
  constructor(
    private readonly shopifyDao: ShopifyDao,
    private readonly shopifyOAuthUtils: ShopifyOAuthUtils,
  ) {}

  /** Starts OAuth for a Clerk-authenticated user. Pass req.user.id, not the DB UUID. */
  async execute(
    clerkUserId: string,
    shopDomainInput: string | undefined,
  ): Promise<string> {
    const shopDomain = this.shopifyOAuthUtils
      .validateShopDomain(shopDomainInput)
      .toLowerCase();

    const user = await this.shopifyDao.findUserIdByClerkUserId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        'The signed-in Clerk user does not exist in Recallio yet.',
      );
    }

    // Only the hash is stored in the database; the raw state is sent to Shopify.
    const state = randomBytes(32).toString('hex');
    const stateHash = this.shopifyOAuthUtils.hashState(state, shopDomain);
    const expiresAt = new Date(Date.now() + OAUTH_ATTEMPT_TTL_MS);

    await this.shopifyDao.createOAuthAttempt({
      userId: user.id,
      stateHash,
      expiresAt,
    });

    const authorizationUrl = new URL(
      '/admin/oauth/authorize',
      `https://${shopDomain}`,
    );
    authorizationUrl.search = new URLSearchParams({
      client_id: env.SHOPIFY_CLIENT_ID,
      scope: this.shopifyOAuthUtils.getRequestedScopes().join(','),
      // Must exactly match a callback URL configured in the Shopify Dev Dashboard.
      redirect_uri: env.SHOPIFY_REDIRECT_URL,
      state,
    }).toString();

    return authorizationUrl.toString();
  }
}
