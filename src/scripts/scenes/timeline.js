/**
 * Timeline Scene — scroll-driven career journey with alternating
 * milestones, progress line fill, and expand-on-hover interaction.
 *
 * Implements the SceneModule lifecycle interface:
 * - init(sceneEl) — DOM refs, observers, event binding
 * - enter(progress) — staggered milestone entrance (0→1)
 * - active(progress) — progress line fill, viewport-center emphasis
 * - exit(progress) — fade out if needed
 * - destroy() — cleanup observers and listeners
 *
 * @module scenes/timeline
 * @see Requirements 4.1, 4.2, 4.3, 4.4, 4.6
 */

import { prefersReducedMotion } from '../utils/motion.js';

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let sceneEl = null;

/** @type {HTMLElement|null} */
let trackEl = null;

/** @type {NodeListOf<HTMLElement>|null} */
let milestones = null;

/** @type {IntersectionObserver|null} */
let entranceObserver = null;

/** @type {boolean} */
let hasEntered = false;

/** @type {number|null} */
let rafId = null;

/** @type {Set<HTMLElement>} */
const expandedMilestones = new Set();

// ─── Constants ────────────────────────────────────────────────────────────────

/** Stagger delay between milestone entrances (ms). */
const STAGGER_DELAY = 120;

/** Threshold for IntersectionObserver entrance detection. */
const ENTRANCE_THRESHOLD = 0.15;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Calculate how close a milestone is to the vertical center of the viewport.
 * Returns a normalized value 0→1 (1 = perfectly centered).
 * @param {HTMLElement} el
 * @returns {number}
 */
function getCenterProximity(el) {
  const rect = el.getBoundingClientRect();
  const elCenter = rect.top + rect.height / 2;
  const viewCenter = window.innerHeight / 2;
  const distance = Math.abs(elCenter - viewCenter);
  const maxDistance = window.innerHeight / 2;
  return Math.max(0, 1 - distance / maxDistance);
}

/**
 * Update which milestone is "active" (closest to viewport center).
 * Active milestone gets scale(1.05) + full opacity; others dim.
 */
function updateActiveState() {
  if (!milestones) return;

  let bestProximity = 0;
  let activeMilestone = null;

  milestones.forEach((milestone) => {
    if (!milestone.classList.contains('is-visible')) return;
    const proximity = getCenterProximity(milestone.querySelector('.timeline__content') || milestone);
    if (proximity > bestProximity) {
      bestProximity = proximity;
      activeMilestone = milestone;
    }
  });

  milestones.forEach((milestone) => {
    if (milestone === activeMilestone && bestProximity > 0.3) {
      milestone.classList.add('is-active');
    } else {
      milestone.classList.remove('is-active');
    }
  });
}

/**
 * Update the progress line fill based on how far the timeline has been scrolled.
 */
function updateProgressLine() {
  if (!sceneEl || !trackEl) return;

  const rect = sceneEl.getBoundingClientRect();
  const sceneHeight = rect.height;
  const viewportHeight = window.innerHeight;

  // Calculate how much of the timeline has scrolled past
  const scrolled = viewportHeight - rect.top;
  const totalScrollable = sceneHeight + viewportHeight;
  const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));

  sceneEl.style.setProperty('--timeline-progress', `${progress * 100}%`);
}

/**
 * Combined scroll handler for progress line + active state.
 */
function onScroll() {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    updateProgressLine();
    updateActiveState();
  });
}

/**
 * Handle hover on milestone content for expand (desktop).
 * @param {MouseEvent} e
 */
function onMilestoneMouseEnter(e) {
  const milestone = e.currentTarget.closest('.timeline__milestone');
  if (milestone) milestone.classList.add('is-expanded');
}

/**
 * Handle mouse leave on milestone content (desktop).
 * @param {MouseEvent} e
 */
function onMilestoneMouseLeave(e) {
  const milestone = e.currentTarget.closest('.timeline__milestone');
  if (milestone) milestone.classList.remove('is-expanded');
}

/**
 * Handle tap/click on milestone for touch devices (toggle expand).
 * @param {Event} e
 */
