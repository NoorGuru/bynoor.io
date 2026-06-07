/**
 * Reduced motion preference utilities.
 * Checks and reacts to the user's prefers-reduced-motion setting.
 */

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Returns whether the user prefers reduced motion.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia(QUERY).matches;
}

/**
 * Listens for changes to the reduced-motion preference.
 * Fires the callback immediately with the current state,
 * then again whenever the preference changes.
 * @param {(reduced: boolean) => void} callback
 */
export function onMotionPreferenceChange(callback) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', (e) => callback(e.matches));
  callback(mql.matches);
}
