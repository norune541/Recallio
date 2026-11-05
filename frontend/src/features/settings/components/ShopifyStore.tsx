import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Store, ExternalLink, AlertCircle } from 'lucide-react';

import { RemoveStoreDialog } from './RemoveStore';
import { ConnectShopDialog } from './ConnectShopDialog';
import { LoadingShopSkeleton } from './LoadingShopSkeleton';

import { useIsMobile } from '@/common/hooks/use-mobile';
import { useShopify } from '../hooks/getShopify';
import { useConnectShopify } from '../hooks/connectShopify';

export function ShopifyStore() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [connectError, setConnectError] = useState<string | null>(null);

  const connect = useConnectShopify();

  const { data, isPending, isError, error } = useShopify();

  // Loading state
  if (isPending) {
    return <LoadingShopSkeleton />;
  }

  // Connected state
  if (data) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Store className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <CardTitle>{data.name}</CardTitle>
              <CardDescription className="truncate">
                {data.myshopifyDomain}
              </CardDescription>
            </div>

            {!isMobile && <RemoveStoreDialog />}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Shop owner</p>
              <p className="text-sm font-medium">{data.shopOwnerName}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="text-sm font-medium">{data.plan.displayName}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="text-sm font-medium">{data.currencyCode}</p>
            </div>

            <div className="min-w-0 space-y-1">
              <p className="text-sm text-muted-foreground">Store URL</p>

              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <span className="truncate">{data.myshopifyDomain}</span>
                <ExternalLink className="size-3.5 shrink-0" />
              </a>
            </div>
          </div>

          {data.setupRequired && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-sm font-medium">Setup required</p>
              <p className="text-sm text-muted-foreground">
                Complete the remaining setup steps to ensure your store
                integration works correctly.
              </p>
            </div>
          )}

          {isMobile && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge>Connected</Badge>
              <RemoveStoreDialog />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // User not found
  if (
    isError &&
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'USER_NOT_FOUND'
  ) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <AlertCircle className="size-5 text-muted-foreground" />
            </div>

            <div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                We couldn't verify your account.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-1">
            <p className="text-sm font-medium">Unexpected error</p>
            <p className="text-sm text-muted-foreground">
              We couldn't verify your account. Please reload this page. If that
              doesn't help, clear this site’s cookies and data in your browser
              settings, then try signing in again.
            </p>
          </div>

          <Button onClick={() => navigate('/login')}>Sign in again</Button>
        </CardContent>
      </Card>
    );
  }

  // Shopify store not connected
  if (
    isError &&
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'SHOP_NOT_FOUND'
  ) {
    return (
      <ConnectShopDialog
        isConnecting={connect.isPending}
        error={connectError}
        onConnect={(shopDomain) => {
          setConnectError(null);

          connect.mutate(shopDomain, {
            onSuccess: ({ url }) => {
              window.location.href = url;
            },
            onError: (error) => {
              setConnectError(error.message);
            },
          });
        }}
      />
    );
  }

  // Unexpected error
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <AlertCircle className="size-5 text-destructive" />
            </div>

            <div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>An unexpected error occurred.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-1">
            <p className="text-sm font-medium">Unexpected error</p>
            <p className="text-sm text-muted-foreground">
              We couldn't load your Shopify store information. Please try again
              later. If the problem persists, contact support.
            </p>
          </div>

          <Button onClick={() => window.location.reload()}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