function onMilestoneTap(e) {
  // Only act as toggle on touch devices
  if (!('ontouchstart' in window)) return;

  e.preventDefault();
  const milestone = e.currentTarget.closest('.timeline__milestone');
  if (!milestone) return;

  if (expandedMilestones.has(milestone)) {
    milestone.classList.remove('is-expanded');
    expandedMilestones.delete(milestone);
  } else {
    // Collapse others
    expandedMilestones.forEach((m) => m.classList.remove('is-expanded'));
    expandedMilestones.clear();
    // Expand this one
    milestone.classList.add('is-expanded');
    expandedMilestones.add(milestone);
  }
}

/**
 * Reveal all milestones immediately (reduced motion or instant).
 */
function revealAll() {
  if (!milestones) return;
  milestones.forEach((milestone) => {
    milestone.classList.add('is-visible');
  });
  hasEntered = true;
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

/**
 * Initialize the timeline scene.
 * @param {HTMLElement} el - The timeline scene root element
 */
function init(el) {
  sceneEl = el;
  trackEl = el.querySelector('.timeline__track');
  milestones = el.querySelectorAll('.timeline__milestone');

  if (prefersReducedMotion()) {
    revealAll();
    // Still bind expand interactions
    bindExpandInteractions();
    // Bind scroll for progress line (no animation, but useful for state)
    window.addEventListener('scroll', onScroll, { passive: true });
    return;
  }

  // Set up IntersectionObserver for staggered entrance
  entranceObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const milestone = entry.target;
          const index = Array.from(milestones).indexOf(milestone);
          const delay = index * STAGGER_DELAY;

          setTimeout(() => {
            milestone.classList.add('is-visible');
          }, delay);

          entranceObserver.unobserve(milestone);
        }
      });
    },
    { threshold: ENTRANCE_THRESHOLD }
  );

  milestones.forEach((milestone) => {
    entranceObserver.observe(milestone);
  });

  // Bind scroll for progress line and active state
  window.addEventListener('scroll', onScroll, { passive: true });

  // Bind expand interactions
  bindExpandInteractions();

  // Initial state
  updateProgressLine();
}

/**
 * Bind hover/tap expand interactions on milestone content cards.
 */
function bindExpandInteractions() {
  if (!milestones) return;

  milestones.forEach((milestone) => {
    const content = milestone.querySelector('.timeline__content');
    if (!content) return;

    content.addEventListener('mouseenter', onMilestoneMouseEnter);
    content.addEventListener('mouseleave', onMilestoneMouseLeave);
    content.addEventListener('click', onMilestoneTap);
  });
}

/**
 * Entrance animation — staggered milestone reveals.
 * Called by SceneManager with sub-progress 0→1.
 * @param {number} progress
 */
function enter(progress) {
  if (hasEntered) return;

  // The IntersectionObserver handles individual milestone reveals,
  // but we can use progress to trigger a batch reveal if needed.
  if (progress >= 1) {
    hasEntered = true;
  }
}

/**
 * Active phase — scene is in viewport.
 * Progress line and active state are handled by scroll listener.
 * @param {number} _progress
 */
function active(_progress) {
  // Scroll listener handles progress line + active milestone
}

/**
 * Exit phase — scene scrolling out of viewport.
 * @param {number} _progress
 */
function exit(_progress) {
  // No special exit behavior needed; CSS handles opacity via is-active
}

/**
 * Tear down — remove observers, listeners, and references.
 */
function destroy() {
  if (entranceObserver) {
    entranceObserver.disconnect();
    entranceObserver = null;
  }

  window.removeEventListener('scroll', onScroll);

  if (milestones) {
    milestones.forEach((milestone) => {
      const content = milestone.querySelector('.timeline__content');
      if (!content) return;
      content.removeEventListener('mouseenter', onMilestoneMouseEnter);
      content.removeEventListener('mouseleave', onMilestoneMouseLeave);
      content.removeEventListener('click', onMilestoneTap);
    });
  }

  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  expandedMilestones.clear();
  sceneEl = null;
  trackEl = null;
  milestones = null;
  hasEntered = false;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default { init, enter, active, exit, destroy };
