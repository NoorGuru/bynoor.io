import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SceneManager, init } from '../../src/scripts/core/scene-manager.js';

// Mock the motion utility
vi.mock('../../src/scripts/utils/motion.js', () => ({
  prefersReducedMotion: vi.fn(() => false),
  onChange: vi.fn(() => () => {}),
  mediaQuery: { matches: false },
}));

/**
 * Create a mock ScrollEngine with the expected API.
 */
function createMockScrollEngine() {
  return {
    registerScene: vi.fn(),
    getProgress: vi.fn(() => 0),
    onSceneChange: vi.fn(),
    destroy: vi.fn(),
  };
}

/**
 * Create a mock scene module implementing the SceneModule interface.
 */
function createMockSceneModule() {
  return {
    init: vi.fn(),
    enter: vi.fn(),
    active: vi.fn(),
    exit: vi.fn(),
    destroy: vi.fn(),
  };
}

/**
 * Set up DOM with scene elements.
 */
function setupDOM(sceneTypes = ['hero', 'timeline', 'projects']) {
  document.body.innerHTML = '';
  const elements = [];

  for (const type of sceneTypes) {
    const el = document.createElement('section');
    el.setAttribute('data-scene', type);
    document.body.appendChild(el);
    elements.push(el);
  }

  return elements;
}

