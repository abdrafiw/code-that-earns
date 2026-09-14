import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, jest } from '@jest/globals';
import type { ChangeEvent, ReactNode } from 'react';

import { useSignUp } from '../hooks/useAuth';
import { SignUpForm } from '../components/SignUpForm';

// mock useSignPp
jest.mock('../hooks/useAuth', () => ({
  useSignUp: jest.fn(),
}));

// mock sonner
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Replace Radix Select with plain HTML so tests don't need real layout/pointer APIs
jest.mock('../../../components/ui/select', () => ({
  Select: ({
    children,
    onValueChange,
    value,
  }: {
    children: ReactNode;
    onValueChange: (value: string) => void;
    value?: string;
  }) => (
    <select
      aria-label="Role"
      value={value}
      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
        onValueChange(event.target.value)
      }
    >
      <option value="">Select your role</option>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
}));

const mockMutate = jest.fn();

const renderSignUpForm = () => {
  return render(
    <MemoryRouter>
      <SignUpForm />
    </MemoryRouter>,
  );
};

describe('SignUp Form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSignUp).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useSignUp>);
  });

  it('renders the signup form', () => {
    renderSignUpForm();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    expect(screen.getByRole('combobox', { name: /role/i })).toBeInTheDocument();

    expect(screen.getByRole('combobox', { name: /role/i })).toHaveTextContent(
      /select your role/i,
    );

    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows full name field when developer is selected', async () => {
    renderSignUpForm();

    const user = userEvent.setup();
    const select = screen.getByRole('combobox', { name: /role/i });
    await user.selectOptions(select, 'DEVELOPER');

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();
  });

  it('shows company name field when company is selected', async () => {
    renderSignUpForm();

    const user = userEvent.setup();
    const select = screen.getByRole('combobox', { name: /role/i });
    await user.selectOptions(select, 'COMPANY');

    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
  });
});
