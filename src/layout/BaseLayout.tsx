import { Outlet } from 'react-router-dom';
import { Header } from './header';
import { NavigationLinks } from './header/components/NavigationLinks';
import { SettingsMenu } from './SettingsMenu';
import { useAppContext } from '../hooks/useAppContext';

export const BaseLayout = () => {
  const { user } = useAppContext();
  const isAuthenticated = user?.success === true;

  return (
    <div className="dashboard-shell min-h-screen bg-gray-50">
      <Header />

      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        {isAuthenticated && (
          <aside className="dashboard-sidebar hidden w-60 shrink-0 border-r border-gray-200 bg-white lg:block">
            <div className="sticky top-0 flex h-[calc(100dvh-4rem)] flex-col">
              <nav
                aria-label="Dashboard navigation"
                className="min-h-0 flex-1 overflow-y-auto px-4 py-7"
              >
                <NavigationLinks mobile />
              </nav>
              <div className="shrink-0 border-t border-gray-200 p-5">
                <SettingsMenu />
              </div>
            </div>
          </aside>
        )}

        <main className="dashboard-content min-w-0 flex-1 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
