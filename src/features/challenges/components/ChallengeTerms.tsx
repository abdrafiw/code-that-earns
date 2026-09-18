import { Award, CalendarDays, ShieldCheck, Users } from 'lucide-react';
import type { TChallenge } from '../types';
import { formatChallengeDeadline } from '../utils/challengeDeadline';
import { formatOutcome } from '../utils/formatOutcome';

const outcomeLabels = {
  recognition: 'Recognition',
  monetary: 'Monetary reward',
  non_monetary: 'Non-monetary reward',
  recognition_and_reward: 'Recognition and reward',
} as const;

type TermProp = {
  icon: typeof Award;
  label: string;
  children: React.ReactNode;
};

const Term = ({ icon: Icon, label, children }: TermProp) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
        <Icon aria-hidden="true" className="size-4 text-indigo-500" />
        {label}
      </dt>
      <dd className="mt-2 text-sm leading-6 font-medium text-gray-900">
        {children}
      </dd>
    </div>
  );
};

export function ChallengeTerms({ challenge }: { challenge: TChallenge }) {
  const { outcome } = challenge;
  const recognition = outcome.recognitionLabel;

  return (
    <section aria-labelledby="challenge-terms" className="space-y-4">
      <h2 id="challenge-terms" className="text-lg font-semibold text-gray-950">
        Terms and outcome
      </h2>

      <dl className="grid gap-4 sm:grid-cols-2">
        <Term icon={ShieldCheck} label="Status">
          <span className="capitalize">{challenge.status ?? 'open'}</span>
        </Term>
        <Term icon={CalendarDays} label="Deadline">
          {formatChallengeDeadline(challenge.deadline)}
        </Term>
        <Term icon={Award} label="Outcome type">
          {outcomeLabels[outcome.type]}
        </Term>
        <Term icon={Award} label="Per winner">
          {formatOutcome(outcome)}
        </Term>
        <Term icon={Users} label="Number of winners">
          {challenge.winnerCount}
        </Term>
        <Term icon={Users} label="Eligibility">
          {challenge.eligibility}
        </Term>
        {recognition && outcome.type === 'recognition_and_reward' && (
          <Term icon={Award} label="Recognition">
            {recognition}
          </Term>
        )}
        {outcome.deliveryTerms && (
          <Term icon={ShieldCheck} label="Reward delivery terms">
            {outcome.deliveryTerms}
          </Term>
        )}
      </dl>

      {outcome.type !== 'recognition' && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Rewards are delivered directly by the organization outside CTE. CTE
          does not verify or guarantee delivery.
        </p>
      )}
    </section>
  );
}
