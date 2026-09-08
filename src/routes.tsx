import { createBrowserRouter } from 'react-router-dom';
import { BaseLayout } from './layout/BaseLayout';
import { HomePage } from './features/home/pages/HomePage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignUpPage } from './features/auth/pages/SignUpPage';
import { CompanyBountiesPage } from './features/bounties/pages/CompanyBountiesPage';
import { DevBountiesPage } from './features/bounties/pages/DevBountiesPage';
import { CompanySubmissionsPage } from './features/submissions/pages/CompanySubmissionsPage';
import { DeveloperSubmissionsPage } from './features/submissions/pages/DeveloperSubmissionsPage';
import { SubmitSolutionPage } from './features/submissions/pages/SubmitSolutionPage';
import { TransactionsPage } from './features/transactions/pages/TransactionsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/sign-up',
    element: <SignUpPage />,
  },
  {
    element: <BaseLayout />,
    path: '/',
    // errorElement: <Error />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },

      {
        path: 'dev-bounties',
        children: [
          {
            index: true,
            element: <DevBountiesPage />,
          },
        ],
      },

      {
        path: 'company-bounties',
        children: [
          {
            index: true,
            element: <CompanyBountiesPage />,
          },
        ],
      },

      {
        path: 'transactions',
        children: [
          {
            index: true,
            element: <TransactionsPage />,
          },
        ],
      },

      {
        path: 'submissions',
        children: [
          {
            index: true,
            element: <DeveloperSubmissionsPage />,
          },
        ],
      },

      {
        path: 'company-submissions',
        children: [
          {
            index: true,
            element: <CompanySubmissionsPage />,
          },
        ],
      },

      {
        path: 'submit/:bountyId',
        element: <SubmitSolutionPage />,
      },
    ],
  },
]);
