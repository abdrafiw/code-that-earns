import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useAppContext } from './hooks/useAppContext';
import { AppSkeleton } from './components/common/PageSkeleton';

function AppContent() {
  const { isAuthLoading } = useAppContext();

  if (isAuthLoading) {
    return (
      <>
        <AppSkeleton pathname={router.state.location.pathname} />
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
}

function App() {
  return <AppContent />;
}

export default App;
