import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scheduleRead, scheduleWrite, start, stop, isRunning, clear } from '../../src/scripts/utils/raf.js';

describe('raf scheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stop();
    clear();
  });

  afterEach(() => {
    stop();
    clear();
    vi.useRealTimers();
  });

  describe('scheduleRead / scheduleWrite (one-shot mode)', () => {
    it('executes a read callback on the next frame', async () => {
      const fn = vi.fn();
      scheduleRead(fn);
      expect(fn).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(16);
      expect(fn).toHaveBeenCalledOnce();
    });

    it('executes a write callback on the next frame', async () => {
      const fn = vi.fn();
      scheduleWrite(fn);
      expect(fn).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(16);
      expect(fn).toHaveBeenCalledOnce();
    });

    it('executes reads before writes within the same frame', async () => {
      const order = [];
      scheduleWrite(() => order.push('write'));
      scheduleRead(() => order.push('read'));

      await vi.advanceTimersByTimeAsync(16);
      expect(order).toEqual(['read', 'write']);
    });

    it('batches multiple reads and writes into a single frame', async () => {
      const order = [];
      scheduleRead(() => order.push('r1'));
      scheduleRead(() => order.push('r2'));
      scheduleWrite(() => order.push('w1'));
      scheduleWrite(() => order.push('w2'));

      await vi.advanceTimersByTimeAsync(16);
      expect(order).toEqual(['r1', 'r2', 'w1', 'w2']);
    });
  });

  describe('start / stop (continuous loop)', () => {
    it('start() begins the continuous loop', () => {
      expect(isRunning()).toBe(false);
      start();
      expect(isRunning()).toBe(true);
    });

    it('stop() ends the continuous loop', () => {
      start();
      stop();
      expect(isRunning()).toBe(false);
    });

    it('start() is idempotent when already running', () => {
      start();
      start(); // should not throw or double-schedule
      expect(isRunning()).toBe(true);
    });

    it('executes scheduled callbacks each frame while running', async () => {
      start();
      const fn = vi.fn();
      scheduleRead(fn);

      await vi.advanceTimersByTimeAsync(16);
      expect(fn).toHaveBeenCalledOnce();
    });

    it('continues ticking after draining callbacks', async () => {
      start();
      const fn = vi.fn();

      // Advance one frame with no callbacks — loop should still run
      await vi.advanceTimersByTimeAsync(16);

      scheduleRead(fn);
      await vi.advanceTimersByTimeAsync(16);
      expect(fn).toHaveBeenCalledOnce();
    });
  });

  describe('clear', () => {
    it('removes all pending callbacks without executing them', async () => {
      const fn = vi.fn();
      scheduleRead(fn);
      scheduleWrite(fn);
      clear();

      await vi.advanceTimersByTimeAsync(16);
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('isRunning', () => {
    it('returns false initially', () => {
      expect(isRunning()).toBe(false);
    });

    it('returns true after start', () => {
      start();
      expect(isRunning()).toBe(true);
    });

    it('returns false after stop', () => {
      start();
      stop();
      expect(isRunning()).toBe(false);
    });
  });
});
