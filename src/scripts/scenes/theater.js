/**
 * Testimonial Theater Scene
 *
 * Scroll-snapped cinematic testimonial presentation with:
 * - Word-by-word kinetic reveal via kinetic-type utility
 * - Ambient color shift on active testimonial change
 * - Swipe gesture support on touch devices
 * - IntersectionObserver-based active testimonial detection
 *
 * Implements the SceneModule lifecycle interface:
 * - init(sceneEl) — DOM refs, observers, gesture setup
 * - enter(progress) — entrance fade
 * - active(progress) — monitor active testimonial
 * - exit(progress) — exit fade
 * - destroy() — cleanup observers and listeners
 *
 * @module scenes/theater
 * @see Requirements 6.2, 6.3, 6.5, 6.6
 */

import { splitText, triggerReveal } from '../effects/kinetic-type.js';
import { setAccentHue } from '../effects/ambient.js';
import { prefersReducedMotion } from '../utils/motion.js';
import { createObserver, disconnect } from '../utils/observer.js';

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let sceneEl = null;

/** @type {HTMLElement[]} */
let testimonials = [];

/** @type {IntersectionObserver|null} */
let observer = null;

/** Current active testimonial index */
let activeIndex = -1;

/** Touch gesture state */
let touchStartY = 0;
let touchStartX = 0;

/** Accent hue palettes for each testimonial */
const ACCENT_HUES = [
  [265, 280, 300], // Testimonial 1 (Aamer): violet palette
  [195, 210, 230], // Testimonial 2 (Nagarajan): cyan palette
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Set a testimonial as the active one.
 * Triggers kinetic reveal, updates ambient hue, and manages active class.
 *
 * @param {number} index - Index of the testimonial to activate
 */
function setActive(index) {
  if (index === activeIndex || index < 0 || index >= testimonials.length) return;

  // Deactivate previous
  if (activeIndex >= 0 && testimonials[activeIndex]) {
    testimonials[activeIndex].classList.remove('is-active');
  }

  activeIndex = index;
  const testimonial = testimonials[index];
  testimonial.classList.add('is-active');

  // Trigger kinetic word reveal on the quote text
  const kineticEl = testimonial.querySelector('[data-kinetic="words"]');
  if (kineticEl) {
    triggerReveal(/** @type {HTMLElement} */ (kineticEl));
  }

  // Dispatch ambient color shift
  const hues = ACCENT_HUES[index] || ACCENT_HUES[0];
  setAccentHue(hues[0], hues[1], hues[2]);
}

/**
 * IntersectionObserver callback — detect which testimonial is active
 * (most visible / centered in viewport).
 *
 * @param {IntersectionObserverEntry[]} entries
 */
function handleIntersection(entries) {
  for (const entry of entries) {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
      const index = testimonials.indexOf(/** @type {HTMLElement} */ (entry.target));
      if (index !== -1) {
        setActive(index);
      }
    }
  }
}

/**
 * Handle touch start — record starting position for swipe detection.
 * @param {TouchEvent} e
 */
function onTouchStart(e) {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

/**
 * Handle touch end — detect swipe direction and navigate testimonials.
 * Supports both left-right (horizontal) swiping for navigation.
 * @param {TouchEvent} e
 */
function onTouchEnd(e) {
  if (!sceneEl) return;

  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  // Only trigger if horizontal swipe is dominant and significant
  const SWIPE_THRESHOLD = 50;

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
    if (deltaX < 0) {
      // Swipe left → next testimonial
      navigateToTestimonial(activeIndex + 1);
    } else {
      // Swipe right → previous testimonial
      navigateToTestimonial(activeIndex - 1);
    }
  }
}

/**
 * Scroll the container to bring a specific testimonial into view.
 * @param {number} index - Target testimonial index
 */
function navigateToTestimonial(index) {
  if (index < 0 || index >= testimonials.length || !sceneEl) return;

  testimonials[index].scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

/**
 * Initialize the theater scene.
 * Sets up DOM references, splits kinetic text, creates observer,
 * and binds touch gesture listeners.
 *
 * @param {HTMLElement} el - The theater scene root element
 */
function init(el) {
  sceneEl = el;
  testimonials = Array.from(el.querySelectorAll('.theater__testimonial'));

  if (testimonials.length === 0) return;

  // If reduced motion, show everything immediately
  if (prefersReducedMotion()) {
    testimonials.forEach((t) => t.classList.add('is-active'));
    return;
  }

  // Split kinetic text elements for word-by-word animation
  const kineticEls = el.querySelectorAll('[data-kinetic="words"]');
  kineticEls.forEach((kEl) => {
    splitText(/** @type {HTMLElement} */ (kEl), 'words');
  });

  // Create IntersectionObserver to detect active testimonial
  observer = createObserver(handleIntersection, {
    threshold: [0, 0.25, 0.5, 0.75, 1.0],
    rootMargin: '-20% 0px -20% 0px',
  });

  if (observer) {
    testimonials.forEach((t) => observer.observe(t));
  } else {
    // Observer not supported — reveal all immediately
    testimonials.forEach((t) => t.classList.add('is-active'));
  }

  // Bind touch gesture listeners for swipe navigation
  el.addEventListener('touchstart', onTouchStart, { passive: true });
  el.addEventListener('touchend', onTouchEnd, { passive: true });
}

/**
 * Enter phase — scene is entering the viewport.
 * Activate the first testimonial if none is active yet.
 *
 * @param {number} progress - Enter sub-progress (0→1)
 */
function enter(progress) {
  if (progress > 0.3 && activeIndex === -1 && testimonials.length > 0) {
    setActive(0);
  }
}

/**
 * Active phase — scene is fully in viewport.
 * Observer handles testimonial switching; no additional per-frame work needed.
 *
 * @param {number} _progress - Active sub-progress (0→1)
 */
function active(_progress) {
  // IntersectionObserver handles active testimonial detection
}

/**
 * Exit phase — scene is leaving the viewport.
 *
 * @param {number} _progress - Exit sub-progress (0→1)
 */
function exit(_progress) {
  // No special exit behavior needed
}

/**
 * Tear down the theater scene — disconnect observers, remove listeners.
 */
function destroy() {
  disconnect(observer);
  observer = null;

  if (sceneEl) {
    sceneEl.removeEventListener('touchstart', onTouchStart);
    sceneEl.removeEventListener('touchend', onTouchEnd);
  }

  // Reset state
  sceneEl = null;
  testimonials = [];
  activeIndex = -1;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default { init, enter, active, exit, destroy };
