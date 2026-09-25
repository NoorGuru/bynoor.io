import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initHeroAlive } from '../../src/scripts/hero-alive.js';

let rafQueue;
let ioInstances;

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
    vi.fn((query) => ({
      // No reduced motion; hover capable so pointer tracking attaches
      matches: query.includes('hover: hover'),
      addEventListener: vi.fn(),
    }))
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
}

beforeEach(() => {
  vi.restoreAllMocks();
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
});
