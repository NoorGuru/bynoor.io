/**
 * Projects Scene — Spotlight project cards with scroll entrance
 * animations, alternating direction reveals, and glow integration.
 *
 * Implements the SceneModule lifecycle interface:
 * - init(sceneEl) — DOM refs, observer setup, glow init
 * - enter(progress) — entrance animations (0→1)
 * - active(progress) — while in viewport
 * - exit(progress) — exit phase
 * - destroy() — cleanup observers and glow
 *
 * @module scenes/projects
 * @see Requirements 5.3, 5.5
 */

import { prefersReducedMotion } from '../utils/motion.js';
import { initGlow, destroy as destroyGlow } from '../effects/glow.js';

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let sceneEl = null;

/** @type {NodeListOf<HTMLElement>|null} */
let cards = null;

/** @type {IntersectionObserver|null} */
let entranceObserver = null;

/** @type {boolean} */
let hasEntered = false;

// ─── Constants ────────────────────────────────────────────────────────────────

/** Stagger delay between card entrance animations (ms). */
const STAGGER_DELAY = 150;

/** Threshold for IntersectionObserver entrance detection. */
const ENTRANCE_THRESHOLD = 0.2;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Reveal all cards immediately (reduced motion or fallback).
 */
function revealAll() {
  if (!cards) return;
  cards.forEach((card) => {
    card.classList.add('is-visible');
  });
  hasEntered = true;
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

/**
 * Initialize the projects scene.
 * @param {HTMLElement} el - The projects scene root element
 */
function init(el) {
  sceneEl = el;
  cards = el.querySelectorAll('.project-card');

  // If reduced motion is preferred, reveal all cards immediately
  if (prefersReducedMotion()) {
    revealAll();
    return;
  }

  // Initialize glow effect on cards with [data-glow]
  initGlow('[data-glow]');

  // Set up IntersectionObserver for staggered entrance animations
  entranceObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const index = Array.from(cards).indexOf(card);
          const delay = index * STAGGER_DELAY;

          setTimeout(() => {
            card.classList.add('is-visible');
          }, delay);

          entranceObserver.unobserve(card);
        }
      });
    },
    { threshold: ENTRANCE_THRESHOLD }
  );

  cards.forEach((card) => {
    entranceObserver.observe(card);
  });
}

/**
 * Entrance animation phase — called by SceneManager with progress 0→1.
 * IntersectionObserver handles individual card reveals.
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
 * Glow tracking is handled by the glow.js module.
 * @param {number} _progress
 */
function active(_progress) {
  // Glow and interactions are handled by CSS + glow.js
}

/**
 * Exit phase — scene scrolling out of viewport.
 * @param {number} _progress
 */
function exit(_progress) {
  // No special exit behavior; cards remain visible once revealed
}

/**
 * Tear down — remove observers and clean up references.
 */
function destroy() {
  if (entranceObserver) {
    entranceObserver.disconnect();
    entranceObserver = null;
  }

  sceneEl = null;
  cards = null;
  hasEntered = false;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default { init, enter, active, exit, destroy };
