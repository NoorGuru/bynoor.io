import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

  class MockIntersectionObserverEntry {
    constructor() {
      this.intersectionRatio = 0;
    }
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  vi.stubGlobal('IntersectionObserverEntry', MockIntersectionObserverEntry);
  MockIntersectionObserverEntry.prototype.intersectionRatio = 0;

  return instances;
}

// Mock the motion utility
vi.mock('../../src/scripts/utils/motion.js', () => ({
  prefersReducedMotion: vi.fn(() => false),
  onChange: vi.fn(() => vi.fn()),
}));

describe('kinetic-type', () => {
  let splitText, triggerReveal, init, destroy;
  let prefersReducedMotion;

  beforeEach(async () => {
    vi.restoreAllMocks();
    installMockObserver();

    // Reset module state by re-importing
    vi.resetModules();
    const motionMock = await import('../../src/scripts/utils/motion.js');
    prefersReducedMotion = motionMock.prefersReducedMotion;
    prefersReducedMotion.mockReturnValue(false);

    const mod = await import('../../src/scripts/effects/kinetic-type.js');
    splitText = mod.splitText;
    triggerReveal = mod.triggerReveal;
    init = mod.init;
    destroy = mod.destroy;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('splitText', () => {
    it('splits text into character spans with --char-index', () => {
      const el = document.createElement('h1');
      el.textContent = 'Hello';

      const spans = splitText(el, 'chars');

      expect(spans).toHaveLength(5);
      expect(spans[0].textContent).toBe('H');
      expect(spans[0].className).toBe('char');
      expect(spans[0].style.getPropertyValue('--char-index')).toBe('0');
      expect(spans[4].textContent).toBe('o');
      expect(spans[4].style.getPropertyValue('--char-index')).toBe('4');
    });

    it('preserves spaces as non-breaking spaces in chars mode', () => {
      const el = document.createElement('h1');
      el.textContent = 'A B';

      const spans = splitText(el, 'chars');

      expect(spans).toHaveLength(3);
      expect(spans[1].innerHTML).toBe('&nbsp;');
    });

    it('splits text into word spans with --char-index', () => {
      const el = document.createElement('p');
      el.textContent = 'Hello world today';

      const spans = splitText(el, 'words');

      expect(spans).toHaveLength(3);
      expect(spans[0].textContent).toBe('Hello');
      expect(spans[0].className).toBe('word');
      expect(spans[0].style.getPropertyValue('--char-index')).toBe('0');
      expect(spans[1].textContent).toBe('world');
      expect(spans[1].style.getPropertyValue('--char-index')).toBe('1');
      expect(spans[2].textContent).toBe('today');
      expect(spans[2].style.getPropertyValue('--char-index')).toBe('2');
    });

    it('sets will-change on each span for GPU acceleration', () => {
      const el = document.createElement('h1');
      el.textContent = 'Hi';

      const spans = splitText(el, 'chars');

      spans.forEach((span) => {
        expect(span.style.willChange).toBe('transform, opacity');
      });
    });

    it('sets aria-label on element and aria-hidden on spans', () => {
      const el = document.createElement('h1');
      el.textContent = 'Test';

      const spans = splitText(el, 'chars');

      expect(el.getAttribute('aria-label')).toBe('Test');
      spans.forEach((span) => {
        expect(span.getAttribute('aria-hidden')).toBe('true');
      });
    });

    it('returns empty array and adds is-visible when reduced motion is active', () => {
      prefersReducedMotion.mockReturnValue(true);

      const el = document.createElement('h1');
      el.textContent = 'Hello';

      const spans = splitText(el, 'chars');

      expect(spans).toHaveLength(0);
      expect(el.classList.contains('is-visible')).toBe(true);
      // Text content should remain unchanged
      expect(el.textContent).toBe('Hello');
    });

    it('adds spacer spans between words in words mode', () => {
      const el = document.createElement('p');
      el.textContent = 'one two';

      splitText(el, 'words');

      // Should have: word span, spacer, word span
      const children = el.children;
      expect(children).toHaveLength(3);
      expect(children[1].className).toBe('char-space');
      expect(children[1].innerHTML).toBe('&nbsp;');
    });
  });

  describe('triggerReveal', () => {
    it('adds is-visible class to element', () => {
      const el = document.createElement('div');

      triggerReveal(el);

      expect(el.classList.contains('is-visible')).toBe(true);
    });

    it('does not remove existing classes', () => {
      const el = document.createElement('div');
      el.classList.add('existing');

      triggerReveal(el);

      expect(el.classList.contains('existing')).toBe(true);
      expect(el.classList.contains('is-visible')).toBe(true);
    });
  });

  describe('init', () => {
    it('splits and observes all [data-kinetic] elements', () => {
      const el1 = document.createElement('h1');
      el1.setAttribute('data-kinetic', 'chars');
      el1.textContent = 'Hi';
      document.body.appendChild(el1);

      const el2 = document.createElement('p');
      el2.setAttribute('data-kinetic', 'words');
      el2.textContent = 'Hello world';
      document.body.appendChild(el2);

      init();

      // el1 should be split into chars
      expect(el1.querySelectorAll('.char')).toHaveLength(2);
      // el2 should be split into words
      expect(el2.querySelectorAll('.word')).toHaveLength(2);

      document.body.removeChild(el1);
      document.body.removeChild(el2);
    });

    it('makes elements visible immediately when reduced motion is active', () => {
      prefersReducedMotion.mockReturnValue(true);

      const el = document.createElement('h1');
      el.setAttribute('data-kinetic', 'chars');
      el.textContent = 'Test';
      document.body.appendChild(el);

      init();

      expect(el.classList.contains('is-visible')).toBe(true);
      // Text should NOT be split
      expect(el.textContent).toBe('Test');

      document.body.removeChild(el);
    });
  });

  describe('destroy', () => {
    it('can be called without error even if not initialized', () => {
      expect(() => destroy()).not.toThrow();
    });

    it('cleans up observer after init', () => {
      const el = document.createElement('h1');
      el.setAttribute('data-kinetic', 'chars');
      el.textContent = 'Hi';
      document.body.appendChild(el);

      init();
      destroy();

      // Should not throw on subsequent destroy
      expect(() => destroy()).not.toThrow();

      document.body.removeChild(el);
    });
  });
});
