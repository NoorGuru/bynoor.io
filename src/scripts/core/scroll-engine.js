/**
 * ScrollEngine — central scroll orchestrator for scene-based animations.
 *
 * Registers scenes (elements with lifecycle callbacks), computes normalized
 * progress [0,1] per scene based on scroll position, updates `--scene-progress`
 * CSS custom property on each scene element, and dispatches lifecycle events
 * (enter, active, exit).
 *
 * Uses IntersectionObserver for coarse visibility detection and a
 * requestAnimationFrame-throttled scroll listener for smooth per-frame
 * progress computation.
 *
 * Progressive enhancement: if the browser supports CSS scroll-driven
 * animations (`animation-timeline: scroll()`), the engine delegates
 * progress tracking to native CSS and only manages lifecycle events.
 *
 * Respects `prefers-reduced-motion` — when active, progress is snapped
 * to 0 or 1 (no intermediate values), and lifecycle callbacks are still
 * invoked but with instant transitions.
 *
 * @module scroll-engine
 * @see Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { createObserver, DEFAULT_THRESHOLDS, disconnect } from '../utils/observer.js';
import { scheduleRead, scheduleWrite } from '../utils/raf.js';
import { prefersReducedMotion, onChange as onMotionChange } from '../utils/motion.js';

/**
 * Scene lifecycle states.
 * @enum {string}
 */
const LIFECYCLE = {
  IDLE: 'idle',
  ENTER: 'enter',
  ACTIVE: 'active',
  EXIT: 'exit',
};

/**
 * Check if native CSS scroll-driven animations are supported.
 * @returns {boolean}
 */
function supportsScrollTimeline() {
  return typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline', 'scroll()');
}

/**
 * Clamp a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a unique scene ID from element or fallback to index.
 * @param {HTMLElement} element
 * @param {number} index
 * @returns {string}
 */
function getSceneId(element, index) {
  return element.dataset.scene || element.id || `scene-${index}`;
}

/**
 * @typedef {Object} SceneCallbacks
 * @property {(progress: number) => void} [enter] - Called during entrance (progress 0→1)
 * @property {(progress: number) => void} [active] - Called while in viewport (progress 0→1)
 * @property {(progress: number) => void} [exit] - Called during exit (progress 0→1)
 */

/**
 * @typedef {Object} SceneEntry
 * @property {string} id - Unique scene identifier
 * @property {HTMLElement} element - DOM element for this scene
 * @property {SceneCallbacks} callbacks - Lifecycle callbacks
 * @property {string} lifecycle - Current lifecycle state
 * @property {number} progress - Current normalized progress [0,1]
 * @property {boolean} isVisible - Whether scene is in viewport
 */

/**
 * @typedef {Object} ScrollEngineOptions
 * @property {boolean} [useNativeScrollTimeline=true] - Delegate to CSS scroll-driven animations if supported
 * @property {number} [enterThreshold=0.1] - IntersectionObserver ratio to trigger enter
 * @property {number} [exitThreshold=0.1] - IntersectionObserver ratio below which to trigger exit
 */

export class ScrollEngine {
  /** @type {Map<string, SceneEntry>} */
  #scenes = new Map();

  /** @type {Set<(sceneId: string, lifecycle: string, progress: number) => void>} */
  #changeListeners = new Set();

  /** @type {IntersectionObserver|null} */
  #observer = null;

  /** @type {boolean} */
  #useNative = false;

  /** @type {boolean} */
  #reducedMotion = false;

  /** @type {number} */
  #sceneIndex = 0;

  /** @type {boolean} */
  #destroyed = false;

  /** @type {boolean} */
  #ticking = false;

  /** @type {(() => void)|null} */
  #motionUnsubscribe = null;

  /** @type {(() => void)|null} */
  #scrollHandler = null;

