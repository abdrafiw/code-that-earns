import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';
import { SubmitSolutionForm } from './SubmitSolutionForm';
import type { TBounty } from '../../bounties/types';
import userEvent from '@testing-library/user-event';

import { toast } from 'sonner';

const mockMutate = jest.fn();

// const mockToastError = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockBounty = {
  id: '1',
  title: 'build a react dashboard',
  bountyBTC: 0.1,
  deadline: new Date().toISOString(),
  description: 'Test Bounty Description',
  category: 'Test Category',
  difficulty: 'Easy',
} as TBounty;

jest.mock('../hooks/useSubmissions', () => ({
  useSubmitSolution: jest.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}));

const RenderSubmitSolutionForm = () => {
  return render(
    <MemoryRouter>
      <SubmitSolutionForm bounty={mockBounty} bountyID="1" />
    </MemoryRouter>,
  );
};

describe('SubmitSolutionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the bounty info and form fields', () => {
    RenderSubmitSolutionForm();

    // heading
    expect(
      screen.getByRole('heading', {
        name: /challenge: build a react dashboard/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/bounty: 0.1 btc/i)).toBeInTheDocument();

    // fields
    expect(screen.getByLabelText(/gitHub repository URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/submit hash/i)).toBeInTheDocument();

    // actions
    expect(
      screen.getByRole('button', {
        name: /submit solution/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /back to bounties/i,
      }),
    ).toBeInTheDocument();
  });

  it('shows error when submitting empty fields', async () => {
    RenderSubmitSolutionForm();

    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', {
        name: /submit solution/i,
      }),
    );

    // expect(mockToastError).toHaveBeenCalledWith('Please fill in all fields.');

    expect(jest.mocked(toast.error)).toHaveBeenCalledWith(
      'Please fill in all fields.',
    );
  });
});
