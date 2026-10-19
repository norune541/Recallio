import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Store, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useIsMobile } from '@/common/hooks/use-mobile';

import { useShopify } from '../hooks/ShopifyHook';

export function ShopifyStore() {
  const { data, isPending, isError, error } = useShopify();
  const isMobile = useIsMobile();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-lg" />

            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-40 max-w-full" />
              <Skeleton className="h-4 w-48 max-w-full" />
            </div>

            {!isMobile && (
              <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {['Shop owner', 'Plan', 'Email', 'Currency', 'Store URL'].map(
              (label) => (
                <div key={label} className="min-w-0 space-y-2">
                  <Skeleton className="h-4 w-20 max-w-full" />
                  <Skeleton className="h-4 w-32 max-w-full" />
                </div>
              ),
            )}
          </div>

          {/* Setup required */}
          <Skeleton className="h-16 w-full rounded-lg" />

          {/* Plan badge and mobile Connected badge */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-28 rounded-full" />

            {isMobile && <Skeleton className="h-6 w-24 rounded-full" />}
          </div>
        </CardContent>
      </Card>
    );
  }

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

            {isMobile ? null : <Badge variant="default">Connected</Badge>}
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
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="break-all text-sm font-medium">{data.email}</p>
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

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {data.plan.shopifyPlus ? 'Shopify Plus' : data.plan.displayName}
            </Badge>
            {isMobile ? <Badge variant="default">Connected</Badge> : null}
          </div>
        </CardContent>
      </Card>
    );
  }
  if (isError && 'code' in error && error.code === 'SHOP_NOT_FOUND') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Store className="size-5" />
            </div>

            <div>
              <CardTitle>Shopify shop</CardTitle>
              <CardDescription>
                Connect and manage your Shopify store.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Shopify store</p>
              <p className="text-sm text-muted-foreground">
                Connect your store to start syncing conversations.
              </p>
            </div>

            <Badge variant="secondary">Not connected</Badge>
          </div>

          <Button
            variant="outline"
            onClick={() =>
              toast.info('Coming soon', {
                description: 'Shopify integration is not available yet.',
              })
            }
          >
            Connect store
          </Button>
        </CardContent>
      </Card>
    );
  }
}
