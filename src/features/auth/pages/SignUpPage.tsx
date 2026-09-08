import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../../hooks/useAppContext';
import { SignUpForm } from '../components/SignUpForm';
import { AuthPageLayout } from '../components/AuthPageLayout';

export const SignUpPage = () => {
  const { user } = useAppContext();

  return user?.success ? (
    <Navigate to="/" />
  ) : (
    <AuthPageLayout
      wide
      eyebrow="Create your account"
      title="Join CTE"
      description="Choose your role and set up your workspace."
    >
      <SignUpForm />
    </AuthPageLayout>
  );
};
