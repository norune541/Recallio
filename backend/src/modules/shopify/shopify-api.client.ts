import '@shopify/shopify-api/adapters/node';

import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiVersion,
  GraphqlQueryError,
  HttpResponseError,
  Session,
  shopifyApi,
} from '@shopify/shopify-api';
import { env } from '../../config/env.js';
import type { ShopifyTokenResponse } from './shopify-oauth.utils.js';

const SHOPIFY_TIMEOUT_MS = 30_000;
const DEFAULT_SHOPIFY_API_VERSION = ApiVersion.October26;

export const redirectUrl = new URL(env.SHOPIFY_REDIRECT_URL);
export const apiVersion = resolveShopifyApiVersion(env.SHOPIFY_API_VERSION);
export const shopify: ReturnType<typeof shopifyApi> = shopifyApi({
  apiKey: env.SHOPIFY_CLIENT_ID,
  apiSecretKey: env.SHOPIFY_CLIENT_SECRET,
  scopes: env.SHOPIFY_SCOPES.split(',')
    .map((scope) => scope.trim())
    .filter(Boolean),
  hostName: redirectUrl.host,
  hostScheme: redirectUrl.protocol.replace(/:$/, '') as 'http' | 'https',
  apiVersion,
  isEmbeddedApp: false,
  isCustomStoreApp: false,
});

export function createShopifySession(
  shopDomain: string,
  accessToken: string,
  scope = 'read_products',
): Session {
  return new Session({
    id: crypto.randomUUID(),
    shop: shopDomain,
    state: '',
    isOnline: false,
    scope,
    accessToken,
    expires: new Date(Date.now() + 60 * 60 * 1000),
  });
}

export function createShopifyGraphqlClient(
  shopDomain: string,
  accessToken: string,
  scope = 'read_products',
) {
  const session = createShopifySession(shopDomain, accessToken, scope);
  return new shopify.clients.Graphql({ session });
}

@Injectable()
export class ShopifyApiClient {
  async exchangeAuthorizationCode(
    shopDomain: string,
    code: string,
  ): Promise<ShopifyTokenResponse> {
    let response: Response;
    try {
      response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({
          client_id: env.SHOPIFY_CLIENT_ID,
          client_secret: env.SHOPIFY_CLIENT_SECRET,
          code,
          expiring: '1',
        }),
        signal: AbortSignal.timeout(SHOPIFY_TIMEOUT_MS),
      });
    } catch {
      throw new ServiceUnavailableException(
        'Could not reach Shopify to exchange the authorization code.',
      );
    }

    if (!response.ok) {
      throw new BadGatewayException(
        `Shopify rejected the authorization-code exchange (HTTP ${response.status}).`,
      );
    }

    return this.readTokenResponse(response);
  }

  async refreshAccessToken(
    shopDomain: string,
    currentRefreshToken: string,
  ): Promise<ShopifyTokenResponse> {
    try {
      const { session } = await shopify.auth.refreshToken({
        shop: shopDomain,
        refreshToken: currentRefreshToken,
      });

      return {
        access_token: session.accessToken,
        refresh_token: session.refreshToken ?? currentRefreshToken,
        scope: session.scope,
        expires_in: this.toPositiveSeconds(session.expires),
        refresh_token_expires_in: this.toPositiveSeconds(
          session.refreshTokenExpires,
        ),
      };
    } catch (error) {
      if (error instanceof HttpResponseError) {
        const status = error.response?.code;
        if (status === 401) {
          throw new UnauthorizedException(
            'Shopify refresh token is invalid or expired. Reconnect the store.',
          );
        }
        if (status === 429 || (typeof status === 'number' && status >= 500)) {
          throw new ServiceUnavailableException(
            'Shopify is temporarily unavailable while refreshing the access token.',
          );
        }
      }

      if (error instanceof TypeError) {
        throw new ServiceUnavailableException(
          'Could not reach Shopify to refresh the access token. Retry the request.',
        );
      }

      throw new BadGatewayException(
        'Shopify rejected the token refresh request.',
      );
    }
  }

  async verifyAdminApiAccess(
    shopDomain: string,
    accessToken: string,
  ): Promise<void> {
    const session = new Session({
      id: crypto.randomUUID(),
      shop: shopDomain,
      state: '',
      isOnline: false,
      scope: 'read_products',
      accessToken,
      expires: new Date(Date.now() + SHOPIFY_TIMEOUT_MS),
    });

    const client = new shopify.clients.Graphql({ session });

    try {
      const response = await client.request<{ data?: { products?: unknown } }>(
        `query { products(first: 1) { edges { node { id } } } }`,
      );
      const payload = response as {
        data?: { products?: unknown };
        errors?: unknown;
      };

      if (
        typeof payload !== 'object' ||
        payload === null ||
        !('data' in payload) ||
        ('errors' in payload &&
          payload.errors !== undefined &&
          payload.errors !== null &&
          (!Array.isArray(payload.errors) || payload.errors.length > 0))
      ) {
        throw new BadGatewayException(
          'Shopify Admin API token verification returned GraphQL errors.',
        );
      }
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }
      if (error instanceof GraphqlQueryError) {
        throw new BadGatewayException(
          'Shopify Admin API token verification returned GraphQL errors.',
        );
      }
      if (error instanceof HttpResponseError) {
        const status = error.response?.code;
        if (typeof status === 'number') {
          throw new BadGatewayException(
            `Shopify Admin API rejected the access token (HTTP ${status}).`,
          );
        }
      }

      throw new ServiceUnavailableException(
        'Could not reach Shopify Admin API to verify the granted token.',
      );
    }
  }

  private async readTokenResponse(
    response: Response,
  ): Promise<ShopifyTokenResponse> {
    try {
      return (await response.json()) as ShopifyTokenResponse;
    } catch {
      throw new BadGatewayException(
        'Shopify returned an invalid JSON response.',
      );
    }
  }

  private toPositiveSeconds(date: Date | undefined): number | undefined {
    if (!date) return undefined;
    const seconds = Math.ceil((date.getTime() - Date.now()) / 1000);
    return seconds > 0 ? seconds : 1;
  }
}

function resolveShopifyApiVersion(version: string): ApiVersion {
  const trimmed = version.trim();
  const match = Object.values(ApiVersion).find(
    (candidate) => candidate === trimmed,
  );
  if (match) return match as ApiVersion;

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return DEFAULT_SHOPIFY_API_VERSION;
  }

  throw new BadRequestException(
    'SHOPIFY_API_VERSION must look like 2026-10 and match a Shopify API enum value.',
  );
}
