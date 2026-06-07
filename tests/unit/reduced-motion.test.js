import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prefersReducedMotion, onMotionPreferenceChange } from '../../src/scripts/utils/reduced-motion.js';

function createMockMatchMedia(matches) {
  const listeners = [];
  const mql = {
    matches,
    addEventListener: vi.fn((event, cb) => {
      listeners.push(cb);
    }),
  };
  return { mql, listeners };
}

describe('reduced-motion utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('prefersReducedMotion', () => {
    it('returns true when user prefers reduced motion', () => {
      const { mql } = createMockMatchMedia(true);
      vi.stubGlobal('matchMedia', vi.fn(() => mql));

      expect(prefersReducedMotion()).toBe(true);
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('returns false when user does not prefer reduced motion', () => {
      const { mql } = createMockMatchMedia(false);
      vi.stubGlobal('matchMedia', vi.fn(() => mql));

      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe('onMotionPreferenceChange', () => {
    it('fires callback immediately with current state', () => {
      const { mql } = createMockMatchMedia(true);
      vi.stubGlobal('matchMedia', vi.fn(() => mql));

      const callback = vi.fn();
      onMotionPreferenceChange(callback);

      expect(callback).toHaveBeenCalledWith(true);
    });

    it('registers a change event listener', () => {
      const { mql } = createMockMatchMedia(false);
      vi.stubGlobal('matchMedia', vi.fn(() => mql));

      const callback = vi.fn();
      onMotionPreferenceChange(callback);

      expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('calls callback when preference changes', () => {
      const { mql, listeners } = createMockMatchMedia(false);
      vi.stubGlobal('matchMedia', vi.fn(() => mql));

      const callback = vi.fn();
      onMotionPreferenceChange(callback);

      // Simulate a change event
      listeners[0]({ matches: true });

      expect(callback).toHaveBeenCalledTimes(2); // once immediate, once from change
      expect(callback).toHaveBeenLastCalledWith(true);
    });
  });
});
