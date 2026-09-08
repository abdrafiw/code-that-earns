import { Menu, Code2 } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../components/ui/sheet';

import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { RoleIndicator } from './components/RoleIndicator';
import { NavigationLinks } from './components/NavigationLinks';
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
} from '../../components/ui/alert-dialog';

export const Header = () => {
  const [name, setName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { user, setUser } = useAppContext();

  const handleLogout = async () => {
    try {
      toast.promise(authService.signOut(), {
        loading: 'Logging you out...',
        success: 'Logged out successfully!',
        error: 'Failed to log out.',
      });

      setUser(null);
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    if (user?.success) {
      setName(user?.user?.companyName || user?.user?.name || 'User');
    }
  }, [user]);

  return (
    <header
      className={`relative z-40 border-b ${
        user?.success
          ? 'border-gray-200 bg-white'
          : 'border-slate-200/80 bg-[#fbfaf8]'
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* logo */}
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 text-lg font-semibold tracking-tight text-gray-950"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm">
            <Code2 className="size-5" aria-hidden="true" />
          </span>
          <span className="max-w-[45vw] truncate lg:max-w-md">
            {user?.success && user.user.role === 'COMPANY'
              ? user.user.companyName || 'CTE'
              : 'CTE'}
          </span>
        </Link>

        {/* desktop navigation */}
        <RoleIndicator mobile />

        {/* right side - auth/user */}
        <div className="flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/login"
                className="text-primary hover:text-primary-hover px-2 py-2 text-sm transition-colors sm:px-4 sm:text-base"
              >
                Login
              </Link>

              <Link
                to="/sign-up"
                className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-sm px-3 py-2 text-sm transition-colors sm:px-6 sm:text-base"
              >
                Signup
              </Link>
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                <div className="flex items-center gap-3">
                  <RoleIndicator />

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      className="flex cursor-pointer items-center gap-5"
                    >
                      <Avatar className="size-9 bg-orange-50 text-orange-700 ring-1 ring-orange-200">
                        <AvatarFallback className="bg-transparent">
                          {name && name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            Logout
                          </DropdownMenuItem>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>

                            <AlertDialogDescription>
                              You will be logged out of your account. You can
                              sign in again at any time.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>

                            <AlertDialogAction
                              onClick={handleLogout}
                              className="bg-destructive text-white"
                            >
                              Logout
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* mobile menu button */}
              <div className="flex items-center gap-3 lg:hidden">
                <Avatar className="hidden size-[35px] bg-slate-950 text-slate-50">
                  <AvatarFallback className="bg-transparent text-sm">
                    {name && name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <Sheet
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                >
                  <SheetTrigger asChild>
                    <button
                      className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                      aria-label="Toggle menu"
                    >
                      <Menu className="h-6 w-6" />
                    </button>
                  </SheetTrigger>

                  <SheetContent
                    side="left"
                    className="w-[300px] sm:w-[350px]"
                    aria-describedby={undefined}
                  >
                    <SheetHeader className="hidden">
                      <SheetTitle></SheetTitle>
                    </SheetHeader>

                    <div className="mt-10 flex h-full flex-col">
                      <nav className="flex-1 p-6">
                        <NavigationLinks
                          mobile={true}
                          onLinkClick={() => setIsMobileMenuOpen(false)}
                        />
                      </nav>

                      {/* mobile logout button */}
                      <div className="border-t border-gray-200 p-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="text-sm font-medium text-red-600 transition-colors hover:text-red-700">
                              Logout
                            </button>
                          </AlertDialogTrigger>

                          <AlertDialogContent className="">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                You will be logged out of your account. You can
                                sign in again at any time.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleLogout}
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
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
