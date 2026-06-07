/**
 * 3D perspective tilt effect on hover for .tilt-card elements.
 * Calculates rotation from pointer position relative to card center,
 * applying rotateX/rotateY via CSS custom properties (max 5deg).
 * Disabled when reduced-motion is active (falls back to translateY lift via CSS).
 *
 * Requirements: 4.3, 6.4
 */

import { prefersReducedMotion, onMotionPreferenceChange } from './utils/reduced-motion.js';

const MAX_ANGLE = 5; // degrees

/**
 * Initialize the 3D tilt effect on all .tilt-card elements.
 */
export function initTiltCards() {
  if (prefersReducedMotion()) {
    return;
  }

  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  /** @type {AbortController | null} */
  let controller = new AbortController();

  function attach() {
    controller = new AbortController();
    const { signal } = controller;

    cards.forEach((card) => {
      card.addEventListener('pointermove', handlePointerMove, { signal });
      card.addEventListener('pointerleave', handlePointerLeave, { signal });
    });
  }

  function detach() {
    if (controller) {
      controller.abort();
      controller = null;
    }
    // Reset all cards to neutral position
    cards.forEach((card) => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  }

  attach();

  // React to live reduced-motion preference changes
  onMotionPreferenceChange((reduced) => {
    if (reduced) {
      detach();
    } else if (!controller) {
      attach();
    }
  });
}

/**
 * Handle pointer movement over a tilt card.
 * Computes rotation angles based on pointer position relative to card center.
 * @param {PointerEvent} e
 */
function handlePointerMove(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;

  // rotateY: positive when pointer is to the right of center
  const rotateY = ((e.clientX - centerX) / halfWidth) * MAX_ANGLE;
  // rotateX: negative when pointer is below center (tilts away from viewer)
  const rotateX = -((e.clientY - centerY) / halfHeight) * MAX_ANGLE;

  card.style.setProperty('--tilt-x', `${rotateX}deg`);
  card.style.setProperty('--tilt-y', `${rotateY}deg`);
}

/**
 * Reset tilt to neutral on pointer leave (CSS transition handles the easing).
 * @param {PointerEvent} e
 */
function handlePointerLeave(e) {
  const card = e.currentTarget;
  card.style.setProperty('--tilt-x', '0deg');
  card.style.setProperty('--tilt-y', '0deg');
}
