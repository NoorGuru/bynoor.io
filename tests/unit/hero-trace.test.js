import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initHeroTrace } from '../../src/scripts/hero-trace.js';

const MARKUP = `
  <h1 data-hero-trace>
    <span class="hero__w" style="--i:0">I</span>
    <span class="hero__w" style="--i:1">build</span>
    <span class="hero__w" style="--i:2">tools</span>
    <span class="hero__w" style="--i:3">that</span>
    <span class="hero__w" style="--i:4">help</span>
    <span class="u-brass hero__phrase">engineers move faster</span>
    <span class="hero__w hero__w--period" style="--i:6">.</span>
  </h1>
  <p class="hero__trace" data-hero-trace-status aria-hidden="true">
    <span class="hero__trace-rule"></span>
    <span class="hero__trace-label" data-trace-label>done · weeks → hrs</span>
  </p>
`;

function mockReducedMotion(matches) {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches, addEventListener: vi.fn() })));
}

describe('hero trace caption', () => {
  beforeEach(() => {
    document.body.innerHTML = MARKUP;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('settles on the final state immediately under reduced motion', () => {
    mockReducedMotion(true);
    vi.useFakeTimers();

    initHeroTrace();

    const trace = document.querySelector('.hero__trace');
    expect(document.querySelector('[data-trace-label]').textContent).toBe('done · weeks → hrs');
    expect(trace.classList.contains('is-done')).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('counts each beat then settles, never touching layout', () => {
    mockReducedMotion(false);
    vi.useFakeTimers();

    initHeroTrace();

    const label = document.querySelector('[data-trace-label]');
    const trace = document.querySelector('.hero__trace');

    expect(label.textContent).toBe('done · weeks → hrs');

    // first word beat: 110ms delay + 380ms settle
    vi.advanceTimersByTime(495);
    expect(label.textContent).toBe('01 / 06');

    // last word beat: 110 + 4 * 56 + 380
    vi.advanceTimersByTime(225);
    expect(label.textContent).toBe('05 / 06');

    // brass phrase beat: 720 + 320
    vi.advanceTimersByTime(330);
    expect(label.textContent).toBe('06 / 06');
    expect(trace.classList.contains('is-done')).toBe(false);

    vi.advanceTimersByTime(760);
    expect(label.textContent).toBe('done · weeks → hrs');
    expect(trace.classList.contains('is-done')).toBe(true);
  });

  it('does nothing when the hero markup is absent', () => {
    mockReducedMotion(false);
    document.body.innerHTML = '<p>no hero</p>';
    expect(() => initHeroTrace()).not.toThrow();
  });
});
