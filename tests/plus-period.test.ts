import { describe, expect, it } from 'vitest';
import { subscriptionPeriod } from '@/lib/plus-subscriptions';

describe('subscriptionPeriod', () => {
  it('reads the period from the subscription (older Stripe API)', () => {
    expect(subscriptionPeriod({ current_period_start: 1793750400, current_period_end: 1796342400, items: { data: [] } } as any))
      .toEqual({ start: '2026-11-04T00:00:00.000Z', end: '2026-12-04T00:00:00.000Z' });
  });
  it('reads the period from the first item (newer Stripe API)', () => {
    expect(subscriptionPeriod({ items: { data: [{ current_period_start: 1793750400, current_period_end: 1796342400 }] } } as any).end)
      .toBe('2026-12-04T00:00:00.000Z');
  });
  it('returns nulls when Stripe sends no period', () => {
    expect(subscriptionPeriod({ items: { data: [] } } as any)).toEqual({ start: null, end: null });
  });
});
