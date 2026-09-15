const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const MAX_FIRESTORE_ID_LENGTH = 256;

export function normalizeRequiredId(value: string, label: string) {
  const id = value.trim();
  if (!id) throw new Error(`${label} is required.`);
  if (id.length > MAX_FIRESTORE_ID_LENGTH) {
    throw new Error(`${label} is too long.`);
  }
  return id;
}

export function normalizePageSize(pageSize: number) {
  if (!Number.isInteger(pageSize) || pageSize < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(pageSize, MAX_PAGE_SIZE);
}

export function normalizeOptionalText(value?: string) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

export function normalizeRequiredText(value: string, label: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) throw new Error(`${label} is required.`);
  return trimmedValue;
}

export function assertHttpsUrl(value: string, label: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') throw new Error();
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL.`);
  }
}

export function assertValidDate(value: Date, label: string) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(`${label} must be a valid date.`);
  }
}
