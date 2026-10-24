import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/common/api';

export function useRemoveMembership() {
  return useMutation({
    mutationFn: async () => {
      const response = await authClient.DELETE('/api/integrations/shopify');
      const { error } = response;
      if (error) throw error;
    },
  });
}
