import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/common/api';
import type { components } from '@recallio/api-types';

type P = components['schemas'];

type ProductError =
  | P['UserNotFoundDto']
  | P['ShopNotFoundDto']
  | P['ShopifyShopBadGatewayErrorDto'];

export function useProduct(productId: string) {
  return useQuery<P['ProductResponseDto'], ProductError>({
    queryKey: ['product', productId],
    enabled: !!productId.trim(),

    queryFn: async () => {
      const { data, error } = await authClient.GET(
        '/api/integrations/shopify/products/{productId}',
        {
          params: {
            path: { productId },
          },
        },
      );

      if (error) throw error;
      if (!data) throw new Error('Product response is empty');

      console.log(data)
      return data;
    },
  });
}
