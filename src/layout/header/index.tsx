import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { RoleIndicator } from './components/RoleIndicator';
import { MobileNavigationSheet } from './components/MobileNavigationSheet';

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

type HeaderProps = {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export const Header = ({
  isSidebarCollapsed,
  onToggleSidebar,
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const { user } = useAppContext();

  const name = user?.success
    ? user.user.companyName || user.user.name || 'User'
    : '';

  const platformName =
    user?.success && user.user.role === 'COMPANY'
      ? user.user.companyName || 'Code That Earns'
      : 'Code That Earns';

  const handleLogout = async () => {
    try {
      toast.promise(authService.signOut(), {
        loading: 'Logging you out...',
        success: 'Logged out successfully!',
        error: 'Failed to log out.',
      });

      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <header
      className={`relative z-40 border-b ${
        user?.success
          ? 'border-gray-200 bg-white'
          : 'border-slate-200/80 bg-slate-50'
      }`}
    >
      <div className="flex min-h-16 w-full items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        {/* logo */}
        <Link
          to="/"
          className={`min-w-0 items-center gap-3 font-semibold text-gray-950 ${
            user?.success ? 'flex lg:hidden' : 'flex'
          }`}
          title={platformName}
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-[11px] font-bold tracking-tight text-white shadow-sm"
            aria-hidden="true"
          >
            CTE
          </span>
          <span className="hidden max-w-[45vw] min-w-0 text-sm leading-5 font-bold tracking-wide wrap-break-word whitespace-normal uppercase sm:block lg:max-w-md">
            {platformName}
          </span>
        </Link>

        {user?.success && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden size-9 shrink-0 text-gray-600 hover:bg-gray-100 hover:text-gray-950 lg:inline-flex"
            onClick={onToggleSidebar}
            aria-label={
              isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-5" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-5" />
            )}
          </Button>
        )}

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
              <div className="hidden items-center gap-3 lg:flex">
                <RoleIndicator />

                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    className="flex cursor-pointer items-center gap-5"
                  >
                    <Avatar className="size-9 bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200">
                      <AvatarFallback className="bg-transparent">
                        {name && name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Logout
                        </DropdownMenuItem>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>

                          <AlertDialogDescription>
                            You will be logged out of your account. You can sign
                            in again at any time.
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

              {/* mobile menu button */}
              <div className="flex items-center gap-3 lg:hidden">
                <RoleIndicator />

                <Avatar className="hidden size-8.75 bg-slate-950 text-slate-50">
                  <AvatarFallback className="bg-transparent text-sm">
                    {name && name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <MobileNavigationSheet
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                  onLogout={handleLogout}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
