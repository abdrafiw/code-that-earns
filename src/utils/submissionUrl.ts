import { isDesignChallenge } from '../features/challenges/constants';

const DESIGN_HOSTS = new Set([
  'figma.com',
  'www.figma.com',
  'behance.net',
  'www.behance.net',
  'dribbble.com',
  'www.dribbble.com',
]);

export function isValidSubmissionUrl(value: string, category?: string) {
  try {
    const trimmedValue = value.trim();
    const url = new URL(trimmedValue);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    if (trimmedValue.length > 2048 || url.protocol !== 'https:') return false;

    if (isDesignChallenge(category)) {
      return DESIGN_HOSTS.has(url.hostname) && pathSegments.length > 0;
    }

    return (
      url.hostname === 'github.com' &&
      pathSegments.length === 2 &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

export function isSupportedStoredSubmissionUrl(value: string) {
  return (
    isValidSubmissionUrl(value) ||
    isValidSubmissionUrl(value, 'UI/UX Design')
  );
}
