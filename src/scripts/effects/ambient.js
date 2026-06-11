/**
 * Ambient Layer Controller
 *
 * Manages gradient orb elements that form the continuous animated gradient
 * mesh across the page background. Handles:
 * - Section-aware hue transitions via --ambient-hue-* CSS variables (800ms ease)
 * - Scroll-velocity-based position shifts via --ambient-scroll-x/y
 * - Reduced motion awareness (skips scroll-based shifts)
 *
 * @module effects/ambient
 * @see Requirements 8.1, 8.3, 8.4
 */

import { scheduleRead, scheduleWrite } from '../utils/raf.js';
import { prefersReducedMotion, onChange as onMotionChange } from '../utils/motion.js';

/** @type {HTMLElement | null} */
let layerEl = null;

/** @type {NodeListOf<HTMLElement> | null} */
let orbs = null;

/** Scroll tracking state */
let lastScrollY = 0;
let lastScrollTime = 0;
let velocityY = 0;
let scrollRafId = null;
let scrollActive = false;
let deactivateTimer = null;

/** Motion preference unsubscribe function */
let motionUnsub = null;

/** Whether reduced motion is currently active */
let reducedMotion = false;

/**
 * Compute scroll velocity and update ambient layer position shifts.
 * Uses rAF scheduler for batched read/write.
 */
function onScroll() {
  if (reducedMotion) return;

  // Debounce the rAF to one per frame
  if (scrollRafId !== null) return;

  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null;

    scheduleRead(() => {
      const now = performance.now();
      const currentY = window.scrollY;
      const dt = now - lastScrollTime;

      if (dt > 0) {
        velocityY = (currentY - lastScrollY) / dt; // px/ms
      }

      lastScrollY = currentY;
      lastScrollTime = now;

      scheduleWrite(() => {
        if (!layerEl) return;

        // Map velocity to a shift amount (clamped)
        const shiftY = Math.max(-20, Math.min(20, velocityY * 50));
        const shiftX = shiftY * 0.3; // subtle horizontal drift

        layerEl.style.setProperty('--ambient-scroll-x', `${shiftX}px`);
        layerEl.style.setProperty('--ambient-scroll-y', `${shiftY}px`);

        // Toggle data-scroll-active attribute for CSS transitions
        if (!scrollActive && (Math.abs(shiftY) > 0.5 || Math.abs(shiftX) > 0.5)) {
          layerEl.setAttribute('data-scroll-active', '');
          scrollActive = true;
        }

        // Clear deactivation timer and set a new one
        if (deactivateTimer) clearTimeout(deactivateTimer);
        deactivateTimer = setTimeout(() => {
          if (!layerEl) return;
          layerEl.style.setProperty('--ambient-scroll-x', '0px');
          layerEl.style.setProperty('--ambient-scroll-y', '0px');
          layerEl.removeAttribute('data-scroll-active');
          scrollActive = false;
        }, 150);
      });
    });
  });
}

/**
 * Handle reduced motion preference change.
 * @param {boolean} reduced
 */
function handleMotionChange(reduced) {
  reducedMotion = reduced;
  if (reduced && layerEl) {
    // Reset scroll shifts when reduced motion is enabled
    layerEl.style.setProperty('--ambient-scroll-x', '0px');
    layerEl.style.setProperty('--ambient-scroll-y', '0px');
    layerEl.removeAttribute('data-scroll-active');
    scrollActive = false;
  }
}

/**
 * Initialize the ambient layer controller.
 * Finds the `.ambient-layer` container and its orb children,
 * sets up scroll velocity tracking and motion preference listeners.
 *
 * @returns {{ setAccentHue: Function, destroy: Function } | null}
 *   Controller API or null if no ambient layer is found in the DOM.
 */
export function initAmbient() {
  layerEl = document.querySelector('.ambient-layer');
  if (!layerEl) return null;

  orbs = layerEl.querySelectorAll('.ambient-orb');

  // Initialize scroll state
  lastScrollY = window.scrollY;
  lastScrollTime = performance.now();
  reducedMotion = prefersReducedMotion();

  // Listen for scroll events (passive for performance)
  window.addEventListener('scroll', onScroll, { passive: true });

  // Subscribe to reduced motion changes
  motionUnsub = onMotionChange(handleMotionChange);

  return { setAccentHue, destroy };
}

/**
 * Update the ambient hue CSS custom properties on section transition.
 * Applies hue values to the document root so they cascade to all orbs.
 * The CSS `@property` registration in tokens.css ensures the 800ms
 * transition is interpolated smoothly.
 *
 * @param {number} hue1 - Hue value for orb 1 (0–360)
 * @param {number} hue2 - Hue value for orb 2 (0–360)
 * @param {number} hue3 - Hue value for orb 3 (0–360)
 */
export function setAccentHue(hue1, hue2, hue3) {
  scheduleWrite(() => {
    const root = document.documentElement;
    root.style.setProperty('--ambient-hue-1', String(hue1));
    root.style.setProperty('--ambient-hue-2', String(hue2));
    root.style.setProperty('--ambient-hue-3', String(hue3));
  });
}

/**
 * Tear down the ambient layer controller.
 * Removes event listeners and resets internal state.
 */
export function destroy() {
  window.removeEventListener('scroll', onScroll, { passive: true });

  if (motionUnsub) {
    motionUnsub();
    motionUnsub = null;
  }

  if (scrollRafId !== null) {
    cancelAnimationFrame(scrollRafId);
    scrollRafId = null;
  }

  if (deactivateTimer) {
    clearTimeout(deactivateTimer);
    deactivateTimer = null;
  }

  // Reset CSS variables
  if (layerEl) {
    layerEl.style.removeProperty('--ambient-scroll-x');
    layerEl.style.removeProperty('--ambient-scroll-y');
    layerEl.removeAttribute('data-scroll-active');
  }

  layerEl = null;
  orbs = null;
  scrollActive = false;
  velocityY = 0;
}
