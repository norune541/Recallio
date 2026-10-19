import { authClient } from '@/common/api';
import { useQuery } from '@tanstack/react-query';
import type { components } from '@recallio/api-types';

type S = components['schemas'];
type ShopError =
  | S['ShopNotFoundDto']
  | S['ShopifyShopBadGatewayErrorDto']
  | S['UserNotFoundDto'];

export function useShopify() {
  return useQuery<S['ShopifyShopDto'], ShopError>({
    queryKey: ['shopify'],
    queryFn: async () => {
      const { data, error } = await authClient.GET(
        '/api/integrations/shopify/shop',
      );
      if (error) throw error;
      return data;
    },
    retry: false,
  });
}
