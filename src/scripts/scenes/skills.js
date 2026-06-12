/**
 * Skills Scene — Category-grouped skill pills with staggered
 * entrance animation and scroll-triggered reveals.
 *
 * Implements the SceneModule lifecycle interface:
 * - init(sceneEl) — DOM refs, IntersectionObserver for pill reveals
 * - enter(progress) — staggered category + pill entrance
 * - active(progress) — while in viewport
 * - exit(progress) — exit phase
 * - destroy() — cleanup observers and references
 *
 * @module scenes/skills
 * @see Requirements 2.3
 */

import { prefersReducedMotion } from '../utils/motion.js';

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let sceneEl = null;

/** @type {NodeListOf<HTMLElement>|null} */
let categories = null;

/** @type {IntersectionObserver|null} */
let categoryObserver = null;

/** @type {boolean} */
let hasEntered = false;

// ─── Constants ────────────────────────────────────────────────────────────────

/** Stagger delay between category entrance animations (ms). */
const CATEGORY_STAGGER = 200;

/** Threshold for IntersectionObserver category detection. */
const ENTRANCE_THRESHOLD = 0.15;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Assign --pill-index CSS variable to each pill within a category.
 * @param {HTMLElement} category
 */
function indexPills(category) {
  const pills = category.querySelectorAll('.skill-pill');
  pills.forEach((pill, i) => {
    pill.style.setProperty('--pill-index', String(i));
  });
}

/**
 * Reveal all pills in a category by adding .is-visible class.
 * @param {HTMLElement} category
 */
function revealPills(category) {
  const pills = category.querySelectorAll('.skill-pill');
  pills.forEach((pill) => {
    pill.classList.add('is-visible');
  });
}

/**
 * Reveal all categories and pills immediately (reduced motion or instant).
 */
function revealAll() {
  if (!categories) return;
  categories.forEach((cat) => {
    cat.classList.add('is-visible');
    revealPills(cat);
  });
  hasEntered = true;
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

/**
 * Initialize the skills scene.
 * Gathers DOM references, assigns pill indices, and sets up
 * IntersectionObserver for scroll-triggered reveals.
 *
 * @param {HTMLElement} el - The skills scene root element
 */
function init(el) {
  sceneEl = el;
  categories = el.querySelectorAll('.skills__category');

  // Assign --pill-index to each pill for CSS stagger delays
  categories.forEach((cat) => indexPills(cat));

  // If reduced motion is preferred, reveal everything immediately
  if (prefersReducedMotion()) {
    revealAll();
    return;
  }

  // Set up IntersectionObserver for staggered category entrance
  categoryObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const category = entry.target;
          const index = Array.from(categories).indexOf(category);
          const delay = index * CATEGORY_STAGGER;

          // Stagger the category entrance
          setTimeout(() => {
            category.classList.add('is-visible');
            // Reveal pills within this category after it appears
            revealPills(category);
          }, delay);

          categoryObserver.unobserve(category);
        }
      });
    },
    { threshold: ENTRANCE_THRESHOLD }
  );

  categories.forEach((cat) => {
    categoryObserver.observe(cat);
  });
}

/**
 * Entrance animation phase — called by SceneManager with progress 0→1.
 * IntersectionObserver handles individual category reveals.
 * @param {number} progress
 */
function enter(progress) {
  if (hasEntered) return;
  if (progress >= 1) {
    hasEntered = true;
  }
}

/**
 * Active phase — scene is in viewport.
 * Pill interactions are handled by CSS hover states.
 * @param {number} _progress
 */
function active(_progress) {
  // Hover glow and interactions handled by CSS
}

/**
 * Exit phase — scene scrolling out of viewport.
 * @param {number} _progress
 */
function exit(_progress) {
  // No special exit behavior; pills remain visible once revealed
}

/**
 * Tear down — disconnect observers and clean up references.
 */
function destroy() {
  if (categoryObserver) {
    categoryObserver.disconnect();
    categoryObserver = null;
  }

  sceneEl = null;
  categories = null;
  hasEntered = false;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default { init, enter, active, exit, destroy };
