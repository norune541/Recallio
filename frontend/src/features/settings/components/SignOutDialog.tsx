import { useState } from 'react';
import { useClerk } from '@clerk/react';
import { LogOut } from 'lucide-react';

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-destructive hover:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] p-10">
        <DialogHeader>
          <DialogTitle>Sign out of your account?</DialogTitle>
          <DialogDescription>
            Are you sure you want to sign out? You will need to sign back in to
            access your account.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-3 sm:gap-4">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button variant="destructive" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
