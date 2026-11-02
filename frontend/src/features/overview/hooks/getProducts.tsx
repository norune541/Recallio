import { useInfiniteQuery } from '@tanstack/react-query';
import { authClient } from '@/common/api';
import type { components } from '@recallio/api-types';

type P = components['schemas'];
type ProductsError =
  | P['UserNotFoundDto']
  | P['ShopNotFoundDto']
  | P['ShopifyShopBadGatewayErrorDto'];

export function useProducts(limit = 10) {
  return useInfiniteQuery<P['ShopifyProductsResponseDto'], ProductsError>({
    queryKey: ['products', { limit }],
    initialPageParam: null as string | null,

    queryFn: async ({ pageParam }) => {
      const { data, error } = await authClient.GET(
        '/api/integrations/shopify/products',
        {
          params: {
            query: {
              after: typeof pageParam === 'string' ? pageParam : undefined,
              limit,
            },
          },
        },
      );

      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage) => {
      const pageData = lastPage.pageInfo;

      if (pageData?.hasNextPage && pageData?.endCursor) {
        return pageData.endCursor;
      }

      return undefined;
    },
  });
}
