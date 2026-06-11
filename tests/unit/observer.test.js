import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_THRESHOLDS,
  isSupported,
  createObserver,
  observeAll,
  disconnect,
} from '../../src/scripts/utils/observer.js';

/**
 * Minimal IntersectionObserver mock for jsdom.
 */
function installMockObserver() {
  const instances = [];

  class MockIntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.observed = [];
      instances.push(this);
    }

    observe(el) {
      this.observed.push(el);
    }

    unobserve(el) {
      this.observed = this.observed.filter((e) => e !== el);
    }

    disconnect() {
      this.observed = [];
    }
  }

  // Also add IntersectionObserverEntry with intersectionRatio on prototype
  class MockIntersectionObserverEntry {
    constructor() {
      this.intersectionRatio = 0;
    }
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  vi.stubGlobal('IntersectionObserverEntry', MockIntersectionObserverEntry);
  // Ensure prototype has intersectionRatio
  MockIntersectionObserverEntry.prototype.intersectionRatio = 0;

  return instances;
}

describe('observer utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('DEFAULT_THRESHOLDS', () => {
    it('provides 6 threshold values covering 0 to 1', () => {
      expect(DEFAULT_THRESHOLDS).toEqual([0, 0.1, 0.25, 0.5, 0.75, 1.0]);
    });
  });

  describe('isSupported', () => {
    it('returns true when IntersectionObserver is available', () => {
      installMockObserver();
      expect(isSupported()).toBe(true);
    });

    it('returns false when IntersectionObserver is missing', () => {
      vi.stubGlobal('IntersectionObserver', undefined);
      expect(isSupported()).toBe(false);
    });

    it('returns false when IntersectionObserverEntry is missing', () => {
      vi.stubGlobal('IntersectionObserver', class {});
      vi.stubGlobal('IntersectionObserverEntry', undefined);
      expect(isSupported()).toBe(false);
    });
  });

  describe('createObserver', () => {
    it('returns an IntersectionObserver instance when supported', () => {
      installMockObserver();
      const callback = vi.fn();
      const observer = createObserver(callback);

      expect(observer).not.toBeNull();
      expect(observer.options.threshold).toEqual(DEFAULT_THRESHOLDS);
      expect(observer.options.rootMargin).toBe('0px');
      expect(observer.options.root).toBeNull();
    });

    it('applies custom options', () => {
      installMockObserver();
      const callback = vi.fn();
      const root = document.createElement('div');
      const observer = createObserver(callback, {
        threshold: [0, 0.5, 1],
        rootMargin: '100px',
        root,
      });

      expect(observer.options.threshold).toEqual([0, 0.5, 1]);
      expect(observer.options.rootMargin).toBe('100px');
      expect(observer.options.root).toBe(root);
    });

    it('returns null when IntersectionObserver is unsupported', () => {
      vi.stubGlobal('IntersectionObserver', undefined);
      const callback = vi.fn();
      const observer = createObserver(callback);

      expect(observer).toBeNull();
    });
  });

  describe('observeAll', () => {
    it('observes all provided elements', () => {
      installMockObserver();
      const callback = vi.fn();
      const observer = createObserver(callback);

      const el1 = document.createElement('div');
      const el2 = document.createElement('section');
      const el3 = document.createElement('article');

      observeAll(observer, [el1, el2, el3]);

      expect(observer.observed).toContain(el1);
      expect(observer.observed).toContain(el2);
      expect(observer.observed).toContain(el3);
      expect(observer.observed).toHaveLength(3);
    });

    it('is a no-op when observer is null', () => {
      // Should not throw
      expect(() => observeAll(null, [document.createElement('div')])).not.toThrow();
    });
  });

  describe('disconnect', () => {
    it('disconnects the observer and clears observed elements', () => {
      installMockObserver();
      const callback = vi.fn();
      const observer = createObserver(callback);

      const el = document.createElement('div');
      observer.observe(el);
      expect(observer.observed).toHaveLength(1);

      disconnect(observer);
      expect(observer.observed).toHaveLength(0);
    });

    it('is a no-op when observer is null', () => {
      expect(() => disconnect(null)).not.toThrow();
    });
  });
});
