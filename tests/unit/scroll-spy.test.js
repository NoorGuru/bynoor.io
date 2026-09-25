import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initScrollSpy } from '../../src/scripts/scroll-spy.js';

let rafQueue;

function stubRaf() {
  rafQueue = [];
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((cb) => {
      rafQueue.push(cb);
      return rafQueue.length;
    })
  );
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((id) => {
      rafQueue[id - 1] = null;
    })
  );
}

function flushRaf() {
  const pending = rafQueue.filter(Boolean);
  rafQueue = [];
  pending.forEach((cb) => cb());
}

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

beforeEach(() => {
  vi.restoreAllMocks();
  stubRaf();
  document.body.innerHTML = `
    <a class="nav__logo" href="#hero">logo</a>
    <a class="nav__link" href="#skills">Skills</a>
    <main>
      <section id="skills"></section>
    </main>`;
  Object.defineProperty(window, 'scrollY', {
    value: 0,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('scroll-spy scroll handling', () => {
  it('coalesces rapid scroll events into a single rAF update', () => {
    stubIntersectionObserver();
    initScrollSpy();
    const raf = window.requestAnimationFrame;

    window.dispatchEvent(new window.Event('scroll'));
    window.dispatchEvent(new window.Event('scroll'));
    window.dispatchEvent(new window.Event('scroll'));

    // Layout reads (scrollHeight, rects) must not run per raw scroll event
    expect(raf).toHaveBeenCalledTimes(1);

    flushRaf();

    window.dispatchEvent(new window.Event('scroll'));
    expect(raf).toHaveBeenCalledTimes(2);
  });

  it('highlights home when scrolled to the top', () => {
    stubIntersectionObserver();
    initScrollSpy();

    window.dispatchEvent(new window.Event('scroll'));
    flushRaf();

    expect(
      document.querySelector('.nav__logo').classList.contains('nav__link--active')
    ).toBe(true);
  });
});
