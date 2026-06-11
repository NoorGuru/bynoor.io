/**
 * IntersectionObserver factory with configurable thresholds.
 *
 * Provides a clean API for creating observer instances optimized for
 * scroll-driven animations. Includes feature detection, multi-element
 * observation, and cleanup helpers.
 *
 * If IntersectionObserver is unsupported, the factory returns null,
 * signaling consumers to load all scenes immediately and skip
 * entrance animations.
 */

/** Default thresholds optimized for scroll-driven animation lifecycle. */
export const DEFAULT_THRESHOLDS = [0, 0.1, 0.25, 0.5, 0.75, 1.0];

/**
 * Checks whether IntersectionObserver is available in the current environment.
 * @returns {boolean}
 */
export function isSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.IntersectionObserver === 'function' &&
    typeof window.IntersectionObserverEntry === 'function' &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
  );
}

/**
 * Creates an IntersectionObserver instance with sensible defaults
 * for scroll-driven animations.
 *
 * @param {IntersectionObserverCallback} callback - Invoked when observed
 *   elements cross configured thresholds.
 * @param {Object} [options] - Configuration options.
 * @param {number[]} [options.threshold] - Visibility thresholds (0–1).
 *   Defaults to DEFAULT_THRESHOLDS.
 * @param {string} [options.rootMargin] - Margin around the root.
 *   Defaults to '0px'.
 * @param {Element|Document|null} [options.root] - Scroll ancestor to use
 *   as the viewport. Defaults to null (browser viewport).
 * @returns {IntersectionObserver|null} The observer instance, or null if
 *   the API is unsupported.
 */
export function createObserver(callback, options = {}) {
  if (!isSupported()) {
    return null;
  }

  const {
    threshold = DEFAULT_THRESHOLDS,
    rootMargin = '0px',
    root = null,
  } = options;

  return new IntersectionObserver(callback, { threshold, rootMargin, root });
}

/**
 * Observes multiple elements with a single IntersectionObserver instance.
 *
 * @param {IntersectionObserver|null} observer - The observer to use.
 *   If null (unsupported), this is a no-op.
 * @param {Iterable<Element>} elements - Elements to observe.
 */
export function observeAll(observer, elements) {
  if (!observer) return;

  for (const el of elements) {
    observer.observe(el);
  }
}

/**
 * Disconnects the observer and stops watching all targets.
 *
 * @param {IntersectionObserver|null} observer - The observer to disconnect.
 *   If null (unsupported), this is a no-op.
 */
export function disconnect(observer) {
  if (!observer) return;
  observer.disconnect();
}
