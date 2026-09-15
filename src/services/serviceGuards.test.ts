import { describe, expect, it } from '@jest/globals';

import {
  assertHttpsUrl,
  assertValidDate,
  normalizeOptionalText,
  normalizePageSize,
  normalizeRequiredId,
  normalizeRequiredText,
} from './serviceGuards';

describe('service boundary guards', () => {
  it('normalizes required IDs and rejects unsafe document IDs', () => {
    expect(normalizeRequiredId(' challenge-1 ', 'Challenge ID')).toBe(
      'challenge-1',
    );
    expect(() => normalizeRequiredId('   ', 'Challenge ID')).toThrow(
      'Challenge ID is required.',
    );
    expect(() => normalizeRequiredId('a'.repeat(257), 'Challenge ID')).toThrow(
      'Challenge ID is too long.',
    );
  });

  it('keeps page sizes within predictable query bounds', () => {
    expect(normalizePageSize(10)).toBe(10);
    expect(normalizePageSize(0)).toBe(20);
    expect(normalizePageSize(3.5)).toBe(20);
    expect(normalizePageSize(100)).toBe(50);
  });

  it('normalizes text inputs without writing empty optional fields', () => {
    expect(normalizeRequiredText('  Title  ', 'Title')).toBe('Title');
    expect(() => normalizeRequiredText('  ', 'Title')).toThrow(
      'Title is required.',
    );
    expect(normalizeOptionalText('  Notes  ')).toBe('Notes');
    expect(normalizeOptionalText('  ')).toBeUndefined();
  });

  it('validates service-layer dates and optional HTTPS URLs', () => {
    expect(() =>
      assertValidDate(new Date('2026-01-01T00:00:00.000Z'), 'Deadline'),
    ).not.toThrow();
    expect(() => assertValidDate(new Date('invalid'), 'Deadline')).toThrow(
      'Deadline must be a valid date.',
    );
    expect(() =>
      assertHttpsUrl('https://example.com/demo', 'Live demo URL'),
    ).not.toThrow();
    expect(() =>
      assertHttpsUrl('http://example.com/demo', 'Live demo URL'),
    ).toThrow('Live demo URL must be a valid HTTPS URL.');
  });
});