describe('SceneManager', () => {
  let scrollEngine;

  beforeEach(() => {
    scrollEngine = createMockScrollEngine();
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('throws if no scrollEngine is provided', () => {
      expect(() => new SceneManager()).toThrow('SceneManager requires a scrollEngine instance');
    });

    it('accepts a scrollEngine and stores it', () => {
      const manager = new SceneManager({ scrollEngine });
      expect(manager.scrollEngine).toBe(scrollEngine);
    });

    it('uses default selector [data-scene]', () => {
      const manager = new SceneManager({ scrollEngine });
      expect(manager.selector).toBe('[data-scene]');
    });

    it('accepts a custom selector', () => {
      const manager = new SceneManager({ scrollEngine, selector: '.scene' });
      expect(manager.selector).toBe('.scene');
    });

    it('defaults reducedMotion from motion utility', () => {
      const manager = new SceneManager({ scrollEngine });
      expect(manager.reducedMotion).toBe(false);
    });

    it('accepts reducedMotion override', () => {
      const manager = new SceneManager({ scrollEngine, reducedMotion: true });
      expect(manager.reducedMotion).toBe(true);
    });

    it('starts in uninitialized state', () => {
      const manager = new SceneManager({ scrollEngine });
      expect(manager.initialized).toBe(false);
      expect(manager.scenes).toEqual([]);
    });
  });

  describe('init()', () => {
    it('discovers [data-scene] elements in the DOM', async () => {
      const elements = setupDOM(['hero', 'timeline']);
      const manager = new SceneManager({ scrollEngine });

      // Scene modules won't load (they don't exist), but elements are discovered
      await manager.init();

      expect(manager.scenes).toHaveLength(2);
      expect(manager.scenes[0].id).toBe('hero');
      expect(manager.scenes[0].element).toBe(elements[0]);
      expect(manager.scenes[1].id).toBe('timeline');
      expect(manager.scenes[1].element).toBe(elements[1]);
    });

    it('marks manager as initialized', async () => {
      setupDOM(['hero']);
      const manager = new SceneManager({ scrollEngine });
      await manager.init();
      expect(manager.initialized).toBe(true);
    });

    it('is idempotent — second call is a no-op', async () => {
      setupDOM(['hero']);
      const manager = new SceneManager({ scrollEngine });
      await manager.init();
      const sceneCount = manager.scenes.length;
      await manager.init();
      expect(manager.scenes.length).toBe(sceneCount);
    });

    it('handles empty DOM gracefully', async () => {
      document.body.innerHTML = '';
      const manager = new SceneManager({ scrollEngine });
      await manager.init();
      expect(manager.scenes).toHaveLength(0);
      expect(manager.initialized).toBe(true);
    });

    it('handles elements with empty data-scene attribute', async () => {
      const el = document.createElement('section');
      el.setAttribute('data-scene', '');
      document.body.appendChild(el);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const manager = new SceneManager({ scrollEngine });
      await manager.init();

      // Empty data-scene is treated as missing
      expect(manager.scenes).toHaveLength(0);
      consoleSpy.mockRestore();
    });

    it('registers scenes with ScrollEngine even when module fails to load', async () => {
      setupDOM(['hero']);
      const manager = new SceneManager({ scrollEngine });

      // Suppress the expected warning about missing module
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      await manager.init();

      expect(scrollEngine.registerScene).toHaveBeenCalledTimes(1);
      expect(scrollEngine.registerScene).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          enter: expect.any(Function),
          active: expect.any(Function),
          exit: expect.any(Function),
        }),
        expect.objectContaining({
          id: 'hero',
          element: expect.any(HTMLElement),
          accentHue: expect.any(Number),
          parallaxLayers: expect.any(Object),
        })
      );
    });
  });

  describe('_resolveModule()', () => {
    it('resolves a default export with init function', () => {
      const manager = new SceneManager({ scrollEngine });
      const mockModule = createMockSceneModule();
      const result = manager._resolveModule({ default: mockModule });
      expect(result).toBe(mockModule);
    });

    it('resolves named exports with init function', () => {
      const manager = new SceneManager({ scrollEngine });
      const mockModule = createMockSceneModule();
      const result = manager._resolveModule(mockModule);
      expect(result).toBe(mockModule);
    });

    it('returns null for invalid module', () => {
      const manager = new SceneManager({ scrollEngine });
      const result = manager._resolveModule({ foo: 'bar' });
      expect(result).toBeNull();
    });

    it('returns null for empty module', () => {
      const manager = new SceneManager({ scrollEngine });
      const result = manager._resolveModule({});
      expect(result).toBeNull();
    });
  });

  describe('_getSceneConfig()', () => {
    it('returns defaults for known scene types', () => {
      const manager = new SceneManager({ scrollEngine });
      const el = document.createElement('section');
      const entry = { id: 'hero', element: el, module: null };
      const config = manager._getSceneConfig(entry);

      expect(config.id).toBe('hero');
      expect(config.element).toBe(el);
      expect(config.accentHue).toBe(270);
      expect(config.parallaxLayers.background).toBeCloseTo(0.15);
      expect(config.parallaxLayers.midground).toBeCloseTo(0.4);
      expect(config.parallaxLayers.foreground).toBeCloseTo(0.8);
    });

    it('returns fallback defaults for unknown scene types', () => {
      const manager = new SceneManager({ scrollEngine });
      const el = document.createElement('section');
      const entry = { id: 'unknown-scene', element: el, module: null };
      const config = manager._getSceneConfig(entry);

      expect(config.accentHue).toBe(0);
      expect(config.parallaxLayers).toEqual({
        background: 0.15,
        midground: 0.4,
        foreground: 0.8,
      });
    });

    it('respects data-accent-hue attribute override', () => {
      const manager = new SceneManager({ scrollEngine });
      const el = document.createElement('section');
      el.setAttribute('data-accent-hue', '120');
      const entry = { id: 'hero', element: el, module: null };
      const config = manager._getSceneConfig(entry);

      expect(config.accentHue).toBe(120);
    });
  });

  describe('_registerWithEngine()', () => {
    it('calls scrollEngine.registerScene with element, callbacks, and config', () => {
      const manager = new SceneManager({ scrollEngine });
      const el = document.createElement('section');
      const entry = { id: 'timeline', element: el, module: createMockSceneModule() };

      manager._registerWithEngine(entry);

      expect(scrollEngine.registerScene).toHaveBeenCalledWith(
        el,
        expect.objectContaining({
          enter: expect.any(Function),
          active: expect.any(Function),
          exit: expect.any(Function),
        }),
        expect.objectContaining({ id: 'timeline' })
      );
    });

    it('wires enter callback to scene module enter()', () => {
      const manager = new SceneManager({ scrollEngine });
      const mockModule = createMockSceneModule();
      const el = document.createElement('section');
      const entry = { id: 'hero', element: el, module: mockModule };

      manager._registerWithEngine(entry);

      const callbacks = scrollEngine.registerScene.mock.calls[0][1];
      callbacks.enter(0.5);
      expect(mockModule.enter).toHaveBeenCalledWith(0.5);
    });

    it('wires active callback to scene module active()', () => {
      const manager = new SceneManager({ scrollEngine });
      const mockModule = createMockSceneModule();
      const el = document.createElement('section');
      const entry = { id: 'hero', element: el, module: mockModule };

      manager._registerWithEngine(entry);

      const callbacks = scrollEngine.registerScene.mock.calls[0][1];
      callbacks.active(0.75);
      expect(mockModule.active).toHaveBeenCalledWith(0.75);
    });

    it('wires exit callback to scene module exit()', () => {
      const manager = new SceneManager({ scrollEngine });
      const mockModule = createMockSceneModule();
      const el = document.createElement('section');
      const entry = { id: 'hero', element: el, module: mockModule };

      manager._registerWithEngine(entry);

      const callbacks = scrollEngine.registerScene.mock.calls[0][1];
      callbacks.exit(0.3);
      expect(mockModule.exit).toHaveBeenCalledWith(0.3);
    });

    it('passes progress=1 to all callbacks when reducedMotion is true', () => {
      const manager = new SceneManager({ scrollEngine, reducedMotion: true });
      const mockModule = createMockSceneModule();
      const el = document.createElement('section');
      const entry = { id: 'hero', element: el, module: mockModule };

      manager._registerWithEngine(entry);

      const callbacks = scrollEngine.registerScene.mock.calls[0][1];
      callbacks.enter(0.2);
      callbacks.active(0.4);
      callbacks.exit(0.6);

      expect(mockModule.enter).toHaveBeenCalledWith(1);
      expect(mockModule.active).toHaveBeenCalledWith(1);
      expect(mockModule.exit).toHaveBeenCalledWith(1);
    });

    it('handles null module gracefully in callbacks', () => {
      const manager = new SceneManager({ scrollEngine });
      const el = document.createElement('section');
      const entry = { id: 'hero', element: el, module: null };

      manager._registerWithEngine(entry);

      const callbacks = scrollEngine.registerScene.mock.calls[0][1];
      // Should not throw
      expect(() => callbacks.enter(0.5)).not.toThrow();
      expect(() => callbacks.active(0.5)).not.toThrow();
      expect(() => callbacks.exit(0.5)).not.toThrow();
    });
  });

  describe('getActiveScene()', () => {
    it('returns null when no scenes have loaded modules', () => {
      const manager = new SceneManager({ scrollEngine });
      manager.scenes = [
        { id: 'hero', element: document.createElement('div'), module: null },
      ];
      expect(manager.getActiveScene()).toBeNull();
    });

    it('returns first scene with a loaded module', () => {
      const manager = new SceneManager({ scrollEngine });
      const mockModule = createMockSceneModule();
      const entry = { id: 'hero', element: document.createElement('div'), module: mockModule };
      manager.scenes = [
        { id: 'timeline', element: document.createElement('div'), module: null },
        entry,
      ];
      expect(manager.getActiveScene()).toBe(entry);
    });
  });

  describe('getScenes()', () => {
    it('returns all registered scene entries', () => {
      const manager = new SceneManager({ scrollEngine });
      const entries = [
        { id: 'hero', element: document.createElement('div'), module: null },
        { id: 'timeline', element: document.createElement('div'), module: null },
      ];
      manager.scenes = entries;
      expect(manager.getScenes()).toBe(entries);
    });
  });

  describe('destroy()', () => {
    it('calls destroy() on all scene modules', () => {
      const manager = new SceneManager({ scrollEngine });
      const mod1 = createMockSceneModule();
      const mod2 = createMockSceneModule();
      manager.scenes = [
        { id: 'hero', element: document.createElement('div'), module: mod1 },
        { id: 'timeline', element: document.createElement('div'), module: mod2 },
      ];

      manager.destroy();

      expect(mod1.destroy).toHaveBeenCalledTimes(1);
      expect(mod2.destroy).toHaveBeenCalledTimes(1);
    });

    it('skips entries with null modules', () => {
      const manager = new SceneManager({ scrollEngine });
      manager.scenes = [
        { id: 'hero', element: document.createElement('div'), module: null },
      ];

      expect(() => manager.destroy()).not.toThrow();
    });

    it('handles errors in scene destroy gracefully', () => {
      const manager = new SceneManager({ scrollEngine });
      const errorMod = {
        init: vi.fn(),
        enter: vi.fn(),
        active: vi.fn(),
        exit: vi.fn(),
        destroy: vi.fn(() => { throw new Error('cleanup failed'); }),
      };
      manager.scenes = [
        { id: 'hero', element: document.createElement('div'), module: errorMod },
      ];

      vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(() => manager.destroy()).not.toThrow();
    });

    it('clears scenes array and resets initialized flag', () => {
      const manager = new SceneManager({ scrollEngine });
      manager.scenes = [
        { id: 'hero', element: document.createElement('div'), module: createMockSceneModule() },
      ];
      manager.initialized = true;

      manager.destroy();

      expect(manager.scenes).toHaveLength(0);
      expect(manager.initialized).toBe(false);
    });
  });

  describe('init() factory function', () => {
    it('creates and initializes a SceneManager', async () => {
      setupDOM(['hero']);
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const manager = await init({ scrollEngine });

      expect(manager).toBeInstanceOf(SceneManager);
      expect(manager.initialized).toBe(true);
    });

    it('passes options through to constructor', async () => {
      const manager = await init({ scrollEngine, selector: '.custom', reducedMotion: true });
      expect(manager.selector).toBe('.custom');
      expect(manager.reducedMotion).toBe(true);
    });
  });
});
