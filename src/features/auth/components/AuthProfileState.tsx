import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { useSignOut } from '../hooks/useAuth';

type AuthProfileStateProps = {
  status: 'profile-missing' | 'error';
  error?: unknown;
  onRetry: () => void;
};

export function AuthProfileState({
  status,
  error,
  onRetry,
}: AuthProfileStateProps) {
  const signOutMutation = useSignOut();
  const isMissing = status === 'profile-missing';

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <section
        aria-labelledby="auth-profile-state-title"
        className="w-full max-w-lg space-y-5 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <AlertTriangle aria-hidden="true" className="size-6" />
        </span>

        <h1
          id="auth-profile-state-title"
          className="text-2xl font-semibold text-gray-950"
        >
          {isMissing ? 'Account profile missing' : 'Profile unavailable'}
        </h1>

        <p className="text-sm leading-6 text-gray-600">
          {isMissing
            ? 'Your sign-in is valid, but the matching account profile could not be found. Retry if your account was just created, or sign out and contact support.'
            : getErrorMessage(error)}
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => signOutMutation.mutate()}
            disabled={signOutMutation.isPending}
          >
            {signOutMutation.isPending ? 'Signing out…' : 'Sign out'}
          </Button>

          <Button type="button" onClick={onRetry}>
            <RefreshCw aria-hidden="true" className="size-4" />
            Retry profile
          </Button>
        </div>
      </section>
    </main>
  );
}
