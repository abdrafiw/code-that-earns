import type { AuthResponseSuccess } from '../features/auth/types';

export type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: AuthResponseSuccess }
  | { status: 'profile-missing' }
  | { status: 'error'; error: unknown };

export type AppContextType = {
  authState: AuthState;
  user: AuthResponseSuccess | null;
  isAuthLoading: boolean;
  retryAuthProfile: () => void;
};
