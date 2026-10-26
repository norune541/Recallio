import createClient from 'openapi-fetch';
import type { Middleware } from 'openapi-fetch';
import type { paths } from '@recallio/api-types';
import type { Clerk } from '@clerk/types';

type RateLimitHandler = (retryAfter?: number) => void;
let triggerRateLimitUi: RateLimitHandler = () => {};

export const injectRateLimitHandler = (handler: RateLimitHandler) => {
  triggerRateLimitUi = handler;
};

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const clerk = (window as Window & { Clerk?: Clerk }).Clerk;

    const token = await clerk?.session?.getToken();

    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }

    return request;
  },
};

const rateLimitMiddleware: Middleware = {
  async onResponse({ response }) {
    if (response.status === 429) {
      const retryAfterHeader = response.headers.get('retry-after');
      const parsed = retryAfterHeader ? parseInt(retryAfterHeader, 10) : NaN;
      const seconds =
        Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;

      triggerRateLimitUi(seconds);
    }
    return response;
  },
};
export const authClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
});

authClient.use(authMiddleware);
authClient.use(rateLimitMiddleware);
