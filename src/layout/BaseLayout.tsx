import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Header } from './header';
import { NavigationLinks } from './header/components/NavigationLinks';
import { SettingsMenu } from './SettingsMenu';
import { useAppContext } from '../hooks/useAppContext';

export const BaseLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useAppContext();
  const isAuthenticated = user?.success === true;
  const platformName =
    user?.success && user.user.role === 'ORGANIZATION'
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
            className={`flex h-16 shrink-0 items-center border-b border-gray-200 ${
              isSidebarCollapsed ? 'justify-center px-2' : 'px-4'
            }`}
          >
            <Link
              to="/"
              className={`flex min-w-0 items-center font-semibold text-gray-950 ${
                isSidebarCollapsed ? 'justify-center' : 'flex-1 gap-3'
              }`}
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
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() =>
            setIsSidebarCollapsed((collapsed) => !collapsed)
          }
        />

        <main className="dashboard-content min-w-0 flex-1 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
