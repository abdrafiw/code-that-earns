import { Menu } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../components/ui/alert-dialog';

import { Button } from '../../../components/ui/button';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../../components/ui/sheet';
import { NavigationLinks } from './NavigationLinks';

type MobileNavigationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
};

export function MobileNavigationSheet({
  open,
  onOpenChange,
  onLogout,
}: MobileNavigationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900"
          aria-label="Open navigation menu"
        >
          <Menu aria-hidden="true" className="size-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-75 sm:w-87.5">
        <SheetHeader className="sr-only">
          <SheetTitle>Dashboard navigation</SheetTitle>
          <SheetDescription>
            Navigate between your dashboard pages or sign out.
          </SheetDescription>
        </SheetHeader>

        <div className="flex h-full flex-col pt-10">
          <nav aria-label="Mobile dashboard navigation" className="flex-1 p-6">
            <NavigationLinks mobile onLinkClick={() => onOpenChange(false)} />
          </nav>

          <div className="border-t border-gray-200 p-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="text-sm font-medium text-red-600 transition-colors hover:text-red-700">
                  Logout
                </button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be logged out of your account. You can sign in
                    again at any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onLogout}
                    className="bg-destructive text-white"
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
