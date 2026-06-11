/**
 * SceneManager — Discovers [data-scene] elements, instantiates scene
 * modules, and wires them to ScrollEngine lifecycle events.
 *
 * The SceneManager is the bridge between the DOM and the scroll-driven
 * animation system. It dynamically imports scene modules based on the
 * `data-scene` attribute value and connects their lifecycle methods
 * (init, enter, active, exit, destroy) to ScrollEngine events.
 *
 * @module scene-manager
 * @see Requirements 2.1, 2.3, 2.4
 */

import { prefersReducedMotion } from '../utils/motion.js';

/**
 * @typedef {Object} SceneModule
 * @property {(sceneEl: HTMLElement) => void} init
 * @property {(progress: number) => void} enter
 * @property {(progress: number) => void} active
 * @property {(progress: number) => void} exit
 * @property {() => void} destroy
 */

/**
 * @typedef {Object} SceneEntry
 * @property {string} id - Scene type from data-scene attribute
 * @property {HTMLElement} element - DOM reference
 * @property {SceneModule|null} module - Loaded scene module (null if load failed)
 */

/**
 * Default scene configuration values for accent hue and parallax layers.
 * Scenes can override these via data attributes.
 */
const SCENE_DEFAULTS = {
  hero: { accentHue: 270, parallaxLayers: { background: 0.15, midground: 0.4, foreground: 0.8 } },
  highlights: { accentHue: 40, parallaxLayers: { background: 0.2, midground: 0.45, foreground: 0.75 } },
  timeline: { accentHue: 200, parallaxLayers: { background: 0.1, midground: 0.35, foreground: 0.7 } },
  projects: { accentHue: 280, parallaxLayers: { background: 0.15, midground: 0.4, foreground: 0.8 } },
  theater: { accentHue: 320, parallaxLayers: { background: 0.1, midground: 0.3, foreground: 0.6 } },
  skills: { accentHue: 180, parallaxLayers: { background: 0.15, midground: 0.35, foreground: 0.7 } },
  connect: { accentHue: 250, parallaxLayers: { background: 0.1, midground: 0.3, foreground: 0.65 } },
  footer: { accentHue: 260, parallaxLayers: { background: 0.1, midground: 0.25, foreground: 0.5 } },
};

/**
 * SceneManager class — orchestrates scene lifecycle.
 */
export class SceneManager {
  /**
   * @param {Object} options
   * @param {Object} options.scrollEngine - ScrollEngine instance for registering scenes
   * @param {string} [options.selector='[data-scene]'] - CSS selector for scene elements
   * @param {boolean} [options.reducedMotion] - Override reduced motion detection
   */
  constructor(options = {}) {
    const { scrollEngine, selector = '[data-scene]', reducedMotion } = options;

    if (!scrollEngine) {
      throw new Error('SceneManager requires a scrollEngine instance');
    }

    /** @type {Object} */
    this.scrollEngine = scrollEngine;

    /** @type {string} */
    this.selector = selector;

    /** @type {boolean} */
    this.reducedMotion = reducedMotion ?? prefersReducedMotion();

    /** @type {SceneEntry[]} */
    this.scenes = [];

    /** @type {boolean} */
    this.initialized = false;
  }

  /**
   * Discover scene elements in the DOM, load their modules, and wire
   * them to the ScrollEngine lifecycle.
   *
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) return;

    const elements = document.querySelectorAll(this.selector);

    // Load all scene modules in parallel
    const loadPromises = Array.from(elements).map((el) => this._loadScene(el));
    await Promise.allSettled(loadPromises);

    this.initialized = true;
  }

  /**
   * Load a single scene module and wire it up.
   *
   * @param {HTMLElement} el - Scene DOM element
   * @returns {Promise<void>}
   * @private
   */
  async _loadScene(el) {
    const sceneType = el.getAttribute('data-scene');

    if (!sceneType) {
      console.warn('[SceneManager] Element missing data-scene value:', el);
      return;
    }

    const entry = {
      id: sceneType,
      element: el,
      module: null,
    };

    // Attempt dynamic import of the scene module
    try {
      const mod = await import(`../scenes/${sceneType}.js`);
      const sceneModule = this._resolveModule(mod);

      if (!sceneModule) {
        console.warn(`[SceneManager] Scene module "${sceneType}" does not export a valid interface`);
        this.scenes.push(entry);
        this._registerWithEngine(entry);
        return;
      }

      entry.module = sceneModule;

      // Initialize the scene module with its DOM element
      sceneModule.init(el);
    } catch (err) {
      // Gracefully handle missing modules — the design is incremental
      console.warn(`[SceneManager] Could not load scene module "${sceneType}":`, err.message);
    }

    this.scenes.push(entry);
    this._registerWithEngine(entry);
  }

