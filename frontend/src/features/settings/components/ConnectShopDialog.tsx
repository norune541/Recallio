import { useState } from 'react';
import type { FormEvent } from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';

import { Store, ArrowLeftRight, AlertCircle } from 'lucide-react';

import logo from '../../../public/logo.svg';
import shopify from '../../../public/shopify.svg';

type ConnectShopDialogProps = {
  isConnecting: boolean;
  error?: string | null;
  onConnect: (shopDomain: string) => void;
};

export function ConnectShopDialog({
  isConnecting,
  onConnect,
}: ConnectShopDialogProps) {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [shopDomain, setShopDomain] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

    onConnect(normalizedDomain);
  };

  const handleOpenChange = (open: boolean) => {
    setConnectDialogOpen(open);

    if (!open) {
      setFormError(null);
    }
  };

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
              Connect your store to start analyzing your products.
            </p>
          </div>

          <Badge variant="secondary">Not connected</Badge>
        </div>

        <Button variant="outline" onClick={() => handleOpenChange(true)}>
          Connect store
        </Button>

        <Dialog open={connectDialogOpen} onOpenChange={handleOpenChange}>
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
                  className="text-sm font-medium block"
                >
                  Store domain
                </label>

                <Input
                  id="shop-domain"
                  placeholder="example.myshopify.com"
                  value={shopDomain}
                  onChange={(event) => {
                    setShopDomain(event.target.value);

                    if (formError) {
                      setFormError(null);
                    }
                  }}
                  autoComplete="url"
                  required
                  disabled={isConnecting}
                  aria-invalid={Boolean(formError)}
                  aria-describedby={
                    formError ? 'shop-domain-error' : 'shop-domain-hint'
                  }
                  className={
                    formError
                      ? 'border-destructive focus-visible:ring-destructive'
                      : ''
                  }
                />

                {formError && (
                  <div
                    id="shop-domain-error"
                    role="alert"
                    className="flex items-center gap-2 text-xs text-destructive"
                  >
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <p
                  id="shop-domain-hint"
                  className="text-xs text-muted-foreground mt-3"
                >
                  Use your permanent myshopify.com domain.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isConnecting}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isConnecting}>
                  {isConnecting ? 'Connecting...' : 'Connect store'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
