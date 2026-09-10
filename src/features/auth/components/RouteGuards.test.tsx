import { render, screen } from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AppContext } from '../../../context/AppContext';
import type { AppContextType, AuthState } from '../../../context/types';
import { GuestOnlyRoute, ProtectedRoute } from './RouteGuards';

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
const companyState: AuthState = {
  status: 'authenticated',
  user: {
    success: true,
    user: {
      uid: 'company-1',
      email: 'company@example.com',
      role: 'COMPANY',
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
            <Route path="/transactions" element={<p>Transactions page</p>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['DEVELOPER']} />}>
            <Route path="/dev-bounties" element={<p>Developer dashboard</p>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['COMPANY']} />}>
            <Route
              path="/company-bounties"
              element={<p>Company dashboard</p>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </AppContext.Provider>,
  );
}

describe('route guards', () => {
  it('redirects anonymous users to login', () => {
    renderRoutes(anonymousState, '/transactions');

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('redirects users away from routes for another role', () => {
    renderRoutes(developerState, '/company-bounties');

    expect(screen.getByText('Developer dashboard')).toBeInTheDocument();
  });

  it('renders routes allowed for the authenticated role', () => {
    renderRoutes(companyState, '/company-bounties');

    expect(screen.getByText('Company dashboard')).toBeInTheDocument();
  });

  it('redirects authenticated users away from guest-only routes', () => {
    renderRoutes(companyState, '/login');

    expect(screen.getByText('Company dashboard')).toBeInTheDocument();
  });
});
