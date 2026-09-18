import type { UserRole } from '../services/firestore-structure';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  DEVELOPER: 'Contributor',
  ORGANIZATION: 'Organization',
};

export const USER_ROLE_OPTION_LABELS: Record<UserRole, string> = {
  DEVELOPER: 'Contributor (find challenges and submit work)',
  ORGANIZATION: 'Organization (publish challenges and review submissions)',
};
