import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompleteShopifyAuthUseCase } from './use-cases/complete-shopify-auth.use-case.js';

describe('CompleteShopifyAuthUseCase', () => {
  let useCase: CompleteShopifyAuthUseCase;
  let dao: any;
  let oAuthUtils: any;
  let apiClient: any;

  beforeEach(() => {
    dao = {
      findOAuthAttemptByStateHash: vi.fn(),
      consumeOAuthAttempt: vi.fn(),
      saveConnectedShopAndMember: vi.fn(),
    };

    oAuthUtils = {
      normalizeQuery: vi.fn(),
      validateShopDomain: vi.fn(),
      verifyCallbackHmac: vi.fn(),
      hashState: vi.fn(),
      getRequestedScopes: vi.fn(() => ['read_products']),
      requireString: vi.fn((value: unknown) => {
        if (typeof value !== 'string' || value.length === 0) {
          throw new Error('missing string');
        }
        return value;
      }),
      requirePositiveSeconds: vi.fn((value: unknown) => Number(value)),
      parseGrantedScopes: vi.fn((value: unknown) => {
        if (typeof value !== 'string') return [];
        return value
          .split(',')
          .map((scope) => scope.trim())
          .filter(Boolean);
      }),
      scopeIsGranted: vi.fn((requested: string, granted: string[]) =>
        granted.includes(requested),
      ),
      validateCallbackTimestamp: vi.fn(),
    };

    apiClient = {
      exchangeAuthorizationCode: vi.fn(),
      verifyAdminApiAccess: vi.fn(),
    };

    useCase = new CompleteShopifyAuthUseCase(dao, oAuthUtils, apiClient);
  });

  it('rejects stale Shopify callback timestamps before exchanging tokens', async () => {
    const staleTimestamp = String(
      Math.floor((Date.now() - 16 * 60 * 1000) / 1000),
    );
    const query = {
      hmac: 'valid-hmac',
      state: 'state-123',
      shop: 'example.myshopify.com',
      code: 'auth-code',
      timestamp: staleTimestamp,
    };

    oAuthUtils.normalizeQuery.mockReturnValue(query);
    oAuthUtils.validateShopDomain.mockReturnValue('example.myshopify.com');
    oAuthUtils.validateCallbackTimestamp.mockImplementation(
      (timestamp: string | undefined) => {
        if (typeof timestamp !== 'string') {
          throw new ForbiddenException(
            'Shopify callback timestamp is missing or invalid.',
          );
        }

        const seconds = Number(timestamp);
        const ageMs = Math.abs(Date.now() - seconds * 1000);
        if (
          !Number.isFinite(seconds) ||
          seconds <= 0 ||
          ageMs > 15 * 60 * 1000
        ) {
          throw new ForbiddenException(
            'Shopify callback timestamp is stale or from the future.',
          );
        }
      },
    );
    oAuthUtils.hashState.mockReturnValue('hashed-state');
    dao.findOAuthAttemptByStateHash.mockResolvedValue({
      id: 'attempt-123',
      userId: 'user-123',
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
    });
    dao.consumeOAuthAttempt.mockResolvedValue(true);
    apiClient.exchangeAuthorizationCode.mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      expires_in: 3600,
      refresh_token_expires_in: 604800,
      scope: 'read_products',
    });

    await expect(useCase.execute(query)).rejects.toThrow(ForbiddenException);
    expect(apiClient.exchangeAuthorizationCode).not.toHaveBeenCalled();
  });
});
