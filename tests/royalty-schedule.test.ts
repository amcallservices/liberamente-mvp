import { describe, expect, it } from 'vitest';
import { daysLabel, nextPayday, payableCutoff, paydayFor, romeDateOf, romeMidnightUtc } from '@/lib/royalty-schedule';

const at = (iso: string) => new Date(iso);

describe('royalty schedule', () => {
  it('pays on the 30th, and on the 28th in February', () => {
    expect(nextPayday(at('2026-11-23T10:00:00Z'))).toEqual({ date: '2026-11-30', daysLeft: 7, cutoff: '2026-11-01' });
    expect(nextPayday(at('2027-02-10T10:00:00Z')).date).toBe('2027-02-28');
    expect(nextPayday(at('2028-02-10T10:00:00Z')).date).toBe('2028-02-28');
  });

  it('counts the payday itself as today', () => {
    expect(nextPayday(at('2026-11-30T09:00:00Z')).daysLeft).toBe(0);
    expect(daysLabel(0)).toBe('oggi');
    expect(daysLabel(1)).toBe('domani');
  });

  it('moves to next month after the payday (31st and 1st of March)', () => {
    expect(nextPayday(at('2026-12-31T09:00:00Z'))).toMatchObject({ date: '2027-01-30', daysLeft: 30 });
    expect(nextPayday(at('2027-03-01T09:00:00Z'))).toMatchObject({ date: '2027-03-30', daysLeft: 29 });
  });

  it('makes previous months payable only once the payday is reached', () => {
    expect(payableCutoff(at('2026-11-29T12:00:00Z'))).toBe('2026-10-01');
    expect(payableCutoff(at('2026-11-30T12:00:00Z'))).toBe('2026-11-01');
    expect(payableCutoff(at('2027-02-28T12:00:00Z'))).toBe('2027-02-01');
    expect(payableCutoff(at('2027-01-05T12:00:00Z'))).toBe('2026-12-01');
  });

  it('uses Italian time for dates', () => {
    expect(romeDateOf('2026-10-31T23:30:00Z')).toBe('2026-11-01');
    expect(nextPayday(at('2026-11-29T23:30:00Z')).daysLeft).toBe(0);
    expect(romeMidnightUtc('2026-11-01')).toBe('2026-10-31T23:00:00.000Z');
    expect(romeMidnightUtc('2026-07-01')).toBe('2026-06-30T22:00:00.000Z');
  });

  it('assigns each sale to the payday of the following month', () => {
    expect(paydayFor('2026-10-31')).toBe('2026-11-30');
    expect(paydayFor('2027-01-15')).toBe('2027-02-28');
    expect(paydayFor('2026-12-03')).toBe('2027-01-30');
  });
});