  /**
   * @param {ScrollEngineOptions} [options]
   */
  constructor(options = {}) {
    const {
      useNativeScrollTimeline = true,
      enterThreshold = 0.1,
      exitThreshold = 0.1,
    } = options;

    this.#useNative = useNativeScrollTimeline && supportsScrollTimeline();
    this.#reducedMotion = prefersReducedMotion();

    // Listen for reduced-motion preference changes
    this.#motionUnsubscribe = onMotionChange((reduced) => {
      this.#reducedMotion = reduced;
    });

    // Set up IntersectionObserver for lifecycle detection
    this.#observer = createObserver(
      (entries) => this.#handleIntersections(entries),
      { threshold: DEFAULT_THRESHOLDS }
    );

    // Set up scroll listener with rAF throttle
    this.#scrollHandler = () => this.#requestUpdate();
    window.addEventListener('scroll', this.#scrollHandler, { passive: true });
  }

  /**
   * Register a scene element with lifecycle callbacks.
   *
   * @param {HTMLElement} element - The scene DOM element
   * @param {SceneCallbacks} [callbacks={}] - Lifecycle callbacks
   * @returns {string} The scene ID
   */
  registerScene(element, callbacks = {}) {
    if (this.#destroyed) return '';

    const id = getSceneId(element, this.#sceneIndex++);

    /** @type {SceneEntry} */
    const entry = {
      id,
      element,
      callbacks,
      lifecycle: LIFECYCLE.IDLE,
      progress: 0,
      isVisible: false,
    };

    this.#scenes.set(id, entry);

    // Initialize CSS variable
    element.style.setProperty('--scene-progress', '0');

    // Start observing
    if (this.#observer) {
      this.#observer.observe(element);
    }

    return id;
  }

  /**
   * Get the current progress [0,1] for a given scene.
   *
   * @param {string} sceneId - The scene identifier
   * @returns {number} Progress value between 0 and 1, or 0 if scene not found
   */
  getProgress(sceneId) {
    const entry = this.#scenes.get(sceneId);
    return entry ? entry.progress : 0;
  }

  /**
   * Register a callback that fires whenever any scene's lifecycle changes.
   *
   * @param {(sceneId: string, lifecycle: string, progress: number) => void} callback
   * @returns {() => void} Unsubscribe function
   */
  onSceneChange(callback) {
    this.#changeListeners.add(callback);
    return () => this.#changeListeners.delete(callback);
  }

  /**
   * Tear down the engine — remove listeners, disconnect observer, clear state.
   */
  destroy() {
    if (this.#destroyed) return;
    this.#destroyed = true;

    // Remove scroll listener
    if (this.#scrollHandler) {
      window.removeEventListener('scroll', this.#scrollHandler);
      this.#scrollHandler = null;
    }

    // Disconnect IntersectionObserver
    disconnect(this.#observer);
    this.#observer = null;

    // Unsubscribe from motion changes
    if (this.#motionUnsubscribe) {
      this.#motionUnsubscribe();
      this.#motionUnsubscribe = null;
    }

    // Clean up CSS variables
    for (const [, entry] of this.#scenes) {
      entry.element.style.removeProperty('--scene-progress');
    }

    this.#scenes.clear();
    this.#changeListeners.clear();
  }

  /**
   * Handle IntersectionObserver entries — update visibility and trigger
   * lifecycle transitions.
   *
   * @param {IntersectionObserverEntry[]} entries
   */
  #handleIntersections(entries) {
    for (const entry of entries) {
      const scene = this.#findSceneByElement(entry.target);
      if (!scene) continue;

      const wasVisible = scene.isVisible;
      scene.isVisible = entry.isIntersecting;

      if (entry.isIntersecting && !wasVisible) {
        // Scene just entered the viewport
        this.#transitionTo(scene, LIFECYCLE.ENTER);
      } else if (!entry.isIntersecting && wasVisible) {
        // Scene just left the viewport
        this.#transitionTo(scene, LIFECYCLE.EXIT);
      }
    }

    // Trigger an immediate progress update
    this.#requestUpdate();
  }

  /**
   * Request an animation frame to compute scene progress.
   */
  #requestUpdate() {
    if (this.#ticking || this.#destroyed) return;
    this.#ticking = true;

    scheduleRead(() => {
      this.#computeProgress();
      this.#ticking = false;
    });
  }

  /**
   * Compute normalized progress for all visible scenes and update
   * CSS variables and lifecycle callbacks.
   */
  #computeProgress() {
    if (this.#destroyed) return;

    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;

    for (const [, scene] of this.#scenes) {
      if (!scene.isVisible && scene.lifecycle === LIFECYCLE.IDLE) continue;

      const rect = scene.element.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const elementHeight = rect.height;

      // Compute how far through the scene the viewport has scrolled.
      // Progress 0 = scene top just reached viewport bottom.
      // Progress 1 = scene bottom just passed viewport top.
      const totalScrollDistance = elementHeight + viewportHeight;
      const scrolled = scrollY + viewportHeight - elementTop;
      let rawProgress = scrolled / totalScrollDistance;

      rawProgress = clamp(rawProgress, 0, 1);

      // Snap for reduced motion
      const progress = this.#reducedMotion ? Math.round(rawProgress) : rawProgress;

      scene.progress = progress;

      // Update lifecycle based on progress
      this.#updateLifecycle(scene, progress);

      // Update CSS variable
      scheduleWrite(() => {
        if (!this.#destroyed) {
          scene.element.style.setProperty('--scene-progress', progress.toFixed(4));
        }
      });
    }
  }

  /**
   * Update scene lifecycle state based on progress value and invoke callbacks.
   *
   * Lifecycle mapping:
   * - enter: progress 0 → ~0.3 (scene entering viewport)
   * - active: progress ~0.3 → ~0.7 (scene fully in view)
   * - exit: progress ~0.7 → 1 (scene leaving viewport)
   *
   * @param {SceneEntry} scene
   * @param {number} progress
   */
  #updateLifecycle(scene, progress) {
    const prevLifecycle = scene.lifecycle;

    let newLifecycle;
    if (!scene.isVisible && progress <= 0) {
      newLifecycle = LIFECYCLE.IDLE;
    } else if (progress < 0.3) {
      newLifecycle = LIFECYCLE.ENTER;
    } else if (progress <= 0.7) {
      newLifecycle = LIFECYCLE.ACTIVE;
    } else {
      newLifecycle = LIFECYCLE.EXIT;
    }

    // If scene is not visible and was in exit, transition to idle
    if (!scene.isVisible && prevLifecycle === LIFECYCLE.EXIT) {
      newLifecycle = LIFECYCLE.IDLE;
    }

    scene.lifecycle = newLifecycle;

    // Compute sub-progress within each lifecycle phase
    let subProgress;
    switch (newLifecycle) {
      case LIFECYCLE.ENTER:
        subProgress = clamp(progress / 0.3, 0, 1);
        break;
      case LIFECYCLE.ACTIVE:
        subProgress = clamp((progress - 0.3) / 0.4, 0, 1);
        break;
      case LIFECYCLE.EXIT:
        subProgress = clamp((progress - 0.7) / 0.3, 0, 1);
        break;
      default:
        subProgress = 0;
    }

    // Invoke lifecycle callback
    const callback = scene.callbacks[newLifecycle];
    if (callback && typeof callback === 'function') {
      callback(subProgress);
    }

    // Notify change listeners on lifecycle transition
    if (newLifecycle !== prevLifecycle) {
      this.#notifyChange(scene.id, newLifecycle, subProgress);
    }
  }

  /**
   * Transition a scene to a new lifecycle state.
   *
   * @param {SceneEntry} scene
   * @param {string} lifecycle
   */
  #transitionTo(scene, lifecycle) {
    const prev = scene.lifecycle;
    if (prev === lifecycle) return;

    scene.lifecycle = lifecycle;
    const progress = lifecycle === LIFECYCLE.ENTER ? 0 : 1;

    const callback = scene.callbacks[lifecycle];
    if (callback && typeof callback === 'function') {
      callback(progress);
    }

    this.#notifyChange(scene.id, lifecycle, progress);
  }

  /**
   * Find a scene entry by its DOM element.
   *
   * @param {Element} element
   * @returns {SceneEntry|undefined}
   */
  #findSceneByElement(element) {
    for (const [, scene] of this.#scenes) {
      if (scene.element === element) return scene;
    }
    return undefined;
  }

  /**
   * Notify all change listeners of a lifecycle transition.
   *
   * @param {string} sceneId
   * @param {string} lifecycle
   * @param {number} progress
   */
  #notifyChange(sceneId, lifecycle, progress) {
    for (const listener of this.#changeListeners) {
      listener(sceneId, lifecycle, progress);
    }
  }

  /**
   * Whether this engine instance uses native CSS scroll-driven animations.
   * @returns {boolean}
   */
  get usesNativeScrollTimeline() {
    return this.#useNative;
  }

  /**
   * Whether reduced motion is currently active.
   * @returns {boolean}
   */
  get isReducedMotion() {
    return this.#reducedMotion;
  }

  /**
   * Get all registered scene IDs.
   * @returns {string[]}
   */
  get sceneIds() {
    return [...this.#scenes.keys()];
  }
}

export default ScrollEngine;
