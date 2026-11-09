import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/common/api';

type SyncStatus = 'IDLE' | 'PENDING' | 'CONNECTED' | 'FAILED';

export function useSyncShopify() {
  const queryClient = useQueryClient();

  const syncQuery = useQuery({
    queryKey: ['shopify', 'sync'],
    queryFn: async (): Promise<SyncStatus> => {
      const { data, error } = await authClient.POST(
        '/api/integrations/shopify/sync',
      );
      if (error) throw error;
      return data.status;
    },

    refetchInterval: (query) => (query.state.data === 'PENDING' ? 2000 : false),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (syncQuery.data === 'CONNECTED') {
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    }
  }, [syncQuery.data, queryClient]);

  return {
    syncStatus: syncQuery.data,
    isSyncing: syncQuery.data === 'PENDING',
    isSyncError: syncQuery.data === 'FAILED',
    isLoading: syncQuery.isLoading,
    error: syncQuery.error,
  };
}
