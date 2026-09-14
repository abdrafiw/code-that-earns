import { Timestamp } from 'firebase/firestore';

export type ChallengeDeadline = Timestamp | Date | string;

/** A selected calendar day closes at 23:59:59.999 UTC. */
export function toChallengeDeadlineTimestamp(selectedDate: Date): Timestamp {
  return Timestamp.fromDate(
    new Date(
      Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        23,
        59,
        59,
        999,
      ),
    ),
  );
}

export function formatChallengeDeadline(
  deadline?: ChallengeDeadline | null,
): string {
  if (!deadline) return 'No deadline';

  const date =
    deadline instanceof Timestamp
      ? deadline.toDate()
      : deadline instanceof Date
        ? deadline
        : new Date(deadline);

  if (Number.isNaN(date.getTime())) return 'No deadline';

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function isChallengeExpired(deadline?: ChallengeDeadline | null) {
  if (!deadline) return true;
  const date =
    deadline instanceof Timestamp
      ? deadline.toDate()
      : deadline instanceof Date
        ? deadline
        : new Date(deadline);
  return Number.isNaN(date.getTime()) || date.getTime() <= Date.now();
}
