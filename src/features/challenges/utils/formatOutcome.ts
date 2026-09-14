import type { ChallengeOutcome } from '../../../services/firestore-structure';

export function formatMoney(amountMinor: number, currency: string, locale?: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amountMinor / 100);
}

export function formatOutcome(outcome: ChallengeOutcome, locale?: string) {
  if (outcome.amountMinor && outcome.currency) return formatMoney(outcome.amountMinor, outcome.currency, locale);
  if (outcome.rewardDescription) return outcome.rewardDescription;
  return outcome.recognitionLabel ?? 'Recognition';
}
