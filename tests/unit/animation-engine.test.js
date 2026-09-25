import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initAnimationEngine,
  MAX_ENTRANCE_DELAY_MS,
} from '../../src/scripts/animation-engine.js';

function stubMatchMedia(matches = false) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches,
      addEventListener: vi.fn(),
    }))
  );
}

/** Installs a mock IntersectionObserver capturing instance + options. */
function stubIntersectionObserver() {
  const instances = [];
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (callback, options) {
      const instance = {
        callback,
        options,
        observed: [],
        observe(el) {
          this.observed.push(el);
        },
        unobserve(el) {
          this.observed = this.observed.filter((o) => o !== el);
        },
      };
      instances.push(instance);
      return instance;
    })
  );
  return instances;
}

function fireIntersecting(instance, targets) {
  instance.callback(
    targets.map((target) => ({ isIntersecting: true, target })),
    instance
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.useFakeTimers();
  stubMatchMedia(false);
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('animation engine entrance response', () => {
  it('caps long stagger delays instead of holding content hostage', () => {
    document.body.innerHTML =
      '<div data-animate="fade-up" data-animate-delay="1000"></div>';
    const instances = stubIntersectionObserver();

    initAnimationEngine();

    fireIntersecting(instances[0], [
      document.querySelector('[data-animate]'),
    ]);

    const el = document.querySelector('[data-animate]');
    expect(el.classList.contains('animate-visible')).toBe(true);
    expect(el.style.transitionDelay).toBe(`${MAX_ENTRANCE_DELAY_MS}ms`);
    expect(MAX_ENTRANCE_DELAY_MS).toBeLessThanOrEqual(300);
  });

  it('clears the one-shot delay after the entrance settles', () => {
    document.body.innerHTML =
      '<div data-animate="fade-up" data-animate-delay="200"></div>';
    const instances = stubIntersectionObserver();

    initAnimationEngine();

    const el = document.querySelector('[data-animate]');
    fireIntersecting(instances[0], [el]);
    expect(el.style.transitionDelay).toBe('200ms');

    vi.runAllTimers();
    expect(el.style.transitionDelay).toBe('');
  });

  it('reveals without delay when no stagger is declared', () => {
    document.body.innerHTML = '<div data-animate="fade-up"></div>';
    const instances = stubIntersectionObserver();

    initAnimationEngine();

    const el = document.querySelector('[data-animate]');
    fireIntersecting(instances[0], [el]);

    expect(el.classList.contains('animate-visible')).toBe(true);
    expect(el.style.transitionDelay).toBe('');
  });

  it('assigns parent stagger in small increments', () => {
    document.body.innerHTML = `
      <div data-animate-stagger="60">
        <div data-animate="fade-up"></div>
        <div data-animate="fade-up"></div>
        <div data-animate="fade-up"></div>
      </div>`;
    stubIntersectionObserver();

    initAnimationEngine();

    const children = Array.from(document.querySelectorAll('[data-animate]'));
    expect(children[0].getAttribute('data-animate-delay')).toBe('0');
    expect(children[1].getAttribute('data-animate-delay')).toBe('60');
    expect(children[2].getAttribute('data-animate-delay')).toBe('120');
  });
});
