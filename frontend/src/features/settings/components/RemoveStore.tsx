import { useState } from 'react';
import { AlertCircle, Loader2, TriangleAlert, Trash2 } from 'lucide-react';

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

import { useRemoveMembership } from '../hooks/removeMembership';

export function RemoveStoreDialog() {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate, isPending } = useRemoveMembership();

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return;

    setOpen(nextOpen);

    if (nextOpen) {
      setFormError(null);
    }
  };

  const handleRemove = () => {
    setFormError(null);

    mutate(undefined, {
      onSuccess: () => {
        window.location.href = '/';
      },
      onError: (error) => {
        setFormError(
          error.message ?? 'We couldn’t remove your Shop. Please try again.',
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-destructive hover:text-destructive"
          disabled={isPending}
        >
          <Trash2 className="size-4" />
          Remove shop
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] p-6 sm:p-8">
        <DialogHeader className="gap-4">
          <div className="flex w-full justify-center">
            <div className="flex size-14 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10">
              <TriangleAlert className="size-7 text-destructive" />
            </div>
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-lg text-center mt-2">
              Remove shop?
            </DialogTitle>

            <DialogDescription className="text-sm leading-relaxed text-center mb-5">
              This will permanently delete this store and all its synced data
              from Recallio. This can't be undone.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

            <p className="text-sm text-muted-foreground leading-relaxed">
              This will permanently delete this Shopify store from Recallio,
              along with its synced conversations and settings. This action
              cannot be undone.
            </p>
          </div>
        </div>

        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{formError}</p>
          </div>
        )}

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="w-full gap-2 sm:w-auto"
            onClick={handleRemove}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Remove store
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
