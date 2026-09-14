import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Header } from './header';
import { NavigationLinks } from './header/components/NavigationLinks';
import { SettingsMenu } from './SettingsMenu';
import { useAppContext } from '../hooks/useAppContext';
import { Button } from '../components/ui/button';

export const BaseLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useAppContext();
  const isAuthenticated = user?.success === true;
  const platformName =
    user?.success && user.user.role === 'COMPANY'
      ? user.user.companyName || 'Code That Earns'
      : 'Code That Earns';

  return (
    <div className="dashboard-shell flex min-h-screen bg-gray-50">
      {isAuthenticated && (
        <aside
          className={`dashboard-sidebar sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200 lg:flex ${
            isSidebarCollapsed ? 'w-20' : 'w-60'
          }`}
        >
          <div
            className={`flex h-16 shrink-0 items-center justify-between border-b border-gray-200 ${
              isSidebarCollapsed ? 'gap-1 px-1' : 'gap-3 px-4'
            }`}
          >
            <Link
              to="/"
              className="flex min-w-0 flex-1 items-center gap-3 font-semibold text-gray-950"
              title={isSidebarCollapsed ? platformName : undefined}
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-[11px] font-bold tracking-tight text-white shadow-sm"
                aria-hidden="true"
              >
                CTE
              </span>
              {!isSidebarCollapsed && (
                <span className="min-w-0 flex-1 truncate text-sm font-bold tracking-wide whitespace-nowrap uppercase">
                  {platformName}
                </span>
              )}
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-gray-600 hover:bg-gray-100 hover:text-gray-950"
              onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
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
          </div>

          <nav
            aria-label="Dashboard navigation"
            className={`min-h-0 flex-1 overflow-y-auto py-7 ${
              isSidebarCollapsed ? 'px-2' : 'px-4'
            }`}
          >
            <NavigationLinks collapsed={isSidebarCollapsed} />
          </nav>

          <div
            className={`flex shrink-0 border-t border-gray-200 p-3 ${
              isSidebarCollapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <SettingsMenu />
          </div>
        </aside>
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />

        <main className="dashboard-content min-w-0 flex-1 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
