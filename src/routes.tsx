import { createBrowserRouter } from 'react-router-dom';
import { BaseLayout } from './layout/BaseLayout';
import { RouteErrorPage } from './components/common/RouteErrorPage';
import { NotFoundPage } from './components/common/NotFoundPage';
import {
  GuestOnlyRoute,
  ProtectedRoute,
} from './features/auth/components/RouteGuards';

export const router = createBrowserRouter([
  {
    element: <GuestOnlyRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/login',
        lazy: async () => {
          const { LoginPage } = await import('./features/auth/pages/LoginPage');
          return { Component: LoginPage };
        },
      },
      {
        path: '/sign-up',
        lazy: async () => {
          const { SignUpPage } =
            await import('./features/auth/pages/SignUpPage');
          return { Component: SignUpPage };
        },
      },
    ],
  },
  {
    element: <BaseLayout />,
    path: '/',
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import('./features/home/pages/HomePage');
          return { Component: HomePage };
        },
      },

      {
        element: <ProtectedRoute allowedRoles={['DEVELOPER']} />,
        children: [
          {
            path: 'dev-bounties',
            lazy: async () => {
              const { DevBountiesPage } =
                await import('./features/bounties/pages/DevBountiesPage');
              return { Component: DevBountiesPage };
            },
          },
          {
            path: 'submissions',
            lazy: async () => {
              const { DeveloperSubmissionsPage } =
                await import('./features/submissions/pages/DeveloperSubmissionsPage');
              return { Component: DeveloperSubmissionsPage };
            },
          },
          {
            path: 'submit/:bountyId',
            lazy: async () => {
              const { SubmitSolutionPage } =
                await import('./features/submissions/pages/SubmitSolutionPage');
              return { Component: SubmitSolutionPage };
            },
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['COMPANY']} />,
        children: [
          {
            path: 'company-bounties',
            lazy: async () => {
              const { CompanyBountiesPage } =
                await import('./features/bounties/pages/CompanyBountiesPage');
              return { Component: CompanyBountiesPage };
            },
          },
          {
            path: 'company-submissions',
            lazy: async () => {
              const { CompanySubmissionsPage } =
                await import('./features/submissions/pages/CompanySubmissionsPage');
              return { Component: CompanySubmissionsPage };
            },
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'transactions',
            lazy: async () => {
              const { TransactionsPage } =
                await import('./features/transactions/pages/TransactionsPage');
              return { Component: TransactionsPage };
            },
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
