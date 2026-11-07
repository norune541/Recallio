import { useState } from 'react';

import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { useShopify } from '@/common/hooks/getShopify';
import { useConnectShopify } from '@/features/settings/hooks/connectShopify';

import { RemoveStoreDialog } from '@/features/settings/components/RemoveStore';
import { ConnectShopDialog } from '../settings/components/ConnectShopDialog';
import { LoadingShopSkeleton } from '../settings/components/LoadingShopSkeleton';

import shopifyLogo from '../../public/shopify.svg';

function hasErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

function StoreDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function ShopifyBrand() {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background">
      <img src={shopifyLogo} alt="Shopify" className="size-7 object-contain" />
    </div>
  );
}

export function IntegrationsPage() {
  const [connectError, setConnectError] = useState<string | null>(null);
  const { data, isPending, isError, error, refetch } = useShopify();
  const connect = useConnectShopify();
  const isShopNotFound = hasErrorCode(error, 'SHOP_NOT_FOUND');

  function handleConnect(shopDomain: string) {
    setConnectError(null);

    connect.mutate(shopDomain, {
      onSuccess: ({ url }) => {
        window.location.href = url;
      },
      onError: (error) => {
        setConnectError(getErrorMessage(error));
      },
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      {/* Page heading */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>

        <p className="text-sm text-muted-foreground">
          Connect and manage the services that power your Recallio workspace.
        </p>
      </header>

      {/* Loading state */}
      {isPending && <LoadingShopSkeleton />}
      {/* Connected state */}
      {!isPending && data && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <ShopifyBrand />

                <div className="min-w-0">
                  <CardTitle>Shopify</CardTitle>
                  <CardDescription>
                    Your store is connected to Recallio.
                  </CardDescription>
                </div>
              </div>

              <Badge variant={data.setupRequired ? 'secondary' : 'default'}>
                {data.setupRequired ? 'Setup required' : 'Connected'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-6 pt-5">
            {/* Store identity */}
            <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Connected store
                </p>

                <p className="truncate text-base font-semibold">{data.name}</p>

                <p className="truncate text-sm text-muted-foreground">
                  {data.myshopifyDomain}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-fit"
                render={
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <ExternalLink data-icon="inline-start" />
                Visit store
              </Button>
            </div>

            {/* Setup notice */}
            {data.setupRequired && (
              <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">
                    Additional setup required
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Complete the remaining setup steps to ensure your store
                    integration works correctly.
                  </p>
                </div>
              </div>
            )}

            {/* Store metadata */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-medium">Store information</h3>

                <p className="text-sm text-muted-foreground">
                  Details retrieved from your Shopify account.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <StoreDetail
                  label="Store owner"
                  value={data.shopOwnerName || 'Not provided'}
                />

                <StoreDetail
                  label="Shopify plan"
                  value={data.plan.displayName}
                />

                <StoreDetail label="Store currency" value={data.currencyCode} />
              </div>
            </div>

            <Separator />

            {/* Integration actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 shrink-0" />
                Connected to your Recallio workspace
              </div>

              <RemoveStoreDialog />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disconnected state */}
      {!isPending && !data && (!isError || isShopNotFound) && (
        <ConnectShopDialog
          isConnecting={connect.isPending}
          error={connectError}
          onConnect={handleConnect}
        />
      )}

      {/* Unexpected error state */}
      {!isPending && !data && isError && !isShopNotFound && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                <AlertCircle className="size-5 text-muted-foreground" />
              </div>

              <div>
                <CardTitle>Unable to load integrations</CardTitle>
                <CardDescription>
                  We couldn't retrieve your Shopify connection details.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Please try again. If the problem persists, check your connection
              and sign-in status.
            </p>

            <div>
              <Button
                variant="outline"
                onClick={() => {
                  void refetch();
                }}
              >
                <RefreshCw data-icon="inline-start" />
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
