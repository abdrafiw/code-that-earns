import { render, screen } from '@testing-library/react';
import type { TChallenge } from '../types';
import { ChallengeTerms } from './ChallengeTerms';

const baseChallenge: TChallenge = {
  id: 'challenge-1',
  title: 'Accessible dashboard',
  description: 'Build the dashboard.',
  category: 'Coding',
  company: 'Acme Labs',
  difficulty: 'Intermediate',
  deadline: '2030-06-30T23:59:59.999Z',
  status: 'open',
  winnerCount: 2,
  eligibility: 'Developers with a public repository.',
  geographicRestrictions: 'Ghana only.',
  outcome: { type: 'recognition', recognitionLabel: 'CTE Excellence Award' },
};

describe('ChallengeTerms', () => {
  it('shows every material term for recognition-only challenges', () => {
    render(<ChallengeTerms challenge={baseChallenge} />);

    expect(screen.queryByText('Acme Labs')).not.toBeInTheDocument();
    expect(screen.getByText('Recognition')).toBeInTheDocument();
    expect(screen.getByText('CTE Excellence Award')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(
      screen.getByText('Developers with a public repository.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ghana only.')).toBeInTheDocument();
    expect(
      screen.queryByText(/does not verify or guarantee delivery/i),
    ).not.toBeInTheDocument();
  });

  it('shows locale-formatted reward, recognition, and delivery terms', () => {
    render(
      <ChallengeTerms
        challenge={{
          ...baseChallenge,
          outcome: {
            type: 'recognition_and_reward',
            recognitionLabel: 'Gold winner',
            amountMinor: 125050,
            currency: 'USD',
            deliveryTerms: 'Paid by bank transfer within 14 days.',
          },
        }}
      />,
    );

    expect(screen.getByText(/\$1,250\.50/)).toBeInTheDocument();
    expect(screen.getByText('Gold winner')).toBeInTheDocument();
    expect(
      screen.getByText('Paid by bank transfer within 14 days.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/does not verify or guarantee delivery/i),
    ).toBeInTheDocument();
  });
});
