import { LoginForm } from '../components/LoginForm';
import { AuthPageLayout } from '../components/AuthPageLayout';

export const LoginPage = () => {
  return (
    <AuthPageLayout
      title="Sign in to CTE"
      description="Enter your details to access your workspace."
    >
      <LoginForm />
    </AuthPageLayout>
  );
};
