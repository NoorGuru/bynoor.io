import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initScrollProgress } from '../../src/scripts/scroll-progress.js';

let rafQueue;
let scrollHeightReads;

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

beforeEach(() => {
  vi.restoreAllMocks();
  stubRaf();
  scrollHeightReads = 0;
  document.body.innerHTML = `<div class="scroll-progress"></div>`;
  // scrollHeight forces layout in browsers — count the reads.
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    get() {
      scrollHeightReads += 1;
      return 2000;
    },
    configurable: true,
  });
  Object.defineProperty(document.documentElement, 'clientHeight', {
    value: 1000,
    configurable: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('scroll progress', () => {
  it('updates progress from 0 to 1 across the page', () => {
    initScrollProgress();
    const bar = document.querySelector('.scroll-progress');
    expect(bar.style.getPropertyValue('--scroll-progress')).toBe('0');

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true, writable: true });
    window.dispatchEvent(new window.Event('scroll'));
    flushRaf();
    expect(bar.style.getPropertyValue('--scroll-progress')).toBe('0.5');

    Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true, writable: true });
    window.dispatchEvent(new window.Event('scroll'));
    flushRaf();
    expect(bar.style.getPropertyValue('--scroll-progress')).toBe('1');
  });

  it('does not re-measure scrollHeight on every scroll frame', () => {
    initScrollProgress();
    const readsAfterInit = scrollHeightReads;

    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true, writable: true });
    window.dispatchEvent(new window.Event('scroll'));
    flushRaf();
    window.dispatchEvent(new window.Event('scroll'));
    flushRaf();

    // Cached: no further layout reads for scrolls within the TTL.
    expect(scrollHeightReads).toBe(readsAfterInit);
  });

  it('re-measures after resize', () => {
    initScrollProgress();
    const readsBefore = scrollHeightReads;

    window.dispatchEvent(new window.Event('resize'));
    flushRaf();

    expect(scrollHeightReads).toBeGreaterThan(readsBefore);
  });
});
