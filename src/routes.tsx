import { Navigate, createBrowserRouter, redirect } from 'react-router-dom';
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
            path: 'submissions',
            lazy: async () => {
              const { DeveloperSubmissionsPage } =
                await import('./features/submissions/pages/DeveloperSubmissionsPage');
              return { Component: DeveloperSubmissionsPage };
            },
          },
          {
            path: 'challenges/:challengeId',
            lazy: async () => {
              const { SubmitSolutionPage } =
                await import('./features/submissions/pages/SubmitSolutionPage');
              return { Component: SubmitSolutionPage };
            },
          },
          {
            path: 'submit/:challengeId',
            loader: ({ params }) =>
              redirect(`/challenges/${params.challengeId ?? ''}`),
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['COMPANY']} />,
        children: [
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
            path: 'challenges',
            lazy: async () => {
              const { ChallengesPage } =
                await import('./features/challenges/pages/ChallengesPage');
              return { Component: ChallengesPage };
            },
          },
          {
            path: 'dev-challenges',
            element: <Navigate to="/challenges" replace />,
          },
          {
            path: 'company-challenges',
            element: <Navigate to="/challenges" replace />,
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
