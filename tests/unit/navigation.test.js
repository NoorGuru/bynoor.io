import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initNavigation } from '../../src/scripts/navigation.js';

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
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
}

function flushRaf() {
  const pending = rafQueue.filter(Boolean);
  rafQueue = [];
  pending.forEach((cb) => cb());
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
  document.body.innerHTML = `
    <header class="header">
      <nav class="nav">
        <button class="nav__hamburger" aria-expanded="false"></button>
        <div id="nav-links"></div>
      </nav>
    </header>
    <div id="mobile-menu" aria-hidden="true"></div>`;
  setScrollY(0);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('navigation scroll toggle', () => {
  it('adds the scrolled pill past the threshold and removes it near the top', () => {
    initNavigation();
    const header = document.querySelector('.header');

    setScrollY(200);
    window.dispatchEvent(new window.Event('scroll'));
    flushRaf();
    expect(header.classList.contains('nav--scrolled')).toBe(true);

    setScrollY(0);
    window.dispatchEvent(new window.Event('scroll'));
    flushRaf();
    expect(header.classList.contains('nav--scrolled')).toBe(false);
  });

  it('never retriggers a reveal animation while scrolling', () => {
    initNavigation();
    const header = document.querySelector('.header');

    // Scroll down, then creep back up in small deltas (old code re-added
    // nav--reveal on every upward move, keeping the header animating)
    setScrollY(500);
    window.dispatchEvent(new window.Event('scroll'));
    flushRaf();

    for (const y of [490, 480, 470, 460]) {
      setScrollY(y);
      window.dispatchEvent(new window.Event('scroll'));
      flushRaf();
    }

    expect(header.classList.contains('nav--reveal')).toBe(false);
  });
});
