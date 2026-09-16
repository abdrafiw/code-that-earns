import { useAppContext } from '../../../hooks/useAppContext';
import { CompanyChallengesPage } from './CompanyChallengesPage';
import { DevChallengesPage } from './DevChallengesPage';

export function ChallengesPage() {
  const { authState } = useAppContext();

  if (authState.status !== 'authenticated') return null;

  return authState.user.user.role === 'ORGANIZATION' ? (
    <CompanyChallengesPage />
  ) : (
    <DevChallengesPage />
  );
}
