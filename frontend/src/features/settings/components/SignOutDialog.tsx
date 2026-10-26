import { useState } from 'react';
import { useClerk } from '@clerk/react';
import { Loader2, LogOut, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function SignOutDialog() {
  const { signOut } = useClerk();

  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return;

    setOpen(nextOpen);

    if (nextOpen) {
      setFormError(null);
    }
  };

  const handleSignOut = async () => {
    setFormError(null);
    setIsPending(true);

    try {
      await signOut();
    } catch {
      setFormError('We couldn’t sign you out. Please try again.');
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 rounded-[8px] text-destructive hover:text-destructive"
          disabled={isPending}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-xl p-6 sm:max-w-[425px] sm:p-8">
        <DialogHeader className="gap-4">
          <div className="flex w-full justify-center">
            <div className="flex size-14 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10">
              <TriangleAlert className="size-7 text-destructive" />
            </div>
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-lg text-center mt-2">
              Sign out of your account?
            </DialogTitle>

            <DialogDescription className="text-sm leading-relaxed text-center mb-5">
              Are you sure you want to sign out? You’ll need to sign back in to
              access your account.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-3">
          <div className="flex items-start gap-3">
            <LogOut className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

            <p className="text-sm leading-relaxed text-muted-foreground">
              You can sign back in anytime using your account credentials.
            </p>
          </div>
        </div>

        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <p>{formError}</p>
          </div>
        )}

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-full rounded-[8px] sm:w-auto"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-8 w-full gap-2 rounded-[8px] sm:w-auto"
            onClick={handleSignOut}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="size-4" />
                Sign out
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
