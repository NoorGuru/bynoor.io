/**
 * Magnetic Elements — proximity-based element attraction toward cursor.
 * CTA buttons with [data-magnetic] attribute subtly pull toward the cursor
 * when it comes within 80px of the element center.
 */

import { prefersReducedMotion, onMotionPreferenceChange } from './utils/reduced-motion.js';
import { onBreakpointChange } from './utils/breakpoints.js';

const THRESHOLD = 80;
const MAX_OFFSET = 8;
const RESET_DURATION = 300;

/** @type {HTMLElement[]} */
let elements = [];
let active = false;
let rafId = null;
let cursorX = 0;
let cursorY = 0;
let ticking = false;

/**
 * Clamps a value between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Computes the magnetic translation for an element given cursor position.
 * @param {number} cursorX
 * @param {number} cursorY
 * @param {DOMRect} rect
 * @returns {{ dx: number, dy: number }}
 */
function computeTranslation(cursorX, cursorY, rect) {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const diffX = cursorX - centerX;
  const diffY = cursorY - centerY;
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);

  if (distance > THRESHOLD) {
    return { dx: 0, dy: 0 };
  }

  const strength = 1 - distance / THRESHOLD;
  const dx = clamp(diffX * strength * (MAX_OFFSET / THRESHOLD), -MAX_OFFSET, MAX_OFFSET);
  const dy = clamp(diffY * strength * (MAX_OFFSET / THRESHOLD), -MAX_OFFSET, MAX_OFFSET);

  return { dx, dy };
}

/**
 * Applies the magnetic offset to all tracked elements.
 */
function updateElements() {
  ticking = false;

  if (!active) return;

  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    const { dx, dy } = computeTranslation(cursorX, cursorY, rect);

    el.style.transform = `translate(${dx}px, ${dy}px)`;
  }
}

/**
 * Handles mousemove — throttled via requestAnimationFrame.
 * @param {MouseEvent} e
 */
function onMouseMove(e) {
  cursorX = e.clientX;
  cursorY = e.clientY;

  if (!ticking) {
    ticking = true;
    rafId = requestAnimationFrame(updateElements);
  }
}

/**
 * Handles mouseleave on a magnetic element — animates back to origin.
 * @param {MouseEvent} e
 */
function onElementMouseLeave(e) {
  const el = /** @type {HTMLElement} */ (e.currentTarget);
  el.style.transition = `transform ${RESET_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
  el.style.transform = 'translate(0, 0)';

  // Remove the transition after it completes to avoid interfering with magnetic tracking
  setTimeout(() => {
    el.style.transition = '';
  }, RESET_DURATION);
}

/**
 * Attaches event listeners and activates magnetic behavior.
 */
function activate() {
  if (active) return;
  active = true;

  document.addEventListener('mousemove', onMouseMove, { passive: true });

  for (const el of elements) {
    el.addEventListener('mouseleave', onElementMouseLeave);
  }
}

/**
 * Removes event listeners, resets transforms, and deactivates.
 */
function deactivate() {
  if (!active) return;
  active = false;

  document.removeEventListener('mousemove', onMouseMove);

  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  ticking = false;

  for (const el of elements) {
    el.removeEventListener('mouseleave', onElementMouseLeave);
    el.style.transform = '';
    el.style.transition = '';
  }
}

/**
 * Initializes the magnetic elements system.
 * Selects all [data-magnetic] elements and sets up proximity-based attraction.
 * Disabled when reduced-motion is active or viewport < 1024px.
 */
export function initMagneticElements() {
  elements = Array.from(document.querySelectorAll('[data-magnetic]'));

  if (elements.length === 0) return;

  let isDesktop = false;
  let motionReduced = prefersReducedMotion();

  function reconcile() {
    if (isDesktop && !motionReduced) {
      activate();
    } else {
      deactivate();
    }
  }

  onBreakpointChange(1024, (matches) => {
    isDesktop = matches;
    reconcile();
  });

  onMotionPreferenceChange((reduced) => {
    motionReduced = reduced;
    reconcile();
  });
}
