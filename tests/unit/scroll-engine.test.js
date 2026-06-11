import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// --- Mocks for dependencies ---

// Mock motion.js
vi.mock('../../src/scripts/utils/motion.js', () => {
  let motionCallback = null;
  return {
    prefersReducedMotion: vi.fn(() => false),
    onChange: vi.fn((cb) => {
      motionCallback = cb;
      return () => { motionCallback = null; };
    }),
    __triggerChange: (value) => { if (motionCallback) motionCallback(value); },
  };
});

// Mock raf.js — execute callbacks synchronously for testing
vi.mock('../../src/scripts/utils/raf.js', () => ({
  scheduleRead: vi.fn((fn) => fn()),
  scheduleWrite: vi.fn((fn) => fn()),
}));

// Mock observer.js
const mockObserverInstances = [];
vi.mock('../../src/scripts/utils/observer.js', () => ({
  DEFAULT_THRESHOLDS: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
  createObserver: vi.fn((callback, options) => {
    const instance = {
      callback,
      options,
      observed: [],
      observe(el) { this.observed.push(el); },
      disconnect() { this.observed = []; },
    };
    mockObserverInstances.push(instance);
    return instance;
  }),
  disconnect: vi.fn((observer) => {
    if (observer) observer.disconnect();
  }),
}));

import { ScrollEngine } from '../../src/scripts/core/scroll-engine.js';
import { prefersReducedMotion, onChange as onMotionChange, __triggerChange } from '../../src/scripts/utils/motion.js';
import { scheduleRead, scheduleWrite } from '../../src/scripts/utils/raf.js';
import { createObserver, disconnect } from '../../src/scripts/utils/observer.js';

/**
 * Helper to create a scene element with a bounding rect.
 */
function createSceneElement(id, { top = 0, height = 800 } = {}) {
  const el = document.createElement('section');
  el.dataset.scene = id;
  el.getBoundingClientRect = vi.fn(() => ({
    top,
    bottom: top + height,
    height,
    left: 0,
    right: 1024,
    width: 1024,
    x: 0,
    y: top,
  }));
  return el;
}

/**
 * Helper to simulate IntersectionObserver entries.
 */
function triggerIntersection(observer, entries) {
  observer.callback(entries);
}

