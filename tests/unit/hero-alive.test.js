import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initHeroAlive } from '../../src/scripts/hero-alive.js';

let rafQueue;
let ioInstances;
let pointerMode = 'fine'; // 'fine' | 'coarse'

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

function stepFrames(n) {
  for (let i = 0; i < n; i += 1) {
    const pending = rafQueue.filter(Boolean);
    rafQueue = [];
    if (!pending.length) break;
    pending.forEach((cb) => cb());
  }
}

function stubMatchMedia() {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query) => {
      let matches = false;
      if (query.includes('prefers-reduced-motion')) matches = false;
      else if (query.includes('hover: hover')) matches = pointerMode === 'fine';
      else if (query.includes('hover: none') || query.includes('pointer: coarse'))
        matches = pointerMode === 'coarse';
      return {
        matches,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    })
  );
}

function stubIntersectionObserver() {
  ioInstances = [];
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (callback) {
      const instance = {
        callback,
        observed: [],
        observe(el) {
          this.observed.push(el);
        },
        unobserve() {},
        disconnect() {},
      };
      ioInstances.push(instance);
      return instance;
    })
  );
}

function setScrollY(value) {
  Object.defineProperty(window, 'scrollY', {
    value,
    configurable: true,
    writable: true,
  });
  // Real scrolls always fire a scroll event — the on-demand loop wakes on it.
  window.dispatchEvent(new window.Event('scroll'));
}

beforeEach(() => {
  vi.restoreAllMocks();
  pointerMode = 'fine';
  stubRaf();
  stubMatchMedia();
  stubIntersectionObserver();
  document.body.innerHTML = `
    <section id="hero">
      <div class="hero__aurora-shift"><div class="hero__aurora"></div></div>
      <div class="hero__content"></div>
    </section>`;
  setScrollY(0);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('living hero', () => {
  it('pulls the aurora toward the pointer', () => {
    initHeroAlive();
    ioInstances[0].callback([{ isIntersecting: true }]);

    const hero = document.getElementById('hero');
    const move = new window.Event('pointermove');
    move.clientX = window.innerWidth; // far right -> full pull
    move.clientY = 0;
    hero.dispatchEvent(move);
    stepFrames(80);

    const transform = document
      .querySelector('.hero__aurora-shift')
      .style.transform.replace('translate3d(', '')
      .split(',')[0];
    expect(parseFloat(transform)).toBeGreaterThan(20);

    // Content visibly tilts toward the pointer (compositor-only)
    expect(document.querySelector('.hero__content').style.transform).toContain('rotateY');
  });

  it('parallaxes and fades content purely from current scroll', () => {
    initHeroAlive();
    ioInstances[0].callback([{ isIntersecting: true }]);

    // getBoundingClientRect height is 0 in jsdom, so heroH guards to 1:
    // scrollY 1 == fully past the hero.
    setScrollY(1);
    stepFrames(3);

    const content = document.querySelector('.hero__content');
    expect(content.style.transform).toContain('scale(0.9400)');
    expect(parseFloat(content.style.opacity)).toBeLessThan(0.2);

    // Reversing scroll reverses the motion with no seam
    setScrollY(0);
    stepFrames(3);
    expect(content.style.transform).toContain('scale(1.0000)');
    expect(parseFloat(content.style.opacity)).toBe(1);
  });

  it('pauses all work while the hero is off-screen', () => {
    initHeroAlive();
    ioInstances[0].callback([{ isIntersecting: false }]);
    stepFrames(5);
    expect(rafQueue.filter(Boolean).length).toBe(0);
  });

  it('sleeps when settled instead of running a perpetual loop', () => {
    initHeroAlive();
    ioInstances[0].callback([{ isIntersecting: true }]);
    stepFrames(10);
    // No input: pointer settled, scroll unchanged — no frames pending.
    expect(rafQueue.filter(Boolean).length).toBe(0);

    // New scroll input wakes the loop exactly once.
    setScrollY(1);
    expect(rafQueue.filter(Boolean).length).toBe(1);
    stepFrames(5);
    expect(document.querySelector('.hero__content').style.transform).toContain('scale(0.9400)');
    expect(rafQueue.filter(Boolean).length).toBe(0);
  });

  it('stays fully static on coarse pointers: no loop, no styles', () => {
    pointerMode = 'coarse';
    initHeroAlive();
    expect(ioInstances.length).toBe(0);

    setScrollY(1);
    const hero = document.getElementById('hero');
    hero.dispatchEvent(new window.Event('pointermove'));
    stepFrames(5);

    // Nothing attached, nothing scheduled, nothing written.
    expect(rafQueue.filter(Boolean).length).toBe(0);
    expect(document.querySelector('.hero__content').style.transform).toBe('');
    expect(document.querySelector('.hero__content').style.opacity).toBe('');
    expect(document.querySelector('.hero__aurora-shift').style.transform).toBe('');
  });
});
