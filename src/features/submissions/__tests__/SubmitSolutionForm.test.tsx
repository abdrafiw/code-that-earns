import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';
import { SubmitSolutionForm } from '../components/SubmitSolutionForm';
import userEvent from '@testing-library/user-event';

import { toast } from 'sonner';

const mockMutate = jest.fn();

// const mockToastError = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('../hooks/useSubmissions', () => ({
  useSubmitSolution: jest.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}));

const RenderSubmitSolutionForm = () => {
  return render(
    <MemoryRouter>
      <SubmitSolutionForm challengeID="1" />
    </MemoryRouter>,
  );
};

describe('SubmitSolutionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the submission form fields and actions', () => {
    RenderSubmitSolutionForm();

    expect(
      screen.getByRole('heading', {
        name: /submit your solution/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/github repository/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/live demo/i)).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /submit solution/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /cancel/i,
      }),
    ).toBeInTheDocument();
  });

  it('disables submission when the required repository URL is empty', () => {
    RenderSubmitSolutionForm();

    expect(
      screen.getByRole('button', { name: /submit solution/i }),
    ).toBeDisabled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('explains why a closed challenge cannot accept a submission', async () => {
    render(
      <MemoryRouter>
        <SubmitSolutionForm
          challengeID="1"
          unavailableReason="The submission deadline has passed."
        />
      </MemoryRouter>,
    );
    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText(/github repository/i),
      'https://github.com/user/repository',
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'The submission deadline has passed.',
    );
    expect(
      screen.getByRole('button', { name: /submit solution/i }),
    ).toBeDisabled();
  });

  it('shows backend errors and retains entered values', async () => {
    RenderSubmitSolutionForm();
    const user = userEvent.setup();
    const githubInput = screen.getByLabelText(/github repository/i);
    const demoInput = screen.getByLabelText(/live demo/i);

    await user.type(githubInput, 'https://github.com/user/repository');
    await user.type(demoInput, 'https://example.com/demo');
    await user.click(screen.getByRole('button', { name: /submit solution/i }));

    const options = mockMutate.mock.calls[0][1] as {
      onError: (error: Error) => void;
    };
    options.onError(new Error('Network unavailable'));

    expect(jest.mocked(toast.error)).toHaveBeenCalledWith(
      'Network unavailable',
    );
    expect(githubInput).toHaveValue('https://github.com/user/repository');
    expect(demoInput).toHaveValue('https://example.com/demo');
  });

  it('shows success feedback after a successful submission', async () => {
    RenderSubmitSolutionForm();
    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText(/github repository/i),
      'https://github.com/user/repository',
    );
    await user.click(screen.getByRole('button', { name: /submit solution/i }));

    const options = mockMutate.mock.calls[0][1] as { onSuccess: () => void };
    await act(async () => options.onSuccess());

    expect(jest.mocked(toast.success)).toHaveBeenCalledWith(
      'Solution submitted successfully.',
    );
  });

  it('accepts a supported project link for a UI/UX Design challenge', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SubmitSolutionForm
          challengeID="design-1"
          challengeCategory="UI/UX Design"
        />
      </MemoryRouter>,
    );

    const designLink = screen.getByLabelText(/design project link/i);
    await user.type(
      designLink,
      'https://www.behance.net/gallery/123456789/Design-System',
    );
    await user.click(screen.getByRole('button', { name: /submit solution/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        submissionUrl:
          'https://www.behance.net/gallery/123456789/Design-System',
      }),
      expect.any(Object),
    );
  });

  it('rejects unsupported links for a UI/UX Design challenge', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SubmitSolutionForm
          challengeID="design-1"
          challengeCategory="UI/UX Design"
        />
      </MemoryRouter>,
    );

    await user.type(
      screen.getByLabelText(/design project link/i),
      'https://example.com/design',
    );
    await user.click(screen.getByRole('button', { name: /submit solution/i }));

    expect(
      screen.getByText(/valid figma, behance, or dribbble project url/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
