import { isDesignChallenge } from '../features/challenges/constants';

const DESIGN_HOSTS = new Set([
  'figma.com',
  'www.figma.com',
  'behance.net',
  'www.behance.net',
  'dribbble.com',
  'www.dribbble.com',
]);

const FIGMA_PROJECT_PATHS = new Set(['design', 'file', 'proto', 'board']);

export function isValidSubmissionUrl(value: string, category?: string) {
  try {
    const trimmedValue = value.trim();
    const url = new URL(trimmedValue);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    if (trimmedValue.length > 2048 || url.protocol !== 'https:') return false;

    if (isDesignChallenge(category)) {
      if (!DESIGN_HOSTS.has(url.hostname)) return false;
      if (url.hostname.endsWith('figma.com')) {
        return (
          (FIGMA_PROJECT_PATHS.has(pathSegments[0]) &&
            pathSegments.length >= 2) ||
          (pathSegments[0] === 'community' &&
            pathSegments[1] === 'file' &&
            pathSegments.length >= 3)
        );
      }
      if (url.hostname.endsWith('behance.net')) {
        return pathSegments[0] === 'gallery' && pathSegments.length >= 3;
      }
      return pathSegments[0] === 'shots' && pathSegments.length >= 2;
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
    isValidSubmissionUrl(value) || isValidSubmissionUrl(value, 'UI/UX Design')
  );
}

export function getStoredSubmissionUrl(submission: {
  submissionUrl?: string;
  githubUrl?: string;
}) {
  return submission.submissionUrl ?? submission.githubUrl ?? '';
}
