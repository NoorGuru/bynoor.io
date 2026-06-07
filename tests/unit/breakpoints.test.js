import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onBreakpointChange, isAbove } from '../../src/scripts/utils/breakpoints.js';

describe('breakpoints utility', () => {
  let listeners;
  let matchesValue;

  beforeEach(() => {
    listeners = [];
    matchesValue = false;

    vi.stubGlobal('matchMedia', vi.fn((query) => ({
      matches: matchesValue,
      media: query,
      addEventListener: (event, cb) => {
        listeners.push({ event, cb });
      },
    })));
  });

  describe('onBreakpointChange', () => {
    it('calls callback immediately with current match state', () => {
      matchesValue = true;
      const cb = vi.fn();

      onBreakpointChange(768, cb);

      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith(true);
    });

    it('calls callback with false when viewport is below breakpoint', () => {
      matchesValue = false;
      const cb = vi.fn();

      onBreakpointChange(1024, cb);

      expect(cb).toHaveBeenCalledWith(false);
    });

    it('registers a change event listener', () => {
      const cb = vi.fn();

      onBreakpointChange(768, cb);

      expect(listeners.length).toBe(1);
      expect(listeners[0].event).toBe('change');
    });

    it('fires callback on subsequent change events', () => {
      const cb = vi.fn();

      onBreakpointChange(768, cb);
      // Simulate a change event
      listeners[0].cb({ matches: true });

      expect(cb).toHaveBeenCalledTimes(2);
      expect(cb).toHaveBeenLastCalledWith(true);
    });

    it('constructs the correct media query string', () => {
      const cb = vi.fn();

      onBreakpointChange(1200, cb);

      expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1200px)');
    });
  });

  describe('isAbove', () => {
    it('returns true when viewport is above the breakpoint', () => {
      matchesValue = true;

      expect(isAbove(768)).toBe(true);
    });

    it('returns false when viewport is below the breakpoint', () => {
      matchesValue = false;

      expect(isAbove(1024)).toBe(false);
    });

    it('constructs the correct media query string', () => {
      isAbove(600);

      expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 600px)');
    });
  });
});
