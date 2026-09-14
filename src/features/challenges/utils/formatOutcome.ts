import type { ChallengeOutcome } from '../../../services/firestore-structure';

const ISO_CURRENCIES = new Set(
  'AED AFN ALL AMD ANG AOA ARS AUD AWG AZN BAM BBD BDT BGN BHD BIF BMD BND BOB BOV BRL BSD BTN BWP BYN BZD CAD CDF CHE CHF CHW CLF CLP CNY COP COU CRC CUC CUP CVE CZK DJF DKK DOP DZD EGP ERN ETB EUR FJD FKP GBP GEL GHS GIP GMD GNF GTQ GYD HKD HNL HRK HTG HUF IDR ILS INR IQD IRR ISK JMD JOD JPY KES KGS KHR KMF KPW KRW KWD KYD KZT LAK LBP LKR LRD LSL LYD MAD MDL MGA MKD MMK MNT MOP MRU MUR MVR MWK MXN MXV MYR MZN NAD NGN NIO NOK NPR NZD OMR PAB PEN PGK PHP PKR PLN PYG QAR RON RSD RUB RWF SAR SBD SCR SDG SEK SGD SHP SLE SLL SOS SRD SSP STN SVC SYP SZL THB TJS TMT TND TOP TRY TTD TWD TZS UAH UGX USD USN UYI UYU UYW UZS VED VES VND VUV WST XAF XAG XAU XBA XBB XBC XBD XCD XCG XDR XOF XPD XPF XPT XSU XTS XUA XXX YER ZAR ZMW ZWG'.split(
    ' ',
  ),
);

export function getCurrencyFractionDigits(currency: string) {
  return (
    new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
    }).resolvedOptions().maximumFractionDigits ?? 2
  );
}

export function isSupportedCurrency(currency: string) {
  if (!/^[A-Z]{3}$/.test(currency)) return false;
  return ISO_CURRENCIES.has(currency);
}

export function parseMoneyToMinorUnits(value: string, currency: string) {
  if (!isSupportedCurrency(currency)) throw new Error('Unsupported currency.');
  const fractionDigits = getCurrencyFractionDigits(currency);
  const decimalPart = fractionDigits
    ? `(?:\\.(\\d{1,${fractionDigits}}))?`
    : '';
  const match = value.trim().match(new RegExp(`^(\\d+)${decimalPart}$`));
  if (!match) throw new Error('Invalid monetary amount.');
  const fraction = (match[2] ?? '').padEnd(fractionDigits, '0');
  const amount =
    BigInt(match[1]!) * 10n ** BigInt(fractionDigits) + BigInt(fraction || '0');
  if (amount <= 0n || amount > BigInt(Number.MAX_SAFE_INTEGER))
    throw new Error('Monetary amount is out of range.');
  return Number(amount);
}

export function formatMoney(
  amountMinor: number,
  currency: string,
  locale?: string,
) {
  const fractionDigits = getCurrencyFractionDigits(currency);
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    amountMinor / 10 ** fractionDigits,
  );
}

export function formatOutcome(outcome: ChallengeOutcome, locale?: string) {
  if (outcome.amountMinor && outcome.currency)
    return formatMoney(outcome.amountMinor, outcome.currency, locale);
  if (outcome.rewardDescription) return outcome.rewardDescription;
  return outcome.recognitionLabel ?? 'Recognition';
}
