import { render, screen } from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AppContext } from '../../../context/AppContext';
import type { AppContextType, AuthState } from '../../../context/types';
import { GuestOnlyRoute, ProtectedRoute } from '../components/RouteGuards';

jest.mock('../../../config/firebase', () => ({
  auth: {},
  db: {},
}));

const anonymousState: AuthState = { status: 'anonymous' };

const developerState: AuthState = {
  status: 'authenticated',
  user: {
    success: true,
    user: {
      uid: 'developer-1',
      email: 'developer@example.com',
      role: 'DEVELOPER',
    },
  },
};

const organizationState: AuthState = {
  status: 'authenticated',
  user: {
    success: true,
    user: {
      uid: 'company-1',
      email: 'company@example.com',
      role: 'ORGANIZATION',
    },
  },
};

function renderRoutes(authState: AuthState, initialPath: string) {
  const contextValue: AppContextType = {
    authState,
    user: authState.status === 'authenticated' ? authState.user : null,
    isAuthLoading: authState.status === 'loading',
    retryAuthProfile: () => undefined,
  };

  return render(
    <AppContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<GuestOnlyRoute />}>
            <Route path="/login" element={<p>Login page</p>} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<p>Protected page</p>} />
            <Route path="/challenges" element={<p>Challenges page</p>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['ORGANIZATION']} />}>
            <Route
              path="/organization-only"
              element={<p>Organization dashboard</p>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </AppContext.Provider>,
  );
}

describe('route guards', () => {
  it('redirects anonymous users to login', () => {
    renderRoutes(anonymousState, '/protected');

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('redirects users away from routes for another role', () => {
    renderRoutes(developerState, '/organization-only');

    expect(screen.getByText('Challenges page')).toBeInTheDocument();
  });

  it('renders routes allowed for the authenticated role', () => {
    renderRoutes(organizationState, '/organization-only');

    expect(screen.getByText('Organization dashboard')).toBeInTheDocument();
  });

  it('redirects authenticated users away from guest-only routes', () => {
    renderRoutes(organizationState, '/login');

    expect(screen.getByText('Challenges page')).toBeInTheDocument();
  });
});
