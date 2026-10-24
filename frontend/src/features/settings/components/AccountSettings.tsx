import { useClerk, useUser } from '@clerk/react';
import { UserRound } from 'lucide-react';

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
import { Skeleton } from '@/components/ui/skeleton';

import { SignOutDialog } from './SignOutDialog';
import { useIsMobile } from '@/common/hooks/use-mobile';

function AccountSettings() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openUserProfile } = useClerk();
  const isMobile = useIsMobile();

  const username = user?.username;
  const email = user?.primaryEmailAddress?.emailAddress;

  const accountInfo = !isLoaded ? (
    <div className="space-y-2">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-4 w-48" />
    </div>
  ) : (
    <div className="min-w-0 space-y-1">
      <p className="truncate text-sm font-medium">
        {username || email || 'Your account'}
      </p>

      <p className="truncate text-sm text-muted-foreground">
        {email || 'No primary email address'}
      </p>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <UserRound className="size-5" />
            </div>

            <div>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account information.
              </CardDescription>
            </div>
          </div>

          {!isMobile && <SignOutDialog />}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <Label>Account information</Label>

        <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          {accountInfo}

          <div className="flex shrink-0 items-center gap-3">
            {isLoaded && isSignedIn && (
              <Badge className="border-transparent bg-primary text-primary-foreground hover:bg-primary/90">
                Active
              </Badge>
            )}

            <Button
              variant="outline"
              size="sm"
              disabled={!isLoaded || !isSignedIn}
              onClick={() => openUserProfile()}
            >
              Manage account
            </Button>
          </div>
        </div>
        {isMobile && <SignOutDialog />}
      </CardContent>
    </Card>
  );
}

export default AccountSettings;
