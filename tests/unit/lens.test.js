import { describe, it, expect, beforeEach } from 'vitest';
import { LENSES, LENS_ORDERS, resolveLens, initLens } from '../../src/scripts/lens.js';

const ALL_SECTIONS = LENS_ORDERS.engineer;

describe('resolveLens', () => {
  it('accepts each known lens', () => {
    for (const lens of LENSES) {
      expect(resolveLens(lens)).toBe(lens);
    }
  });

  it('falls back to engineer for unknown, empty, and null input', () => {
    expect(resolveLens('hacker')).toBe('engineer');
    expect(resolveLens('')).toBe('engineer');
    expect(resolveLens(null)).toBe('engineer');
  });
});

describe('LENS_ORDERS', () => {
  it('covers every lens with the same section set exactly once, hero first', () => {
    for (const lens of LENSES) {
      const order = LENS_ORDERS[lens];
      expect([...order].sort()).toEqual([...ALL_SECTIONS].sort());
      expect(new Set(order).size).toBe(order.length);
      expect(order[0]).toBe('hero');
    }
  });
});

describe('initLens', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, '', '/');
    document.body.innerHTML = `
      <div class="lens-switch" role="group" aria-label="View this page as">
        <button type="button" class="lens-switch__btn" data-lens="engineer" aria-pressed="true">Engineer</button>
        <button type="button" class="lens-switch__btn" data-lens="builder" aria-pressed="false">Builder</button>
        <button type="button" class="lens-switch__btn" data-lens="teacher" aria-pressed="false">Teacher</button>
      </div>
      <main>
        ${ALL_SECTIONS.map((id) => `<section id="${id}"></section><hr class="section-divider">`).join('')}
      </main>`;
  });

  function currentOrder() {
    return Array.from(document.querySelectorAll('main > section[id]')).map((s) => s.id);
  }

  it('leaves engineer order untouched and marks it pressed', () => {
    initLens();
    expect(currentOrder()).toEqual(LENS_ORDERS.engineer);
    expect(document.querySelector('[data-lens="engineer"]').getAttribute('aria-pressed')).toBe('true');
  });

  it('reorders sections with their dividers on teacher click and persists', () => {
    initLens();
    document.querySelector('[data-lens="teacher"]').click();
    expect(currentOrder()).toEqual(LENS_ORDERS.teacher);
    expect(document.querySelector('[data-lens="teacher"]').getAttribute('aria-pressed')).toBe('true');
    expect(window.localStorage.getItem('bynoor-lens')).toBe('teacher');
    expect(new URL(window.location.href).searchParams.get('lens')).toBe('teacher');
    // Every section still drags its divider along
    expect(document.querySelectorAll('main > hr.section-divider').length).toBe(ALL_SECTIONS.length);
  });

  it('honors ?lens= on load without rewriting history state unexpectedly', () => {
    window.history.replaceState(null, '', '/?lens=builder');
    initLens();
    expect(currentOrder()).toEqual(LENS_ORDERS.builder);
    expect(document.querySelector('[data-lens="builder"]').getAttribute('aria-pressed')).toBe('true');
  });

  it('no-ops when the switch or main is absent', () => {
    document.body.innerHTML = '<main></main>';
    expect(() => initLens()).not.toThrow();
    document.body.innerHTML = '<div></div>';
    expect(() => initLens()).not.toThrow();
  });
});
