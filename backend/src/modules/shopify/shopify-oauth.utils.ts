import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import { env } from '../../config/env.js';

export const OAUTH_ATTEMPT_TTL_MS = 15 * 60 * 1000;
export const TOKEN_REFRESH_WINDOW_MS = 60 * 1000;

const SHOP_DOMAIN_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

export interface ShopifyTokenResponse {
  access_token?: unknown;
  refresh_token?: unknown;
  scope?: unknown;
  expires_in?: unknown;
  refresh_token_expires_in?: unknown;
  error?: unknown;
}

@Injectable()
export class ShopifyOAuthUtils {
  validateShopDomain(shopDomain: string | undefined): string {
    if (
      typeof shopDomain !== 'string' ||
      !SHOP_DOMAIN_PATTERN.test(shopDomain.trim())
    ) {
      throw new BadRequestException('Invalid Shopify shop domain.');
    }
    return shopDomain.trim();
  }

  hashState(state: string, shopDomain: string): string {
    return createHash('sha256')
      .update(`${shopDomain.toLowerCase()}:${state}`)
      .digest('hex');
  }

  normalizeQuery(rawQuery: Record<string, unknown>): Record<string, string> {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawQuery)) {
      if (typeof value !== 'string') {
        throw new BadRequestException(
          `Shopify callback contains an invalid query parameter: ${key}`,
        );
      }
      normalized[key] = value;
    }
    return normalized;
  }

  verifyCallbackHmac(
    query: Record<string, string>,
    receivedHmac: string,
  ): void {
    if (!/^[a-f0-9]{64}$/i.test(receivedHmac)) {
      throw new ForbiddenException('Invalid Shopify callback HMAC.');
    }

    const message = Object.entries(query)
      .filter(([key]) => key !== 'hmac')
      .sort(([keyA], [keyB]) => (keyA < keyB ? -1 : keyA > keyB ? 1 : 0))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const expected = createHmac('sha256', env.SHOPIFY_CLIENT_SECRET)
      .update(message)
      .digest();
    const received = Buffer.from(receivedHmac, 'hex');

    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      throw new ForbiddenException('Invalid Shopify callback HMAC.');
    }
  }

  validateCallbackTimestamp(timestamp: string | undefined): void {
    if (typeof timestamp !== 'string' || !/^\d+$/.test(timestamp.trim())) {
      throw new ForbiddenException(
        'Shopify callback timestamp is missing or invalid.',
      );
    }

    const seconds = Number(timestamp);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw new ForbiddenException('Shopify callback timestamp is invalid.');
    }

    const timestampMs = seconds * 1000;
    const ageMs = Math.abs(Date.now() - timestampMs);
    if (ageMs > OAUTH_ATTEMPT_TTL_MS) {
      throw new ForbiddenException(
        'Shopify callback timestamp is stale or from the future.',
      );
    }
  }

  getRequestedScopes(): string[] {
    const scopes = env.SHOPIFY_SCOPES.split(',')
      .map((scope) => scope.trim())
      .filter(Boolean);

    if (scopes.length === 0) {
      throw new BadRequestException(
        'SHOPIFY_SCOPES must contain at least one scope.',
      );
    }
    return [...new Set(scopes)];
  }

  parseGrantedScopes(scopeValue: unknown): string[] {
    if (typeof scopeValue !== 'string' || !scopeValue.trim()) {
      throw new BadGatewayException('Shopify did not return granted scopes.');
    }

    return [
      ...new Set(
        scopeValue
          .split(',')
          .map((scope) => scope.trim())
          .filter(Boolean),
      ),
    ];
  }

  scopeIsGranted(requestedScope: string, grantedScopes: string[]): boolean {
    if (grantedScopes.includes(requestedScope)) return true;
    // Shopify documents that write_<resource> also grants the matching read scope.
    return (
      requestedScope.startsWith('read_') &&
      grantedScopes.includes(`write_${requestedScope.slice('read_'.length)}`)
    );
  }

  requireString(value: unknown, errorMessage: string): string {
    if (typeof value !== 'string' || value.length === 0) {
      throw new BadGatewayException(errorMessage);
    }
    return value;
  }

  requirePositiveSeconds(value: unknown, errorMessage: string): number {
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw new BadGatewayException(errorMessage);
    }
    return seconds;
  }

  encryptToken(token: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
    const ciphertext = Buffer.concat([
      cipher.update(token, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return `v1:${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext.toString('hex')}`;
  }

  decryptToken(encryptedToken: string): string {
    const [version, ivHex, authTagHex, ciphertextHex] =
      encryptedToken.split(':');
    if (
      version !== 'v1' ||
      !ivHex ||
      !authTagHex ||
      ciphertextHex === undefined
    ) {
      throw new Error(
        'Stored Shopify token has an unsupported encryption format.',
      );
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.getEncryptionKey(),
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextHex, 'hex')),
      decipher.final(),
    ]).toString('utf8');
  }

  private getEncryptionKey(): Buffer {
    const hexKey = env.SHOPIFY_TOKEN_ENCRYPTION_KEY;
    if (!/^[a-f0-9]{64}$/i.test(hexKey)) {
      throw new Error(
        'SHOPIFY_TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).',
      );
    }
    return Buffer.from(hexKey, 'hex');
  }
}
