import type { UserRole } from '../services/firestore-structure';
import type { FormErrors } from '../hooks/useTypedForm';

export type LoginFormValues = { email: string; password: string };
export type SignUpFormValues = LoginFormValues & {
  confirmPassword: string;
  name: string;
  companyName: string;
  role: UserRole | null;
};
export type ChallengeFormValues = {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  rewardBTC: number;
  deadline?: Date;
};
export type SubmissionFormValues = {
  githubUrl: string;
  bitcoinAddress: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const bitcoinAddressPattern = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;

export function validateLogin(values: LoginFormValues) {
  const errors: FormErrors<LoginFormValues> = {};
  if (!emailPattern.test(values.email.trim()))
    errors.email = 'Please enter a valid email address';
  if (!values.password) errors.password = 'Enter your password.';
  return errors;
}

export function validateSignUp(values: SignUpFormValues) {
  const errors: FormErrors<SignUpFormValues> = validateLogin(values);
  if (!values.role) errors.role = 'Select an account type.';
  if (values.role === 'DEVELOPER' && !values.name.trim())
    errors.name = 'Enter your full name.';
  if (values.role === 'COMPANY' && !values.companyName.trim())
    errors.companyName = 'Enter your company name.';
  if (values.password.length < 6)
    errors.password = 'Password must contain at least 6 characters.';
  if (values.confirmPassword !== values.password)
    errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

export function validateChallenge(values: ChallengeFormValues) {
  const errors: FormErrors<ChallengeFormValues> = {};
  const title = values.title.trim();
  const description = values.description.trim();
  if (title.length < 3 || title.length > 120)
    errors.title = 'Title must contain between 3 and 120 characters.';
  if (description.length < 10 || description.length > 5000)
    errors.description =
      'Description must contain between 10 and 5,000 characters.';
  if (!values.category) errors.category = 'Select a category.';
  if (!values.difficulty) errors.difficulty = 'Select a difficulty.';
  if (
    !Number.isFinite(values.rewardBTC) ||
    values.rewardBTC <= 0 ||
    values.rewardBTC > 21
  )
    errors.rewardBTC = 'Reward must be greater than zero and at most 21 BTC.';
  if (!values.deadline || values.deadline < new Date())
    errors.deadline = 'Select a future deadline.';
  return errors;
}

export function validateSubmission(values: SubmissionFormValues) {
  const errors: FormErrors<SubmissionFormValues> = {};
  try {
    const url = new URL(values.githubUrl.trim());
    if (url.protocol !== 'https:' || url.hostname !== 'github.com')
      throw Error();
  } catch {
    errors.githubUrl = 'Enter a valid HTTPS GitHub repository URL.';
  }
  if (!bitcoinAddressPattern.test(values.bitcoinAddress.trim()))
    errors.bitcoinAddress = 'Enter a valid Bitcoin address.';
  return errors;
}

export const hasFormErrors = <T>(errors: FormErrors<T>) =>
  Object.keys(errors).length > 0;
