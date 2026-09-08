export function getErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String(error.code).toLowerCase()
      : '';
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';
  const normalizedMessage = message.toLowerCase();

  const isNetworkError =
    code.includes('network-request-failed') ||
    code.includes('unavailable') ||
    code.includes('deadline-exceeded') ||
    normalizedMessage.includes('network request failed') ||
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('client is offline') ||
    normalizedMessage.includes('network error');

  if (isNetworkError) {
    return 'Unable to connect. Check your internet connection and try again.';
  }

  if (message) return message;

  return 'An unknown error occurred';
}
