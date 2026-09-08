import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../../hooks/useAppContext';
import { LoginForm } from '../components/LoginForm';
import { AuthPageLayout } from '../components/AuthPageLayout';

export const LoginPage = () => {
  const { user } = useAppContext();

  return user?.success ? (
    <Navigate to="/" />
  ) : (
    <AuthPageLayout
      eyebrow="Welcome back"
      title="Sign in to CTE"
      description="Enter your details to access your workspace."
    >
      <LoginForm />
    </AuthPageLayout>
  );
};
