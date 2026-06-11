import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the motion utility
vi.mock('../../src/scripts/utils/motion.js', () => ({
  prefersReducedMotion: vi.fn(() => false),
  onChange: vi.fn(() => vi.fn()),
}));

describe('effects/glow', () => {
  let initGlow, destroy;
  let prefersReducedMotion, onChange;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules();

    const motionMock = await import('../../src/scripts/utils/motion.js');
    prefersReducedMotion = motionMock.prefersReducedMotion;
    onChange = motionMock.onChange;
    prefersReducedMotion.mockReturnValue(false);

    const mod = await import('../../src/scripts/effects/glow.js');
    initGlow = mod.initGlow;
    destroy = mod.destroy;
  });

  afterEach(() => {
    destroy();
    document.body.innerHTML = '';
  });

  describe('initGlow', () => {
    it('attaches listeners to [data-glow] elements', () => {
      const el = document.createElement('div');
      el.setAttribute('data-glow', '');
      document.body.appendChild(el);

      initGlow();

      // Simulate mousemove
      const event = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 50,
      });
      // Mock getBoundingClientRect
      el.getBoundingClientRect = () => ({
        left: 0, top: 0, width: 200, height: 100,
        right: 200, bottom: 100, x: 0, y: 0, toJSON() {},
      });
      el.dispatchEvent(event);

      expect(el.style.getPropertyValue('--glow-x')).toBe('50%');
      expect(el.style.getPropertyValue('--glow-y')).toBe('50%');
    });

    it('calculates cursor position as percentage relative to element', () => {
      const el = document.createElement('div');
      el.setAttribute('data-glow', '');
      document.body.appendChild(el);

      el.getBoundingClientRect = () => ({
        left: 50, top: 20, width: 400, height: 200,
        right: 450, bottom: 220, x: 50, y: 20, toJSON() {},
      });

      initGlow();

      // clientX=150 → (150-50)/400 = 25%, clientY=120 → (120-20)/200 = 50%
      const event = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 120,
      });
      el.dispatchEvent(event);

      expect(el.style.getPropertyValue('--glow-x')).toBe('25%');
      expect(el.style.getPropertyValue('--glow-y')).toBe('50%');
    });

    it('resets to 50% on mouseleave', () => {
      const el = document.createElement('div');
      el.setAttribute('data-glow', '');
      document.body.appendChild(el);

      el.getBoundingClientRect = () => ({
        left: 0, top: 0, width: 100, height: 100,
        right: 100, bottom: 100, x: 0, y: 0, toJSON() {},
      });

      initGlow();

      // First move the cursor
      el.dispatchEvent(new MouseEvent('mousemove', { clientX: 75, clientY: 25 }));
      expect(el.style.getPropertyValue('--glow-x')).toBe('75%');

      // Then leave
      el.dispatchEvent(new MouseEvent('mouseleave'));
      expect(el.style.getPropertyValue('--glow-x')).toBe('50%');
      expect(el.style.getPropertyValue('--glow-y')).toBe('50%');
    });

    it('skips initialization when reduced motion is active', () => {
      prefersReducedMotion.mockReturnValue(true);

      const el = document.createElement('div');
      el.setAttribute('data-glow', '');
      document.body.appendChild(el);

      el.getBoundingClientRect = () => ({
        left: 0, top: 0, width: 100, height: 100,
        right: 100, bottom: 100, x: 0, y: 0, toJSON() {},
      });

      initGlow();

      // Mousemove should have no effect — no listeners attached
      el.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 80 }));
      expect(el.style.getPropertyValue('--glow-x')).toBe('');
    });

    it('accepts a custom selector', () => {
      const el = document.createElement('div');
      el.classList.add('custom-glow');
      document.body.appendChild(el);

      el.getBoundingClientRect = () => ({
        left: 0, top: 0, width: 200, height: 200,
        right: 200, bottom: 200, x: 0, y: 0, toJSON() {},
      });

      initGlow('.custom-glow');

      el.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
      expect(el.style.getPropertyValue('--glow-x')).toBe('50%');
      expect(el.style.getPropertyValue('--glow-y')).toBe('50%');
    });

    it('is idempotent — calling multiple times does not duplicate listeners', () => {
      const el = document.createElement('div');
      el.setAttribute('data-glow', '');
      document.body.appendChild(el);

      let callCount = 0;
      const origAddEventListener = el.addEventListener.bind(el);
      el.addEventListener = (...args) => {
        if (args[0] === 'mousemove') callCount++;
        origAddEventListener(...args);
      };

      initGlow();
      initGlow();
      initGlow();

      expect(callCount).toBe(1);
    });

    it('handles new elements added between calls', () => {
      const el1 = document.createElement('div');
      el1.setAttribute('data-glow', '');
      document.body.appendChild(el1);

      initGlow();

      // Add new element after first init
      const el2 = document.createElement('div');
      el2.setAttribute('data-glow', '');
      document.body.appendChild(el2);

      el2.getBoundingClientRect = () => ({
        left: 0, top: 0, width: 100, height: 100,
        right: 100, bottom: 100, x: 0, y: 0, toJSON() {},
      });

      initGlow(); // Second call picks up new element

      el2.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 70 }));
      expect(el2.style.getPropertyValue('--glow-x')).toBe('30%');
      expect(el2.style.getPropertyValue('--glow-y')).toBe('70%');
    });
  });

  describe('destroy', () => {
    it('removes all listeners and resets CSS variables', () => {
      const el = document.createElement('div');
      el.setAttribute('data-glow', '');
      document.body.appendChild(el);

      el.getBoundingClientRect = () => ({
        left: 0, top: 0, width: 100, height: 100,
        right: 100, bottom: 100, x: 0, y: 0, toJSON() {},
      });

      initGlow();

      // Move cursor
      el.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 20 }));
      expect(el.style.getPropertyValue('--glow-x')).toBe('80%');

      destroy();

      // After destroy, CSS vars should be reset
      expect(el.style.getPropertyValue('--glow-x')).toBe('50%');
      expect(el.style.getPropertyValue('--glow-y')).toBe('50%');

      // Further mousemove should have no effect
      el.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 90 }));
      expect(el.style.getPropertyValue('--glow-x')).toBe('50%');
    });

    it('can be called safely without prior initialization', () => {
      expect(() => destroy()).not.toThrow();
    });

    it('unsubscribes from motion preference changes', () => {
      const unsub = vi.fn();
      onChange.mockReturnValue(unsub);

      const el = document.createElement('div');
      el.setAttribute('data-glow', '');
      document.body.appendChild(el);

      initGlow();
      destroy();

      expect(unsub).toHaveBeenCalled();
    });
  });

  describe('motion preference changes', () => {
    it('removes listeners when reduced motion becomes active', () => {
      let motionCallback;
      onChange.mockImplementation((cb) => {
        motionCallback = cb;
        return vi.fn();
      });

      const el = document.createElement('div');
      el.setAttribute('data-glow', '');
      document.body.appendChild(el);

      el.getBoundingClientRect = () => ({
        left: 0, top: 0, width: 100, height: 100,
        right: 100, bottom: 100, x: 0, y: 0, toJSON() {},
      });

      initGlow();

      // Verify listeners are active
      el.dispatchEvent(new MouseEvent('mousemove', { clientX: 75, clientY: 25 }));
      expect(el.style.getPropertyValue('--glow-x')).toBe('75%');

      // Simulate reduced motion becoming active
      motionCallback(true);

      // Listeners should be removed; further events have no effect
      el.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 90 }));
      expect(el.style.getPropertyValue('--glow-x')).toBe('50%');
    });
  });
});
