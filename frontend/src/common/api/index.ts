import createClient from 'openapi-fetch';
import type { Middleware } from 'openapi-fetch';
import type { paths } from '@recallio/api-types';
import type { Clerk } from '@clerk/types';

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

export const authClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
});
authClient.use(authMiddleware);
