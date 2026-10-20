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
const SESSION_TTL_MS = 60 * 60 * 1000;

const VERIFY_ACCESS_QUERY = `#graphql
  query VerifyAccess {
    products(first: 1) {
      edges { node { id } }
    }
  }
`;

const API_VERSIONS: readonly string[] = Object.values(ApiVersion);

function isApiVersion(value: string): value is ApiVersion {
  return API_VERSIONS.includes(value);
}

function resolveShopifyApiVersion(version: string): ApiVersion {
  const trimmed = version.trim();
  if (isApiVersion(trimmed)) return trimmed;

  throw new Error(
    `SHOPIFY_API_VERSION "${trimmed}" is not supported by the installed ` +
      `@shopify/shopify-api. Supported: ${API_VERSIONS.join(', ')}`,
  );
}

function getHttpStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return undefined;
  }

  const { response } = error;
  if (
    typeof response !== 'object' ||
    response === null ||
    !('code' in response)
  ) {
    return undefined;
  }

  return typeof response.code === 'number' ? response.code : undefined;
}

function hasGraphqlErrors(payload: unknown): boolean {
  if (typeof payload !== 'object' || payload === null) return true;
  if (!('data' in payload)) return true;
  if (!('errors' in payload)) return false;

  const { errors } = payload;
  if (errors === undefined || errors === null) return false;
  return !Array.isArray(errors) || errors.length > 0;
}

function isShopifyTokenResponse(value: unknown): value is ShopifyTokenResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'access_token' in value &&
    typeof value.access_token === 'string' &&
    value.access_token.length > 0
  );
}

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
    expires: new Date(Date.now() + SESSION_TTL_MS),
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
  /** Transport layer: it only talks to Shopify. It does not read/write app state or persist tokens. */
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
      const message = `Shopify rejected the authorization-code exchange (HTTP ${response.status}).`;
      const isClientError =
        response.status >= 400 &&
        response.status < 500 &&
        response.status !== 429;

      throw isClientError
        ? new BadRequestException(message)
        : new BadGatewayException(message);
    }

    return await this.readTokenResponse(response);
  }

  async refreshAccessToken(
    shopDomain: string,
    currentRefreshToken: string,
  ): Promise<ShopifyTokenResponse> {
    return this.exchangeRefreshToken(shopDomain, currentRefreshToken);
  }

  async exchangeRefreshToken(
    shopDomain: string,
    currentRefreshToken: string,
  ): Promise<ShopifyTokenResponse> {
    let session: Session;
    try {
      ({ session } = await shopify.auth.refreshToken({
        shop: shopDomain,
        refreshToken: currentRefreshToken,
      }));
    } catch (error) {
      throw this.toRefreshException(error);
    }

    return {
      access_token: session.accessToken,
      refresh_token: session.refreshToken ?? currentRefreshToken,
      scope: session.scope,
      expires_in: this.toPositiveSeconds(session.expires),
      refresh_token_expires_in: this.toPositiveSeconds(
        session.refreshTokenExpires,
      ),
    };
  }

  async verifyAdminApiAccess(
    shopDomain: string,
    accessToken: string,
  ): Promise<void> {
    const client = createShopifyGraphqlClient(shopDomain, accessToken);

    try {
      const response: unknown = await client.request(VERIFY_ACCESS_QUERY);

      if (hasGraphqlErrors(response)) {
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
        const status = getHttpStatus(error);
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

  private toRefreshException(error: unknown): Error {
    if (error instanceof HttpResponseError) {
      const status = getHttpStatus(error);

      if (status === 401) {
        return new UnauthorizedException(
          'Shopify refresh token is invalid or expired. Reconnect the store.',
        );
      }
      if (status === 429 || (typeof status === 'number' && status >= 500)) {
        return new ServiceUnavailableException(
          'Shopify is temporarily unavailable while refreshing the access token.',
        );
      }
    }

    if (error instanceof TypeError) {
      return new ServiceUnavailableException(
        'Could not reach Shopify to refresh the access token. Retry the request.',
      );
    }

    return new BadGatewayException(
      'Shopify rejected the token refresh request.',
    );
  }

  private async readTokenResponse(
    response: Response,
  ): Promise<ShopifyTokenResponse> {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new BadGatewayException(
        'Shopify returned an invalid JSON response.',
      );
    }

    if (!isShopifyTokenResponse(body)) {
      throw new BadGatewayException(
        'Shopify returned an unexpected token response.',
      );
    }

    return body;
  }

  private toPositiveSeconds(date: Date | undefined): number | undefined {
    if (!date) return undefined;
    const seconds = Math.ceil((date.getTime() - Date.now()) / 1000);
    return seconds > 0 ? seconds : 1;
  }
}