  /**
   * Resolve the scene module from a dynamic import result.
   * Supports both default export objects and named exports.
   *
   * @param {Object} mod - Import result
   * @returns {SceneModule|null}
   * @private
   */
  _resolveModule(mod) {
    // Check for default export with the scene interface
    if (mod.default && typeof mod.default.init === 'function') {
      return mod.default;
    }

    // Check if the module itself has the interface (named exports)
    if (typeof mod.init === 'function') {
      return mod;
    }

    return null;
  }

  /**
   * Register a scene element with the ScrollEngine and wire lifecycle events.
   *
   * @param {SceneEntry} entry
   * @private
   */
  _registerWithEngine(entry) {
    const { scrollEngine, reducedMotion } = this;
    const config = this._getSceneConfig(entry);

    const callbacks = {
      enter: (progress) => {
        if (entry.module && entry.module.enter) {
          entry.module.enter(reducedMotion ? 1 : progress);
        }
      },
      active: (progress) => {
        if (entry.module && entry.module.active) {
          entry.module.active(reducedMotion ? 1 : progress);
        }
      },
      exit: (progress) => {
        if (entry.module && entry.module.exit) {
          entry.module.exit(reducedMotion ? 1 : progress);
        }
      },
    };

    // Register with ScrollEngine if it exposes registerScene
    if (typeof scrollEngine.registerScene === 'function') {
      scrollEngine.registerScene(entry.element, callbacks, config);
    }
  }

  /**
   * Build configuration for a scene based on defaults and data attributes.
   *
   * @param {SceneEntry} entry
   * @returns {Object} Scene configuration
   * @private
   */
  _getSceneConfig(entry) {
    const defaults = SCENE_DEFAULTS[entry.id] || {
      accentHue: 0,
      parallaxLayers: { background: 0.15, midground: 0.4, foreground: 0.8 },
    };

    // Allow data attributes to override defaults
    const accentHue = entry.element.hasAttribute('data-accent-hue')
      ? Number(entry.element.getAttribute('data-accent-hue'))
      : defaults.accentHue;

    return {
      id: entry.id,
      element: entry.element,
      accentHue,
      parallaxLayers: { ...defaults.parallaxLayers },
    };
  }

  /**
   * Returns the currently active scene (first one in the list with a module loaded).
   * Useful for ambient layer color shifts.
   *
   * @returns {SceneEntry|null}
   */
  getActiveScene() {
    return this.scenes.find((s) => s.module !== null) || null;
  }

  /**
   * Get all registered scene entries.
   *
   * @returns {SceneEntry[]}
   */
  getScenes() {
    return this.scenes;
  }

  /**
   * Tear down all scene modules and clean up references.
   */
  destroy() {
    for (const entry of this.scenes) {
      if (entry.module && typeof entry.module.destroy === 'function') {
        try {
          entry.module.destroy();
        } catch (err) {
          console.warn(`[SceneManager] Error destroying scene "${entry.id}":`, err.message);
        }
      }
    }

    this.scenes = [];
    this.initialized = false;
  }
}

/**
 * Factory function — creates and initializes a SceneManager.
 *
 * @param {Object} options
 * @param {Object} options.scrollEngine - ScrollEngine instance
 * @param {string} [options.selector] - CSS selector for scene elements
 * @param {boolean} [options.reducedMotion] - Override reduced motion detection
 * @returns {Promise<SceneManager>}
 */
export async function init(options) {
  const manager = new SceneManager(options);
  await manager.init();
  return manager;
}
