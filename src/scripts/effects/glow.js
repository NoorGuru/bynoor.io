/**
 * Glow System — Cursor-following radial glow effect.
 *
 * Attaches `mousemove` listeners to elements with `[data-glow]` attribute
 * and updates `--glow-x` / `--glow-y` CSS custom properties so the
 * radial-gradient defined in glow.css tracks the cursor position.
 *
 * Respects `prefers-reduced-motion` — skips initialization when active,
 * and tears down listeners if the preference changes at runtime.
 *
 * Can be called multiple times (idempotent per element) to handle
 * lazy-loaded scenes that add new `[data-glow]` elements to the DOM.
 *
 * @module effects/glow
 * @see Requirements 8.5, 5.3
 */

import { prefersReducedMotion, onChange as onMotionChange } from '../utils/motion.js';

// --- Internal state ---

/**
 * WeakMap storing per-element listener references for cleanup.
 * Using a WeakMap avoids memory leaks when elements are removed from the DOM.
 * @type {WeakMap<Element, { move: (e: MouseEvent) => void, leave: () => void }>}
 */
const tracked = new WeakMap();

/**
 * Set of all currently tracked elements (for iteration during destroy).
 * @type {Set<Element>}
 */
const elements = new Set();

/** @type {(() => void)|null} */
let motionUnsub = null;

// --- Listener factories ---

/**
 * Creates a mousemove handler that updates glow position CSS variables.
 * Calculates cursor position relative to the element as a percentage.
 *
 * @param {Element} el
 * @returns {(e: MouseEvent) => void}
 */
function createMoveHandler(el) {
  return (e) => {
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--glow-x', `${x}%`);
    el.style.setProperty('--glow-y', `${y}%`);
  };
}

/**
 * Creates a mouseleave handler that resets glow position to center.
 *
 * @param {Element} el
 * @returns {() => void}
 */
function createLeaveHandler(el) {
  return () => {
    el.style.setProperty('--glow-x', '50%');
    el.style.setProperty('--glow-y', '50%');
  };
}

// --- Internal helpers ---

/**
 * Attaches mousemove and mouseleave listeners to a single element.
 * No-op if the element is already tracked.
 *
 * @param {Element} el
 */
function attach(el) {
  if (tracked.has(el)) return;

  const move = createMoveHandler(el);
  const leave = createLeaveHandler(el);

  el.addEventListener('mousemove', move);
  el.addEventListener('mouseleave', leave);

  tracked.set(el, { move, leave });
  elements.add(el);
}

/**
 * Removes listeners from a single element and cleans up tracking.
 *
 * @param {Element} el
 */
function detach(el) {
  const handlers = tracked.get(el);
  if (!handlers) return;

  el.removeEventListener('mousemove', handlers.move);
  el.removeEventListener('mouseleave', handlers.leave);

  // Reset to center on detach
  el.style.setProperty('--glow-x', '50%');
  el.style.setProperty('--glow-y', '50%');

  tracked.delete(el);
  elements.delete(el);
}

/**
 * Removes all tracked listeners (used on destroy or motion change).
 */
function detachAll() {
  elements.forEach(detach);
}

// --- Public API ---

/**
 * Initialize the glow system on elements matching the given selector.
 *
 * Safe to call multiple times — new elements get listeners attached
 * while already-tracked elements are skipped (idempotent per element).
 *
 * If the user prefers reduced motion, initialization is skipped entirely
 * (the CSS already disables glow opacity via media query).
 *
 * @param {string} [selector='[data-glow]'] - CSS selector for glow elements
 */
export function initGlow(selector = '[data-glow]') {
  // Reduced-motion gate — glow is disabled in CSS anyway
  if (prefersReducedMotion()) return;

  const els = document.querySelectorAll(selector);
  els.forEach(attach);

  // Subscribe to motion preference changes (only once)
  if (!motionUnsub) {
    motionUnsub = onMotionChange((reduced) => {
      if (reduced) {
        detachAll();
      }
      // Note: if motion is re-enabled, user must call initGlow() again
      // or scenes can re-initialize on their own mount cycle
    });
  }
}

/**
 * Removes all glow event listeners and cleans up subscriptions.
 * Call on page teardown or when the effect is no longer needed.
 */
export function destroy() {
  detachAll();

  if (motionUnsub) {
    motionUnsub();
    motionUnsub = null;
  }
}
