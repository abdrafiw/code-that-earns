import { screen, render } from '@testing-library/react';
import { ChallengeCard } from '../components/ChallengeCard';
import { formatChallengeDeadline } from '../utils/challengeDeadline';
import type { TChallenge } from '../types';
import { MemoryRouter } from 'react-router-dom';

const mockChallenge = {
  id: '1',
  title: 'build a react dashboard',
  outcome: { type: 'monetary', amountMinor: 10000, currency: 'USD' },
  winnerCount: 1,
  eligibility: 'Open to all developers.',
  deadline: new Date().toISOString(),
  description: 'Test Challenge Description',
  category: 'Test Category',
  difficulty: 'Easy',
  company: 'Acme Labs',
} as TChallenge;

const renderChallengeCard = (challenge: TChallenge = mockChallenge) => {
  return render(
    <MemoryRouter>
      <ChallengeCard challenge={challenge} />
    </MemoryRouter>,
  );
};

describe('Challenge card', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the card ui', () => {
    renderChallengeCard();

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: mockChallenge.title,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(mockChallenge.difficulty)).toBeInTheDocument();
    expect(screen.getByText(mockChallenge.description)).toBeInTheDocument();
    expect(screen.getByText(/\$100\.00 · 1 winner/)).toBeInTheDocument();
    expect(screen.getByText(`${mockChallenge.company}`)).toBeInTheDocument();
    expect(
      screen.getByText(formatChallengeDeadline(mockChallenge.deadline)),
    ).toBeInTheDocument();

    const submitLink = screen.getByRole('link', { name: /view and submit/i });
    expect(submitLink).toBeInTheDocument();
    expect(submitLink).toHaveAttribute('href', '/challenges/1');
  });

  it.each([
    ['beginner', 'bg-emerald-100'],
    ['intermediate', 'bg-amber-100'],
    ['advanced', 'bg-rose-100'],
  ] as const)(
    'applies correct styling for %s difficulty',
    (difficulty, expectedClass) => {
      renderChallengeCard({ ...mockChallenge, difficulty });
      expect(screen.getByText(difficulty)).toHaveClass(expectedClass);
    },
  );
});
