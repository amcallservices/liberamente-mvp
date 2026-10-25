import {describe,it,expect} from 'vitest';import {authorRoyalty} from '../lib/money';
describe('royalty',()=>{it('deducts 15% platform commission',()=>expect(authorRoyalty(1000)).toBe(850));it('rounds cents',()=>expect(authorRoyalty(999)).toBe(849))});
