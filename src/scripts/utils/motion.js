/**
 * Reduced-motion detection utility.
 *
 * Detects the user's `prefers-reduced-motion` setting and keeps a
 * `reduced-motion` class on `<html>` in sync. Other modules can query
 * the current state or subscribe to changes.
 *
 * Auto-initializes on import — the class is applied immediately if the
 * preference is active, so CSS can rely on `html.reduced-motion` from
 * the first paint.
 *
 * @module motion
 * @see Requirements 12.6, 8.6
 */

const QUERY = '(prefers-reduced-motion: reduce)';
const CLASS_NAME = 'reduced-motion';

/** @type {MediaQueryList} */
const mql = window.matchMedia(QUERY);

/** @type {Set<(reduced: boolean) => void>} */
const listeners = new Set();

/**
 * Apply or remove the `reduced-motion` class on `<html>`.
 * @param {boolean} reduced
 */
function applyClass(reduced) {
  document.documentElement.classList.toggle(CLASS_NAME, reduced);
}

/**
 * Internal handler for media query changes.
 * @param {MediaQueryListEvent} event
 */
function handleChange(event) {
  applyClass(event.matches);
  listeners.forEach((cb) => cb(event.matches));
}

// --- Auto-initialize on import ---
applyClass(mql.matches);
mql.addEventListener('change', handleChange);

// --- Public API ---

/**
 * Returns whether the user currently prefers reduced motion.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return mql.matches;
}

/**
 * Register a callback that fires whenever the reduced-motion preference
 * changes. The callback receives the new boolean state.
 *
 * Returns an unsubscribe function for cleanup.
 *
 * @param {(reduced: boolean) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Convenience: the MediaQueryList instance, exposed for advanced use
 * cases (e.g., one-off checks in tests or passing to other utilities).
 */
export const mediaQuery = mql;
