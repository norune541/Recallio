import { useState } from 'react';
import { Bell, Store } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import AccountSettings from '../components/AccountSettings';

export function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  function handleSave() {
    toast.info('Coming soon', {
      description: 'Settings are not saved to the server yet.',
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your workspace and preferences.
        </p>
      </div>

      {/* Workspace */}
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

      {/* Account */}
      <AccountSettings />

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Bell className="size-5" />
            </div>

            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose which updates you want to receive.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="email-notifications">Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive important updates about your workspace.
              </p>
            </div>

            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="weekly-summary">Weekly summary</Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly overview of customer conversations.
              </p>
            </div>

            <Switch
              id="weekly-summary"
              checked={weeklySummary}
              onCheckedChange={setWeeklySummary}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save changes</Button>
      </div>
    </div>
  );
}
