import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAppContext } from '../../../hooks/useAppContext';
import type { UserRole } from '../types';

const getRoleHome = (role: UserRole) =>
  role === 'COMPANY' ? '/company-bounties' : '/dev-bounties';

type ProtectedRouteProps = {
  allowedRoles?: readonly UserRole[];
};

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { authState } = useAppContext();
  const location = useLocation();

  if (authState.status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = authState.user.user.role;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getRoleHome(role)} replace />;
  }

  return <Outlet />;
}

export function GuestOnlyRoute() {
  const { authState } = useAppContext();

  if (authState.status === 'authenticated') {
    return <Navigate to={getRoleHome(authState.user.user.role)} replace />;
  }

  return <Outlet />;
}
