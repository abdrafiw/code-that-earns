import {
  FieldValue,
  Timestamp,
  type Firestore,
} from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';

const ISO_CURRENCIES = new Set(
  'AED AFN ALL AMD ANG AOA ARS AUD AWG AZN BAM BBD BDT BGN BHD BIF BMD BND BOB BOV BRL BSD BTN BWP BYN BZD CAD CDF CHE CHF CHW CLF CLP CNY COP COU CRC CUC CUP CVE CZK DJF DKK DOP DZD EGP ERN ETB EUR FJD FKP GBP GEL GHS GIP GMD GNF GTQ GYD HKD HNL HRK HTG HUF IDR ILS INR IQD IRR ISK JMD JOD JPY KES KGS KHR KMF KPW KRW KWD KYD KZT LAK LBP LKR LRD LSL LYD MAD MDL MGA MKD MMK MNT MOP MRU MUR MVR MWK MXN MXV MYR MZN NAD NGN NIO NOK NPR NZD OMR PAB PEN PGK PHP PKR PLN PYG QAR RON RSD RUB RWF SAR SBD SCR SDG SEK SGD SHP SLE SLL SOS SRD SSP STN SVC SYP SZL THB TJS TMT TND TOP TRY TTD TWD TZS UAH UGX USD USN UYI UYU UYW UZS VED VES VND VUV WST XAF XAG XAU XBA XBB XBC XBD XCD XCG XDR XOF XPD XPF XPT XSU XTS XUA XXX YER ZAR ZMW ZWG'.split(
    ' ',
  ),
);

type OutcomeInput = Record<string, unknown> & { type?: unknown };
export type PublishChallengeInput = Record<string, unknown> & {
  outcome?: OutcomeInput;
};

function requiredText(value: unknown, min: number, max: number, label: string) {
  if (
    typeof value !== 'string' ||
    value.trim().length < min ||
    value.trim().length > max
  ) {
    throw new HttpsError('invalid-argument', `${label} is invalid.`);
  }
  return value.trim();
}

function createSearchTerms(...values: string[]) {
  return [
    ...new Set(
      values
        .flatMap((value) => value.toLowerCase().split(/[^a-z0-9]+/))
        .filter((value) => value.length >= 2),
    ),
  ].slice(0, 100);
}

export async function publishChallengeOperation(
  db: Firestore,
  actorUid: string,
  input: PublishChallengeInput,
) {
  const profile = await db.collection('users').doc(actorUid).get();
  if (!profile.exists || profile.data()?.role !== 'COMPANY') {
    throw new HttpsError(
      'permission-denied',
      'Only companies can publish challenges.',
    );
  }
  if (input.responsibilityAccepted !== true) {
    throw new HttpsError(
      'failed-precondition',
      'The company must accept responsibility for the stated outcome.',
    );
  }

  const title = requiredText(input.title, 3, 120, 'Title');
  const description = requiredText(input.description, 10, 5000, 'Description');
  const category = requiredText(input.category, 1, 80, 'Category');
  const difficulty = requiredText(input.difficulty, 1, 40, 'Difficulty');
  const eligibility = requiredText(input.eligibility, 1, 2000, 'Eligibility');
  if (
    !Number.isInteger(input.winnerCount) ||
    (input.winnerCount as number) < 1 ||
    (input.winnerCount as number) > 10
  ) {
    throw new HttpsError(
      'invalid-argument',
      'Winner count must be between 1 and 10.',
    );
  }
  const deadlineDate = new Date(String(input.deadline));
  if (Number.isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
    throw new HttpsError('invalid-argument', 'Deadline must be in the future.');
  }

  const outcome = input.outcome;
  const outcomeTypes = [
    'recognition',
    'monetary',
    'non_monetary',
    'recognition_and_reward',
  ];
  if (
    !outcome ||
    typeof outcome.type !== 'string' ||
    !outcomeTypes.includes(outcome.type)
  ) {
    throw new HttpsError('invalid-argument', 'Outcome type is invalid.');
  }
  const offersRecognition =
    outcome.type === 'recognition' || outcome.type === 'recognition_and_reward';
  const offersMoney =
    outcome.type === 'monetary' || outcome.type === 'recognition_and_reward';
  if (offersRecognition)
    requiredText(outcome.recognitionLabel, 1, 80, 'Recognition label');
  if (offersMoney) {
    if (
      !Number.isSafeInteger(outcome.amountMinor) ||
      (outcome.amountMinor as number) <= 0
    ) {
      throw new HttpsError(
        'invalid-argument',
        'Amount must use positive integer minor units.',
      );
    }
    if (
      typeof outcome.currency !== 'string' ||
      !ISO_CURRENCIES.has(outcome.currency)
    ) {
      throw new HttpsError(
        'invalid-argument',
        'Currency must be a supported ISO 4217 code.',
      );
    }
  }
  if (outcome.type === 'non_monetary')
    requiredText(outcome.rewardDescription, 1, 1000, 'Reward description');
  if (outcome.type !== 'recognition')
    requiredText(outcome.deliveryTerms, 1, 2000, 'Delivery terms');

  const ref = db.collection('challenges').doc();
  await ref.set({
    schemaVersion: 2,
    title,
    description,
    category,
    difficulty,
    outcome,
    winnerCount: input.winnerCount,
    eligibility,
    deadline: Timestamp.fromDate(deadlineDate),
    searchTerms: createSearchTerms(title, description, category),
    searchSchemaVersion: 1,
    filterFacets: [
      `category:${category}`,
      `difficulty:${difficulty}`,
      `category:${category}|difficulty:${difficulty}`,
    ],
    companyName: profile.data()?.companyName ?? null,
    companyUid: actorUid,
    status: 'open',
    submissions: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { id: ref.id };
}
