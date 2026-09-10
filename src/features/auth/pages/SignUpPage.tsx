import { SignUpForm } from '../components/SignUpForm';
import { AuthPageLayout } from '../components/AuthPageLayout';

export const SignUpPage = () => {
  return (
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
