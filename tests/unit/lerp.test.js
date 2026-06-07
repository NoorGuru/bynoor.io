import { describe, it, expect } from 'vitest';
import { lerp } from '../../src/scripts/utils/lerp.js';

describe('lerp', () => {
  it('returns current when factor is 0', () => {
    expect(lerp(0, 10, 0)).toBe(0);
  });

  it('returns target when factor is 1', () => {
    expect(lerp(0, 10, 1)).toBe(10);
  });

  it('returns midpoint when factor is 0.5', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it('interpolates correctly between arbitrary values', () => {
    expect(lerp(2, 8, 0.25)).toBeCloseTo(3.5);
  });

  it('works with negative values', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
  });
});
