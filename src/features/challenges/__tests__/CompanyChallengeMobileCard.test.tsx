import { render, screen } from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';

import { CompanyChallengeMobileCard } from '../components/CompanyChallengeMobileCard';
import type { TChallenge } from '../types';

const challenge: TChallenge = {
  id: 'challenge-1',
  title: 'Design an accessible mobile checkout experience',
  description: 'Create a complete checkout flow.',
  category: 'UI/UX Design',
  difficulty: 'Intermediate',
  company: 'Acme',
  deadline: '2030-06-30T23:59:59.999Z',
  winnerCount: 1,
  submissions: 7,
  eligibility: 'Open to all designers.',
  status: 'open',
  outcome: { type: 'recognition', recognitionLabel: 'Design winner' },
};

describe('CompanyChallengeMobileCard', () => {
  it('shows the challenge details needed on a mobile screen', () => {
    render(<CompanyChallengeMobileCard challenge={challenge} />);

    expect(
      screen.getByRole('heading', { name: challenge.title }),
    ).toBeInTheDocument();
    expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Design winner')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
