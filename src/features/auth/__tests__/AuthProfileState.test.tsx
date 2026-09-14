import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthProfileState } from '../components/AuthProfileState';
import { useSignOut } from '../hooks/useAuth';

jest.mock('../hooks/useAuth', () => ({
  useSignOut: jest.fn(),
}));

const mockSignOut = jest.fn();

describe('AuthProfileState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSignOut).mockReturnValue({
      mutate: mockSignOut,
      isPending: false,
    } as unknown as ReturnType<typeof useSignOut>);
  });

  it('lets the user retry loading their profile or sign out', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();

    render(<AuthProfileState status="profile-missing" onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: /retry profile/i }));
    await user.click(screen.getByRole('button', { name: /^sign out$/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('disables sign out while the request is pending', () => {
    jest.mocked(useSignOut).mockReturnValue({
      mutate: mockSignOut,
      isPending: true,
    } as unknown as ReturnType<typeof useSignOut>);

    render(
      <AuthProfileState
        status="error"
        error="Unavailable"
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /signing out/i })).toBeDisabled();
  });
});
