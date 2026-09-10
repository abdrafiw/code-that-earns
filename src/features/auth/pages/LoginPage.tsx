import { LoginForm } from '../components/LoginForm';
import { AuthPageLayout } from '../components/AuthPageLayout';

export const LoginPage = () => {
  return (
    <AuthPageLayout
      eyebrow="Welcome back"
      title="Sign in to CTE"
      description="Enter your details to access your workspace."
    >
      <LoginForm />
    </AuthPageLayout>
  );
};
