import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Store, ExternalLink, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { RemoveMembershipDialog } from './RemoveMembership';

import { useIsMobile } from '@/common/hooks/use-mobile';
import { useShopify } from '../hooks/getShopify';
import { useConnectShopify } from '../hooks/connectShopify';

import logo from '../../../public/logo.svg';
import shopify from '../../../public/shopify.svg';

export function ShopifyStore() {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [shopDomain, setShopDomain] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const connect = useConnectShopify();

  const { data, isPending, isError, error } = useShopify();
  const isMobile = useIsMobile();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const normalizedDomain = shopDomain
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '');

    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(normalizedDomain)) {
      setFormError('Enter a valid domain like example.myshopify.com.');
      return;
    }

    connect.mutate(normalizedDomain, {
      onSuccess: ({ url }) => {
        window.location.href = url;
      },
      onError: () => {
        setFormError('Could not start the connection. Please try again.');
      },
    });
  };

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

            {!isMobile && <RemoveMembershipDialog />}
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
          {isMobile && (
            <div className="flex flex-wrap items-center gap-2">
              <RemoveMembershipDialog />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isError && 'code' in error && error.code === 'USER_NOT_FOUND') {
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

          <Button
            onClick={() => {
              navigate('/login');
            }}
          >
            Sign in again
          </Button>
        </CardContent>
      </Card>
    );
  }
  if (
    isError &&
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'SHOP_NOT_FOUND'
  ) {
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
            onClick={() => {
              setFormError(null);
              setConnectDialogOpen(true);
            }}
          >
            Connect store
          </Button>

          <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
            <DialogContent className="sm:max-w-md px-8 py-8 min-h-96 flex flex-col justify-between">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <img
                    src={logo}
                    alt="Recallio"
                    className="size-10 object-contain"
                  />
                  <ArrowLeftRight className="size-4 text-muted-foreground" />
                  <img
                    src={shopify}
                    alt="Shopify"
                    className="size-10 object-contain"
                  />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Connect Shopify to Recallio
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Enter your Shopify store domain to connect it to Recallio.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label
                    htmlFor="shop-domain"
                    className="text-sm font-medium block mb-2"
                  >
                    Store domain
                  </label>
                  <Input
                    id="shop-domain"
                    placeholder="example.myshopify.com"
                    value={shopDomain}
                    onChange={(event) => {
                      setShopDomain(event.target.value);
                      if (formError) setFormError(null);
                    }}
                    autoComplete="url"
                    required
                    className={
                      formError
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                  />
                  {formError && (
                    <div className="flex items-center gap-2 text-xs text-destructive animate-in fade-in-50">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground block mt-5">
                    Use your permanent myshopify.com domain.
                  </p>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConnectDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={connect.isPending}>
                    {connect.isPending ? 'Connecting...' : 'Connect store'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

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
