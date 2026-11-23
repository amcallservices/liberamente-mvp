// Royalty payout calendar.
// Royalties are paid on the 30th of every month (the 28th in February).
// On each payday, everything accrued in the previous calendar months becomes
// payable: single sales made before the 1st of the payday's month and Plus
// periods that closed before that date. All dates are in Italian time.

const TZ = 'Europe/Rome';
const DAY = 86400000;

export type YMD = { y: number; m: number; d: number }; // m is 1-12

export function romeYmd(date: Date): YMD {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (type: string) => Number(parts.find(part => part.type === type)?.value);
  return { y: get('year'), m: get('month'), d: get('day') };
}

export const ymdString = ({ y, m, d }: YMD) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export const paydayDay = (month: number) => (month === 2 ? 28 : 30);

const shiftMonth = (y: number, m: number, delta: number) => {
  const index = y * 12 + (m - 1) + delta;
  return { y: Math.floor(index / 12), m: (index % 12) + 1 };
};

/** First day (YYYY-MM-DD) of the month whose payday was most recently reached.
 *  Anything accrued before this date is payable now. */
export function payableCutoff(now: Date = new Date()): string {
  const today = romeYmd(now);
  const month = today.d >= paydayDay(today.m) ? { y: today.y, m: today.m } : shiftMonth(today.y, today.m, -1);
  return ymdString({ ...month, d: 1 });
}

/** The next payday (today counts if it is a payday) and the days left. */
export function nextPayday(now: Date = new Date()): { date: string; daysLeft: number; cutoff: string } {
  const today = romeYmd(now);
  const month = today.d <= paydayDay(today.m) ? { y: today.y, m: today.m } : shiftMonth(today.y, today.m, 1);
  const payday = { ...month, d: paydayDay(month.m) };
  const daysLeft = Math.round((Date.UTC(payday.y, payday.m - 1, payday.d) - Date.UTC(today.y, today.m - 1, today.d)) / DAY);
  return { date: ymdString(payday), daysLeft, cutoff: ymdString({ ...month, d: 1 }) };
}

/** Rome calendar date of a timestamp, as YYYY-MM-DD. */
export const romeDateOf = (timestamp: string | Date) => ymdString(romeYmd(new Date(timestamp)));

/** Payday on which an item accrued on `accrualDate` (YYYY-MM-DD) becomes payable. */
export function paydayFor(accrualDate: string): string {
  const [y, m] = accrualDate.split('-').map(Number);
  const next = shiftMonth(y, m, 1);
  return ymdString({ ...next, d: paydayDay(next.m) });
}

/** UTC instant of midnight in Rome on the given YYYY-MM-DD (for database filters). */
export function romeMidnightUtc(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d);
  const shown = romeYmd(new Date(guess));
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' }).format(new Date(guess)));
  // Rome is ahead of UTC, so UTC midnight shows as 01:00 or 02:00 on the same day.
  const offsetHours = shown.d === d ? hour : hour - 24;
  return new Date(guess - offsetHours * 3600000).toISOString();
}

const formatter = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const formatPayday = (date: string) => formatter.format(new Date(`${date}T12:00:00Z`));

export const daysLabel = (days: number) => (days === 0 ? 'oggi' : days === 1 ? 'domani' : `tra ${days} giorni`);
