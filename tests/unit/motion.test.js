import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('motion.js — reduced-motion detection utility', () => {
  let changeListeners;
  let mockMatches;

  beforeEach(() => {
    changeListeners = [];
    mockMatches = false;

    // Mock matchMedia before importing the module
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      get matches() { return mockMatches; },
      addEventListener: vi.fn((event, cb) => {
        changeListeners.push(cb);
      }),
      removeEventListener: vi.fn(),
    })));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    document.documentElement.classList.remove('reduced-motion');
  });

  it('prefersReducedMotion() returns false when motion is not reduced', async () => {
    mockMatches = false;
    const { prefersReducedMotion } = await import('../../src/scripts/utils/motion.js');
    expect(prefersReducedMotion()).toBe(false);
  });

  it('prefersReducedMotion() returns true when motion is reduced', async () => {
    mockMatches = true;
    const { prefersReducedMotion } = await import('../../src/scripts/utils/motion.js');
    expect(prefersReducedMotion()).toBe(true);
  });

  it('auto-applies "reduced-motion" class on <html> when preference is active', async () => {
    mockMatches = true;
    await import('../../src/scripts/utils/motion.js');
    expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
  });

  it('does not apply "reduced-motion" class when preference is inactive', async () => {
    mockMatches = false;
    await import('../../src/scripts/utils/motion.js');
    expect(document.documentElement.classList.contains('reduced-motion')).toBe(false);
  });

  it('registers a media query change listener on import', async () => {
    await import('../../src/scripts/utils/motion.js');
    // The module calls matchMedia and registers a listener — proof is that
    // changeListeners array is populated by the mock's addEventListener spy.
    expect(changeListeners.length).toBeGreaterThan(0);
  });

  it('updates <html> class when preference changes', async () => {
    mockMatches = false;
    await import('../../src/scripts/utils/motion.js');

    expect(document.documentElement.classList.contains('reduced-motion')).toBe(false);

    // Simulate user enabling reduced motion
    mockMatches = true;
    changeListeners[0]({ matches: true });

    expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
  });

  it('removes <html> class when preference reverts', async () => {
    mockMatches = true;
    await import('../../src/scripts/utils/motion.js');

    expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);

    // Simulate user disabling reduced motion
    mockMatches = false;
    changeListeners[0]({ matches: false });

    expect(document.documentElement.classList.contains('reduced-motion')).toBe(false);
  });

  it('onChange() notifies subscribers when preference changes', async () => {
    mockMatches = false;
    const { onChange } = await import('../../src/scripts/utils/motion.js');

    const callback = vi.fn();
    onChange(callback);

    // Simulate change
    mockMatches = true;
    changeListeners[0]({ matches: true });

    expect(callback).toHaveBeenCalledWith(true);
  });

  it('onChange() returns an unsubscribe function', async () => {
    mockMatches = false;
    const { onChange } = await import('../../src/scripts/utils/motion.js');

    const callback = vi.fn();
    const unsubscribe = onChange(callback);

    unsubscribe();

    // Simulate change after unsubscribe
    changeListeners[0]({ matches: true });

    expect(callback).not.toHaveBeenCalled();
  });

  it('exports the mediaQuery instance for advanced use', async () => {
    const { mediaQuery } = await import('../../src/scripts/utils/motion.js');
    expect(mediaQuery).toBeDefined();
    expect(mediaQuery.addEventListener).toBeDefined();
  });
});
