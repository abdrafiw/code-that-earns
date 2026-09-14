import { describe, expect, it } from '@jest/globals';
import {
  formatMoney,
  getCurrencyFractionDigits,
  parseMoneyToMinorUnits,
} from '../utils/formatOutcome';

describe('provider-neutral currency utilities', () => {
  it.each([
    ['100.25', 'USD', 10_025],
    ['100', 'JPY', 100],
    ['1.234', 'KWD', 1_234],
  ])('parses %s %s into integer minor units', (value, currency, expected) => {
    expect(parseMoneyToMinorUnits(value, currency)).toBe(expected);
  });

  it('rejects fractions unsupported by the currency', () => {
    expect(() => parseMoneyToMinorUnits('1.01', 'JPY')).toThrow();
    expect(() => parseMoneyToMinorUnits('1.2345', 'KWD')).toThrow();
  });

  it('uses currency metadata when formatting', () => {
    expect(getCurrencyFractionDigits('JPY')).toBe(0);
    expect(formatMoney(1_234, 'USD', 'en-US')).toBe('$12.34');
  });
});
