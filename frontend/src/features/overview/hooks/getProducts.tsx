import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { authClient } from '@/common/api';
import type { components } from '@recallio/api-types';

type P = components['schemas'];
type ProductsPage = P['ShopifyProductsResponseDto'];
type ProductsError = P['UserNotFoundDto'] | P['ShopNotFoundDto'];

export function useProducts(limit = 10) {
  return useInfiniteQuery<
    ProductsPage,
    ProductsError,
    InfiniteData<ProductsPage, string | null>,
    ['products', { limit: number }],
    string | null
  >({
    queryKey: ['products', { limit }],
    initialPageParam: null,

    queryFn: async ({ pageParam }) => {
      const { data, error } = await authClient.GET(
        '/api/integrations/shopify/products',
        { params: { query: { after: pageParam ?? undefined, limit } } },
      );

      if (error) throw error;
      return data;
    },

    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage
        ? (lastPage.pageInfo.endCursor ?? undefined)
        : undefined,
  });
}
