/**
 * Viewport breakpoint utilities.
 * Wraps matchMedia for responsive behavior at runtime.
 */

/**
 * Watches for viewport changes across a min-width breakpoint.
 * Fires the callback immediately with the current state,
 * then again whenever the breakpoint is crossed.
 * @param {number} minWidth - The min-width threshold in pixels
 * @param {(matches: boolean) => void} callback
 */
export function onBreakpointChange(minWidth, callback) {
  const mql = window.matchMedia(`(min-width: ${minWidth}px)`);
  mql.addEventListener('change', (e) => callback(e.matches));
  callback(mql.matches);
}

/**
 * One-shot check: returns whether the viewport is currently
 * at or above the given min-width.
 * @param {number} minWidth - The min-width threshold in pixels
 * @returns {boolean}
 */
export function isAbove(minWidth) {
  return window.matchMedia(`(min-width: ${minWidth}px)`).matches;
}
