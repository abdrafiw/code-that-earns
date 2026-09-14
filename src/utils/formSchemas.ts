import type { UserRole } from '../services/firestore-structure';
import type { FormErrors } from '../hooks/useTypedForm';
import type { OutcomeType } from '../services/firestore-structure';
import {
  isSupportedCurrency,
  parseMoneyToMinorUnits,
} from '../features/challenges/utils/formatOutcome';

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
  outcomeType: OutcomeType;
  recognitionLabel: string;
  amountMajor: string;
  currency: string;
  rewardDescription: string;
  deliveryTerms: string;
  winnerCount: number;
  eligibility: string;
  geographicRestrictions: string;
  acceptsOffPlatformResponsibility: boolean;
  deadline?: Date;
};
export type SubmissionFormValues = {
  githubUrl: string;
  liveDemoUrl: string;
  notes: string;
  publicWinnerConsent: boolean;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    !Number.isInteger(values.winnerCount) ||
    values.winnerCount < 1 ||
    values.winnerCount > 10
  )
    errors.winnerCount = 'Winner count must be between 1 and 10.';
  if (!values.eligibility.trim())
    errors.eligibility = 'Describe who is eligible.';
  if (!values.geographicRestrictions.trim())
    errors.geographicRestrictions = 'Enter restrictions or “None”.';
  const recognition =
    values.outcomeType === 'recognition' ||
    values.outcomeType === 'recognition_and_reward';
  const rewarded =
    values.outcomeType === 'monetary' ||
    values.outcomeType === 'recognition_and_reward';
  if (recognition && !values.recognitionLabel.trim())
    errors.recognitionLabel = 'Enter a recognition label.';
  const currency = values.currency.trim().toUpperCase();
  if (rewarded && !isSupportedCurrency(currency))
    errors.currency = 'Enter a supported three-letter ISO currency code.';
  if (rewarded && isSupportedCurrency(currency)) {
    try {
      parseMoneyToMinorUnits(values.amountMajor, currency);
    } catch {
      errors.amountMajor = `Enter a positive amount valid for ${currency}.`;
    }
  }
  if (values.outcomeType === 'non_monetary' && !values.rewardDescription.trim())
    errors.rewardDescription = 'Describe the reward.';
  if (
    (rewarded || values.outcomeType === 'non_monetary') &&
    !values.deliveryTerms.trim()
  )
    errors.deliveryTerms =
      'Describe how and when the company will deliver the reward.';
  if (!values.acceptsOffPlatformResponsibility)
    errors.acceptsOffPlatformResponsibility =
      'Confirm that your company is responsible for the stated outcome.';
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
  if (values.liveDemoUrl.trim()) {
    try {
      if (new URL(values.liveDemoUrl.trim()).protocol !== 'https:')
        throw Error();
    } catch {
      errors.liveDemoUrl = 'Enter a valid HTTPS demo URL.';
    }
  }
  if (values.notes.trim().length > 2000)
    errors.notes = 'Notes must be 2,000 characters or fewer.';
  return errors;
}

export const hasFormErrors = <T>(errors: FormErrors<T>) =>
  Object.keys(errors).length > 0;