describe('ScrollEngine', () => {
  let engine;
  let addEventListenerSpy;
  let removeEventListenerSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    mockObserverInstances.length = 0;

    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    // Default viewport/scroll values
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });
  });

  afterEach(() => {
    if (engine) {
      engine.destroy();
      engine = null;
    }
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  describe('constructor', () => {
    it('creates an IntersectionObserver on init', () => {
      engine = new ScrollEngine();
      expect(createObserver).toHaveBeenCalledOnce();
    });

    it('registers a passive scroll listener on window', () => {
      engine = new ScrollEngine();
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      );
    });

    it('subscribes to reduced-motion changes', () => {
      engine = new ScrollEngine();
      expect(onMotionChange).toHaveBeenCalledWith(expect.any(Function));
    });

    it('detects reduced motion state on construction', () => {
      prefersReducedMotion.mockReturnValueOnce(true);
      engine = new ScrollEngine();
      expect(engine.isReducedMotion).toBe(true);
    });
  });

  describe('registerScene', () => {
    it('returns a scene ID based on data-scene attribute', () => {
      engine = new ScrollEngine();
      const el = createSceneElement('hero');
      const id = engine.registerScene(el);
      expect(id).toBe('hero');
    });

    it('falls back to element id attribute', () => {
      engine = new ScrollEngine();
      const el = document.createElement('section');
      el.id = 'my-section';
      const id = engine.registerScene(el);
      expect(id).toBe('my-section');
    });

    it('generates a unique ID when no data-scene or id is set', () => {
      engine = new ScrollEngine();
      const el = document.createElement('section');
      const id = engine.registerScene(el);
      expect(id).toMatch(/^scene-\d+$/);
    });

    it('initializes --scene-progress CSS variable to 0', () => {
      engine = new ScrollEngine();
      const el = createSceneElement('hero');
      engine.registerScene(el);
      expect(el.style.getPropertyValue('--scene-progress')).toBe('0');
    });

    it('starts observing the element via IntersectionObserver', () => {
      engine = new ScrollEngine();
      const el = createSceneElement('hero');
      engine.registerScene(el);
      const observer = mockObserverInstances[0];
      expect(observer.observed).toContain(el);
    });

    it('does not register after destroy()', () => {
      engine = new ScrollEngine();
      engine.destroy();
      const el = createSceneElement('hero');
      const id = engine.registerScene(el);
      expect(id).toBe('');
    });
  });

  describe('getProgress', () => {
    it('returns 0 for a newly registered scene', () => {
      engine = new ScrollEngine();
      const el = createSceneElement('hero');
      engine.registerScene(el);
      expect(engine.getProgress('hero')).toBe(0);
    });

    it('returns 0 for an unknown scene ID', () => {
      engine = new ScrollEngine();
      expect(engine.getProgress('nonexistent')).toBe(0);
    });
  });

  describe('onSceneChange', () => {
    it('notifies listeners when a scene lifecycle changes', () => {
      engine = new ScrollEngine();
      const el = createSceneElement('hero');
      engine.registerScene(el);

      const listener = vi.fn();
      engine.onSceneChange(listener);

      // Simulate intersection (scene entering viewport)
      const observer = mockObserverInstances[0];
      triggerIntersection(observer, [{
        target: el,
        isIntersecting: true,
        intersectionRatio: 0.5,
      }]);

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith('hero', expect.any(String), expect.any(Number));
    });

    it('returns an unsubscribe function', () => {
      engine = new ScrollEngine();
      const el = createSceneElement('hero');
      engine.registerScene(el);

      const listener = vi.fn();
      const unsub = engine.onSceneChange(listener);

      unsub();

      // Simulate intersection
      const observer = mockObserverInstances[0];
      triggerIntersection(observer, [{
        target: el,
        isIntersecting: true,
        intersectionRatio: 0.5,
      }]);

      // listener should not be called since we unsubscribed before the intersection triggered the lifecycle change
      // Actually, the enter transition call happens synchronously in handleIntersections
      // But since we unsubscribed, it should not fire
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('lifecycle events', () => {
    it('invokes enter callback when scene enters viewport', () => {
      engine = new ScrollEngine();
      const el = createSceneElement('hero');
      const enterCb = vi.fn();
      engine.registerScene(el, { enter: enterCb });

      const observer = mockObserverInstances[0];
      triggerIntersection(observer, [{
        target: el,
        isIntersecting: true,
        intersectionRatio: 0.1,
      }]);

      expect(enterCb).toHaveBeenCalledWith(0);
    });

    it('invokes exit callback when scene leaves viewport', () => {
      engine = new ScrollEngine();
      const el = createSceneElement('hero');
      const exitCb = vi.fn();
      engine.registerScene(el, { exit: exitCb });

      const observer = mockObserverInstances[0];

      // First enter
      triggerIntersection(observer, [{
        target: el,
        isIntersecting: true,
        intersectionRatio: 0.5,
      }]);

      // Then exit
      triggerIntersection(observer, [{
        target: el,
        isIntersecting: false,
        intersectionRatio: 0,
      }]);

      expect(exitCb).toHaveBeenCalledWith(1);
    });

    it('invokes active callback during scroll progress', () => {
      engine = new ScrollEngine();

      // Scene: elementTop=0, height=800, viewport=800
      // totalScrollDistance = 800 + 800 = 1600
      // For progress to be in 0.3-0.7 (active), scrolled must be 480-1120
      // scrolled = scrollY + viewportHeight - elementTop
      // If rect.top = -400 and scrollY = 400:
      //   elementTop = rect.top + scrollY = -400 + 400 = 0
      //   scrolled = 400 + 800 - 0 = 1200
      //   progress = 1200 / 1600 = 0.75 — this lands in exit zone (>0.7)
      //
      // We need scrolled = 800 → progress = 0.5 (active zone)
      // scrolled = scrollY + 800 - elementTop = scrollY + 800 - (rect.top + scrollY) = -rect.top + 800
      // For scrolled=800: -rect.top + 800 = 800 → rect.top = 0
      // But we also need scrollY so the element is "visible"
      // Let's use: scrollY=0, rect.top=0, height=800, viewport=800
      // scrolled = 0 + 800 - 0 = 800, progress = 800/1600 = 0.5 ✓

      const el = createSceneElement('hero', { top: 0, height: 800 });
      const activeCb = vi.fn();
      engine.registerScene(el, { active: activeCb });

      // Mark as visible
      const observer = mockObserverInstances[0];
      triggerIntersection(observer, [{
        target: el,
        isIntersecting: true,
        intersectionRatio: 0.5,
      }]);

      // The intersection callback triggers #requestUpdate which calls #computeProgress synchronously
      // With scrollY=0, rect.top=0 (elementTop=0), height=800, viewport=800:
      // scrolled = 0 + 800 - 0 = 800, totalScrollDistance = 1600, progress = 0.5
      // 0.5 is in the active zone (0.3–0.7)
      expect(activeCb).toHaveBeenCalled();
    });
  });

  describe('--scene-progress CSS variable', () => {
    it('updates the CSS variable based on scroll progress', () => {
      engine = new ScrollEngine();
      const el = createSceneElement('hero', { top: 0, height: 800 });
      engine.registerScene(el);

      // Mark as visible
      const observer = mockObserverInstances[0];
      triggerIntersection(observer, [{
        target: el,
        isIntersecting: true,
        intersectionRatio: 0.5,
      }]);

      // After computation, CSS variable should be set
      const value = parseFloat(el.style.getPropertyValue('--scene-progress'));
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });
  });

  describe('reduced motion', () => {
    it('snaps progress to 0 or 1 when reduced motion is active', () => {
      prefersReducedMotion.mockReturnValueOnce(true);
      engine = new ScrollEngine();

      const el = createSceneElement('hero', { top: -200, height: 800 });
      engine.registerScene(el);

      const observer = mockObserverInstances[0];
      triggerIntersection(observer, [{
        target: el,
        isIntersecting: true,
        intersectionRatio: 0.3,
      }]);

      const value = parseFloat(el.style.getPropertyValue('--scene-progress'));
      expect(value === 0 || value === 1).toBe(true);
    });

    it('responds to reduced motion preference changes', () => {
      engine = new ScrollEngine();
      expect(engine.isReducedMotion).toBe(false);

      __triggerChange(true);
      expect(engine.isReducedMotion).toBe(true);
    });
  });

  describe('destroy', () => {
    it('removes the scroll event listener', () => {
      engine = new ScrollEngine();
      engine.destroy();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );
    });

    it('disconnects the IntersectionObserver', () => {
      engine = new ScrollEngine();
      engine.destroy();
      expect(disconnect).toHaveBeenCalled();
    });

    it('removes --scene-progress CSS variable from all scenes', () => {
      engine = new ScrollEngine();
      const el = createSceneElement('hero');
      engine.registerScene(el);
      el.style.setProperty('--scene-progress', '0.5');

      engine.destroy();
      expect(el.style.getPropertyValue('--scene-progress')).toBe('');
    });

    it('clears all registered scenes', () => {
      engine = new ScrollEngine();
      const el = createSceneElement('hero');
      engine.registerScene(el);

      engine.destroy();
      expect(engine.sceneIds).toHaveLength(0);
    });

    it('is idempotent — calling destroy twice does not throw', () => {
      engine = new ScrollEngine();
      engine.destroy();
      expect(() => engine.destroy()).not.toThrow();
    });
  });

  describe('sceneIds getter', () => {
    it('returns all registered scene IDs', () => {
      engine = new ScrollEngine();
      const el1 = createSceneElement('hero');
      const el2 = createSceneElement('timeline');
      engine.registerScene(el1);
      engine.registerScene(el2);
      expect(engine.sceneIds).toEqual(['hero', 'timeline']);
    });
  });

  describe('usesNativeScrollTimeline', () => {
    it('returns false when CSS.supports is not available', () => {
      engine = new ScrollEngine();
      // By default in jsdom, CSS.supports is not available
      expect(engine.usesNativeScrollTimeline).toBe(false);
    });
  });
});
