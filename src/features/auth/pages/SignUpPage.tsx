import { SignUpForm } from '../components/SignUpForm';
import { AuthPageLayout } from '../components/AuthPageLayout';

export const SignUpPage = () => {
  return (
    <AuthPageLayout
      wide
      title="Join CTE"
      description="Choose your role and set up your workspace."
    >
      <SignUpForm />
    </AuthPageLayout>
  );
};
