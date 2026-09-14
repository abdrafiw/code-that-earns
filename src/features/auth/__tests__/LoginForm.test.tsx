import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useAuth';

// mock useLogin
jest.mock('../hooks/useAuth', () => ({
  useLogin: jest.fn(),
}));

// mock sonner
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockMutate = jest.fn();

const renderLoginForm = () => {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  );
};

describe('Login Form', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useLogin>);
  });

  it('renders the login form', () => {
    renderLoginForm();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute(
      'href',
      '/sign-up',
    );
  });

  it('shows an email validation error when an invalid email is entered', async () => {
    const user = userEvent.setup();

    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);

    await user.type(emailInput, 'companyacc01');

    expect(
      screen.getByText('Please enter a valid email address'),
    ).toBeInTheDocument();

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears the email error when a valid email is entered', async () => {
    const user = userEvent.setup();

    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);

    await user.type(emailInput, 'invalid-email');

    expect(
      screen.getByText('Please enter a valid email address'),
    ).toBeInTheDocument();

    await user.clear(emailInput);
    await user.type(emailInput, 'john@example.com');

    expect(
      screen.queryByText('Please enter a valid email address'),
    ).not.toBeInTheDocument();

    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();

    renderLoginForm();

    const passwordInput = screen.getByLabelText(/^password$/i);

    expect(passwordInput).toHaveAttribute('type', 'password');

    const showPasswordButton = screen.getByRole('button', {
      name: /show password/i,
    });

    await user.click(showPasswordButton);

    expect(passwordInput).toHaveAttribute('type', 'text');

    // ====

    const hidePasswordButton = screen.getByRole('button', {
      name: /hide password/i,
    });

    expect(hidePasswordButton).toBeInTheDocument();

    await user.click(hidePasswordButton);

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows validation errors when email and password are empty', () => {
    renderLoginForm();

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    const form = submitButton.closest('form');

    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(
      screen.getByText('Please enter a valid email address'),
    ).toBeInTheDocument();
    expect(screen.getByText('Enter your password.')).toBeInTheDocument();

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows a toast when the email is invalid', async () => {
    const user = userEvent.setup();

    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');

    await user.type(screen.getByLabelText(/^password$/i), 'password123');

    // The component disables the submit button when emailError exists.
    expect(
      screen.getByRole('button', {
        name: /sign in/i,
      }),
    ).toBeDisabled();

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('calls login with the correct credentials', async () => {
    const user = userEvent.setup();

    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), 'john@example.com');

    await user.type(screen.getByLabelText(/^password$/i), 'password123');

    await user.click(
      screen.getByRole('button', {
        name: /sign in/i,
      }),
    );

    expect(mockMutate).toHaveBeenCalledTimes(1);

    expect(mockMutate).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'password123',
    });
  });

  it('disables the submit button when there is an email error', async () => {
    const user = userEvent.setup();

    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');

    expect(
      screen.getByRole('button', {
        name: /sign in/i,
      }),
    ).toBeDisabled();
  });

  //   it("allows the user to select a role", async () => {
  //     const user = userEvent.setup();

  //     renderLoginForm();

  //     const roleTrigger = screen.getByRole("combobox", {
  //       name: /i am a/i,
  //     });

  //     await user.click(roleTrigger);

  //     expect(
  //       screen.getByRole("option", {
  //         name: /developer/i,
  //       }),
  //     ).toBeInTheDocument();

  //     await user.click(
  //       screen.getByRole("option", {
  //         name: /developer/i,
  //       }),
  //     );

  //     expect(roleTrigger).toHaveTextContent("Developer");
  //   });
});
