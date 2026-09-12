import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useAppContext } from './hooks/useAppContext';
import { AppSkeleton } from './components/common/PageSkeleton';
import { AuthProfileState } from './features/auth/components/AuthProfileState';

const AppContent = () => {
  const { authState, retryAuthProfile } = useAppContext();

  if (authState.status === 'loading') {
    return (
      <>
        <AppSkeleton pathname={router.state.location.pathname} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  if (authState.status === 'profile-missing' || authState.status === 'error') {
    return (
      <>
        <AuthProfileState
          status={authState.status}
          error={authState.status === 'error' ? authState.error : undefined}
          onRetry={retryAuthProfile}
        />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </div>
  );
};

function App() {
  return <AppContent />;
}

export default App;
