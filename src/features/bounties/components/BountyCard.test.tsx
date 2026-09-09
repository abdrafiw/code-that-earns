import { screen, render } from '@testing-library/react';
import { BountyCard } from './BountyCard';
import { formatBountyDeadline } from '../utils/bountyDeadline';
import type { TBounty } from '../types';
import { MemoryRouter } from 'react-router-dom';

const mockBounty = {
  id: '1',
  title: 'build a react dashboard',
  bountyBTC: 0.1,
  deadline: new Date().toISOString(),
  description: 'Test Bounty Description',
  category: 'Test Category',
  difficulty: 'Easy',
  company: 'Acme Labs',
} as TBounty;

const renderBountyCard = (bounty: TBounty = mockBounty) => {
  return render(
    <MemoryRouter>
      <BountyCard bounty={bounty} />
    </MemoryRouter>,
  );
};

describe('Bounty card', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the card ui', () => {
    renderBountyCard();

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: mockBounty.title,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(mockBounty.difficulty)).toBeInTheDocument();
    expect(screen.getByText(mockBounty.description)).toBeInTheDocument();
    expect(screen.getByText(`${mockBounty.bountyBTC} BTC`)).toBeInTheDocument();
    expect(screen.getByText(`${mockBounty.company}`)).toBeInTheDocument();
    expect(
      screen.getByText(
        `Deadline: ${formatBountyDeadline(mockBounty.deadline)}`,
      ),
    ).toBeInTheDocument();

    const submitLink = screen.getByRole('link', { name: /submit solution/i });
    expect(submitLink).toBeInTheDocument();
  });

  it.each([
    ['beginner', 'bg-green-100'],
    ['intermediate', 'bg-yellow-100'],
    ['advanced', 'bg-red-100'],
  ] as const)(
    'applies correct styling for %s difficulty',
    (difficulty, expectedClass) => {
      renderBountyCard({ ...mockBounty, difficulty });
      expect(screen.getByText(difficulty)).toHaveClass(expectedClass);
    },
  );
});
