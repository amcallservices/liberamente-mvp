import { describe, expect, it } from 'vitest';
import { authorRoyalty } from '../lib/money';

describe('royalty', () => {
  it('calculates the 50% author royalty', () => expect(authorRoyalty(1000)).toBe(500));
  it('rounds half cents correctly', () => expect(authorRoyalty(999)).toBe(500));
});
