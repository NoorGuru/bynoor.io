/**
 * Hero Scene — cinematic opening with kinetic name reveal,
 * staggered tagline/role entrance, and parallax dissolve on exit.
 *
 * Implements the SceneModule lifecycle interface:
 * - init(sceneEl) — DOM refs, text splitting, particle setup
 * - enter(progress) — orchestrated stagger reveal (0→1)
 * - active(progress) — particle tick, subtle parallax on ambient layer
 * - exit(progress) — parallax dissolve, pause particles when offscreen
 * - destroy() — tear down particles and listeners
 *
 * @module scenes/hero
 * @see Requirements 1.1, 1.2, 1.5
 */

import { splitText, triggerReveal } from '../effects/kinetic-type.js';
import { prefersReducedMotion } from '../utils/motion.js';

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let sceneEl = null;

/** @type {HTMLElement|null} */
let nameEl = null;

/** @type {HTMLElement|null} */
let taglineEl = null;

/** @type {HTMLElement|null} */
let roleEl = null;

/** @type {HTMLElement|null} */
let actionsEl = null;

/** @type {HTMLCanvasElement|null} */
let particlesCanvas = null;

/** @type {HTMLElement|null} */
let scrollCueEl = null;

/** @type {{ start: () => void, stop: () => void, destroy: () => void, resize: () => void }|null} */
let particleController = null;

/** Whether the name reveal has been triggered. */
let nameRevealed = false;

/** Whether the tagline reveal has been triggered. */
let taglineRevealed = false;

/** Whether the full enter sequence has completed. */
let hasRevealed = false;

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Progress thresholds for staggered entrance orchestration.
 * The SceneManager sends sub-progress (0→1) within the enter phase.
 */
const THRESHOLDS = {
  NAME_TRIGGER: 0.5,
  TAGLINE_TRIGGER: 0.7,
  ROLE_TRIGGER: 0.85,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Show an element by adding the `.is-visible` class.
 * @param {HTMLElement|null} el
 */
function show(el) {
  if (el) el.classList.add('is-visible');
}

/**
 * Clamp a value between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Immediately reveal all hero elements — used for reduced-motion
 * or when the enter phase should be instant.
 */
function revealAll() {
  show(sceneEl);
  if (nameEl) triggerReveal(nameEl);
  if (taglineEl) triggerReveal(taglineEl);
  show(roleEl);
  show(actionsEl);
  show(scrollCueEl);

  nameRevealed = true;
  taglineRevealed = true;
  hasRevealed = true;
}

/**
 * Dynamically import and initialize the particle system.
 * Uses dynamic import so the hero can render even if particles.js
 * is not yet available (graceful degradation).
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<void>}
 */
async function loadParticles(canvas) {
  try {
    const mod = await import('../effects/particles.js');
    if (!mod || !mod.initParticles) return;

    particleController = mod.initParticles(canvas, {
      density: 1,
      driftSpeed: 0.6,
      connectionDistance: 120,
      colors: [265, 195, 330],
    });
  } catch {
    // particles.js not available yet — degrade silently
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

/**
 * Initialize the hero scene — gather DOM references, split kinetic text,
 * and set up the particle canvas.
 *
 * @param {HTMLElement} el - The hero scene root element
 */
function init(el) {
  sceneEl = el;

  // Gather DOM references
  nameEl = el.querySelector('.hero__name');
  taglineEl = el.querySelector('.hero__tagline');
  roleEl = el.querySelector('.hero__role');
  actionsEl = el.querySelector('.hero__actions');
  particlesCanvas = el.querySelector('.hero__particles');
  scrollCueEl = el.querySelector('.hero__scroll-cue');

  // If reduced motion is active, show everything immediately
  if (prefersReducedMotion()) {
    revealAll();
    return;
  }

  // Split kinetic text elements for staggered char/word animation.
  // splitText wraps each char/word in a span with --char-index for CSS delays.
  if (nameEl) {
    splitText(nameEl, 'chars');
  }
  if (taglineEl) {
    splitText(taglineEl, 'words');
  }

  // Initialize particle system if canvas exists
  if (particlesCanvas) {
    loadParticles(particlesCanvas);
  }
}

/**
 * Entrance animation — orchestrated name reveal and staggered content.
 *
 * The SceneManager calls this with sub-progress 0→1 within the enter phase.
 * JS triggers `.is-visible` / `triggerReveal()` at the correct thresholds;
 * CSS handles the actual animation timing via `--char-index` delays.
 *
 * Stagger order:
 *   ~0.5 → Name kinetic reveal (Req 1.1)
 *   ~0.7 → Tagline staggered word reveal (Req 1.2)
 *   ~0.85 → Role + CTA actions fade in
 *
 * @param {number} progress - Enter sub-progress (0→1)
 */
function enter(progress) {
  // Once fully revealed, short-circuit
  if (hasRevealed) return;

  // Scene element gets is-visible on first enter call
  show(sceneEl);

  // Name reveal at threshold (Req 1.1)
  if (progress >= THRESHOLDS.NAME_TRIGGER && nameEl && !nameRevealed) {
    triggerReveal(nameEl);
    nameRevealed = true;
  }

  // Tagline reveal after name (Req 1.2)
  if (progress >= THRESHOLDS.TAGLINE_TRIGGER && taglineEl && !taglineRevealed) {
    triggerReveal(taglineEl);
    taglineRevealed = true;
  }

  // Role + CTA actions
  if (progress >= THRESHOLDS.ROLE_TRIGGER) {
    show(roleEl);
    show(actionsEl);
    show(scrollCueEl);
  }

  // Mark as fully revealed once enter completes
  if (progress >= 1) {
    hasRevealed = true;
  }
}

/**
 * Active phase — scene is fully in viewport.
 *
 * Particles run autonomously via their own rAF loop. CSS handles
 * parallax via the `--scene-progress` custom property set by ScrollEngine.
 * We can drive subtle ambient shifts here if needed.
 *
 * @param {number} _progress - Active sub-progress (0→1), unused
 */
function active(_progress) {
  // Particles animate autonomously — no per-frame work needed from JS.
  // CSS uses --scene-progress for any parallax layering.
}

/**
 * Exit phase — parallax dissolve as user scrolls past hero (Req 1.5).
 *
 * The dissolve visual is driven primarily by CSS using `--scene-progress`.
 * JS pauses the particle system when the hero is mostly offscreen
 * to save GPU/CPU resources.
 *
 * @param {number} progress - Exit sub-progress (0→1)
 */
function exit(progress) {
  if (!particleController) return;

  // Pause particles once hero is more than halfway offscreen
  if (progress > 0.5) {
    particleController.stop();
  } else {
    particleController.start();
  }
}

/**
 * Tear down the hero scene — destroy particles, clean up references.
 */
function destroy() {
  if (particleController) {
    particleController.destroy();
    particleController = null;
  }

  // Reset state
  sceneEl = null;
  nameEl = null;
  taglineEl = null;
  roleEl = null;
  actionsEl = null;
  particlesCanvas = null;
  scrollCueEl = null;
  nameRevealed = false;
  taglineRevealed = false;
  hasRevealed = false;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default { init, enter, active, exit, destroy };
