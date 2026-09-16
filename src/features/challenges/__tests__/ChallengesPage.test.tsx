import { render, screen } from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';

import { AppContext } from '../../../context/AppContext';
import type { AppContextType, AuthState } from '../../../context/types';
import { ChallengesPage } from '../pages/ChallengesPage';

jest.mock('../../../config/firebase', () => ({
  auth: {},
  db: {},
}));
jest.mock('../pages/CompanyChallengesPage', () => ({
  CompanyChallengesPage: () => <p>Organization challenges</p>,
}));
jest.mock('../pages/DevChallengesPage', () => ({
  DevChallengesPage: () => <p>Developer challenges</p>,
}));

function renderForRole(role: 'ORGANIZATION' | 'DEVELOPER') {
  const authState: AuthState = {
    status: 'authenticated',
    user: {
      success: true,
      user: { uid: 'user-1', email: 'user@example.com', role },
    },
  };
  const value: AppContextType = {
    authState,
    user: authState.user,
    isAuthLoading: false,
    retryAuthProfile: () => undefined,
  };

  return render(
    <AppContext.Provider value={value}>
      <ChallengesPage />
    </AppContext.Provider>,
  );
}

describe('ChallengesPage', () => {
  it('shows challenge management to organizations', () => {
    renderForRole('ORGANIZATION');
    expect(screen.getByText('Organization challenges')).toBeInTheDocument();
  });

  it('shows the challenge marketplace to developers', () => {
    renderForRole('DEVELOPER');
    expect(screen.getByText('Developer challenges')).toBeInTheDocument();
  });
});
