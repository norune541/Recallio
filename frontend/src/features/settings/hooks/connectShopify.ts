import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/common/api';

export function useConnectShopify() {
  return useMutation({
    mutationFn: async (shopDomain: string) => {
      const { data, error } = await authClient.GET(
        '/api/integrations/shopify/connect',
        { params: { query: { shop: shopDomain } } },
      );
      if (error || !data) throw error ?? new Error('Empty response');
      return data;
    },
  });
}
