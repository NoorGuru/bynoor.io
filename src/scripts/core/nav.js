/**
 * Morphing Navigation — state machine driving nav visual transitions.
 *
 * States:
 *   HERO_MODE   → Minimal floating dots (scroll < hero height)
 *   PILL_MODE   → Compact bar with labels + sliding indicator (scroll >= hero height)
 *   EXPANDED_MODE → Full-screen overlay (mobile hamburger tap)
 *
 * The module works standalone via scroll events. It will be wired to
 * ScrollEngine lifecycle events through app.js in the future.
 *
 * @module nav
 * @see Requirements 3.1, 3.2, 3.3, 3.4
 */

import { scheduleRead, scheduleWrite } from '../utils/raf.js';
import { prefersReducedMotion } from '../utils/motion.js';

// --- Constants ---

/** @enum {string} */
const STATE = {
  HERO: 'hero',
  PILL: 'pill',
  EXPANDED: 'expanded',
};

/** Morph transition zone in pixels — how many px the morph takes to go 0→1 */
const MORPH_TRANSITION_PX = 120;

// --- Module state ---

/** @type {HTMLElement|null} */
let navEl = null;

/** @type {HTMLElement|null} */
let heroEl = null;

/** @type {HTMLElement|null} */
let indicatorEl = null;

/** @type {HTMLElement|null} */
let triggerEl = null;

/** @type {NodeListOf<HTMLElement>|null} */
let dots = null;

/** @type {NodeListOf<HTMLElement>|null} */
let pillLinks = null;

/** @type {NodeListOf<HTMLElement>|null} */
let overlayLinks = null;

/** @type {HTMLElement[]} */
let sections = [];

/** @type {string} */
let currentState = STATE.HERO;

/** @type {string|null} */
let activeSection = null;

/** @type {boolean} */
let ticking = false;

/** @type {boolean} */
let destroyed = false;

// --- Internal helpers ---

/**
 * Clamp a value between 0 and 1.
 * @param {number} v
 * @returns {number}
 */
function clamp01(v) {
  return Math.min(Math.max(v, 0), 1);
}

/**
 * Set the navigation state via data attribute. CSS handles the visual transitions.
 * @param {string} state - One of STATE values
 */
function setState(state) {
  if (currentState === state || !navEl) return;
  currentState = state;
  navEl.dataset.navState = state;
}

/**
 * Compute and apply morph progress CSS variable.
 * 0 = fully in hero zone, 1 = fully in pill zone.
 * @param {number} scrollY
 * @param {number} heroHeight
 */
function updateMorphProgress(scrollY, heroHeight) {
  if (!navEl) return;

  const transitionStart = heroHeight - MORPH_TRANSITION_PX;
  let progress;

  if (scrollY <= transitionStart) {
    progress = 0;
  } else if (scrollY >= heroHeight) {
    progress = 1;
  } else {
    progress = (scrollY - transitionStart) / MORPH_TRANSITION_PX;
  }

  progress = clamp01(progress);

  // Skip intermediate values when reduced motion is preferred
  if (prefersReducedMotion()) {
    progress = progress >= 0.5 ? 1 : 0;
  }

  navEl.style.setProperty('--nav-morph-progress', progress.toFixed(3));
}

/**
 * Determine which section is closest to the viewport center.
 * @returns {string|null} Section id or null
 */
function detectActiveSection() {
  if (sections.length === 0) return null;

  const viewportCenter = window.innerHeight / 2;
  let closest = null;
  let closestDistance = Infinity;

  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const distance = Math.abs(sectionCenter - viewportCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = section.id || section.dataset.scene || null;
    }
  }

  return closest;
}

/**
 * Update active indicators on dots, pill links, and overlay links.
 * @param {string|null} sectionId
 */
function updateActiveIndicators(sectionId) {
  if (sectionId === activeSection) return;
  activeSection = sectionId;

  // Update dots
  if (dots) {
    dots.forEach((dot) => {
      const isActive = dot.dataset.target === sectionId;
      dot.classList.toggle('nav__dot--active', isActive);
    });
  }

  // Update pill links
  if (pillLinks) {
    let activePillLink = null;

    pillLinks.forEach((link) => {
      const target = getLinkTarget(link);
      const isActive = target === sectionId;
      link.classList.toggle('nav__pill-link--active', isActive);
      if (isActive) activePillLink = link;
    });

    // Move the sliding indicator
    moveIndicator(activePillLink);
  }

  // Update overlay links
  if (overlayLinks) {
    overlayLinks.forEach((link) => {
      const target = getLinkTarget(link);
      const isActive = target === sectionId;
      link.classList.toggle('nav__overlay-link--active', isActive);
    });
  }
}

/**
 * Extract the target section id from a nav link's href.
 * @param {HTMLElement} link
 * @returns {string|null}
 */
function getLinkTarget(link) {
  const href = link.getAttribute('href');
  if (!href || !href.startsWith('#')) return null;
  return href.slice(1);
}

/**
 * Position the sliding indicator behind the active pill link.
 * @param {HTMLElement|null} activePillLink
 */
function moveIndicator(activePillLink) {
  if (!indicatorEl || !activePillLink) {
    if (indicatorEl) {
      indicatorEl.style.width = '0px';
    }
    return;
  }

  const pillContainer = activePillLink.parentElement;
  if (!pillContainer) return;

  const containerRect = pillContainer.getBoundingClientRect();
  const linkRect = activePillLink.getBoundingClientRect();

  const left = linkRect.left - containerRect.left;
  const width = linkRect.width;

  indicatorEl.style.left = `${left}px`;
  indicatorEl.style.width = `${width}px`;
}

/**
 * Handle scroll — determine state and active section.
 */
function onScroll() {
  if (ticking || destroyed) return;
  ticking = true;

  scheduleRead(() => {
    if (destroyed) {
      ticking = false;
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset;
    const heroHeight = heroEl ? heroEl.offsetHeight : 0;

    // Determine nav state based on scroll position (don't override expanded)
    if (currentState !== STATE.EXPANDED) {
      if (scrollY < heroHeight) {
        setState(STATE.HERO);
      } else {
        setState(STATE.PILL);
      }
    }

    // Update morph progress
    updateMorphProgress(scrollY, heroHeight);

    // Detect active section
    const detected = detectActiveSection();

    scheduleWrite(() => {
      updateActiveIndicators(detected);
      ticking = false;
    });
  });
}

/**
 * Handle click on the mobile trigger (hamburger) button.
 */
function onTriggerClick() {
  if (currentState === STATE.EXPANDED) {
    closeExpanded();
  } else {
    openExpanded();
  }
}

/**
 * Open expanded (mobile overlay) mode.
 */
function openExpanded() {
  setState(STATE.EXPANDED);
  if (triggerEl) {
    triggerEl.setAttribute('aria-expanded', 'true');
  }
  // Prevent body scroll while overlay is open
  document.body.style.overflow = 'hidden';
}

/**
 * Close expanded mode and return to the appropriate scroll-based state.
 */
function closeExpanded() {
  if (triggerEl) {
    triggerEl.setAttribute('aria-expanded', 'false');
  }
  document.body.style.overflow = '';

  // Return to scroll-based state
  const scrollY = window.scrollY || window.pageYOffset;
  const heroHeight = heroEl ? heroEl.offsetHeight : 0;

  if (scrollY < heroHeight) {
    setState(STATE.HERO);
  } else {
    setState(STATE.PILL);
  }
}

/**
 * Handle keydown — Escape closes expanded mode.
 * @param {KeyboardEvent} e
 */
function onKeydown(e) {
  if (e.key === 'Escape' && currentState === STATE.EXPANDED) {
    closeExpanded();
    if (triggerEl) triggerEl.focus();
  }
}

/**
 * Handle nav link clicks — smooth scroll to target section.
 * @param {Event} e
 */
function onNavLinkClick(e) {
  const link = e.target.closest('[href^="#"]');
  if (!link) return;

  const targetId = link.getAttribute('href').slice(1);
  const targetEl = document.getElementById(targetId);
  if (!targetEl) return;

  e.preventDefault();

  // Close expanded mode if open
  if (currentState === STATE.EXPANDED) {
    closeExpanded();
  }

  // Smooth scroll (or instant if reduced motion)
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
  targetEl.scrollIntoView({ behavior, block: 'start' });
}

/**
 * Gather section elements that the nav can link to.
 * Looks for elements with [data-scene] or sections with an id.
 */
function discoverSections() {
  const sceneEls = document.querySelectorAll('[data-scene]');
  if (sceneEls.length > 0) {
    sections = Array.from(sceneEls);
    return;
  }

  // Fallback: sections with an id
  const sectionEls = document.querySelectorAll('section[id]');
  sections = Array.from(sectionEls);
}

// --- Public API ---

/**
 * Initialize the morphing navigation module.
 *
 * Queries the DOM for nav elements, attaches scroll/click/keyboard
 * listeners, and sets the initial state based on current scroll position.
 */
export function initNav() {
  navEl = document.querySelector('.nav[data-nav-state]');
  if (!navEl) return;

  heroEl = document.querySelector('[data-scene="hero"]') ||
           document.querySelector('.hero') ||
           document.querySelector('#hero');

  indicatorEl = navEl.querySelector('.nav__indicator');
  triggerEl = navEl.querySelector('.nav__trigger');
  dots = navEl.querySelectorAll('.nav__dot');
  pillLinks = navEl.querySelectorAll('.nav__pill-link');
  overlayLinks = navEl.querySelectorAll('.nav__overlay-link');

  discoverSections();

  destroyed = false;

  // Set initial state
  const scrollY = window.scrollY || window.pageYOffset;
  const heroHeight = heroEl ? heroEl.offsetHeight : 0;

  if (scrollY < heroHeight) {
    setState(STATE.HERO);
  } else {
    setState(STATE.PILL);
  }

  updateMorphProgress(scrollY, heroHeight);

  // Detect initial active section
  const initialActive = detectActiveSection();
  updateActiveIndicators(initialActive);

  // Attach listeners
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('keydown', onKeydown);

  if (triggerEl) {
    triggerEl.addEventListener('click', onTriggerClick);
  }

  // Delegate link clicks on the entire nav
  navEl.addEventListener('click', onNavLinkClick);
}

/**
 * Set the active section externally (called by ScrollEngine events).
 *
 * @param {string} sectionId - The id of the section to mark as active
 */
export function setActiveSection(sectionId) {
  scheduleWrite(() => {
    updateActiveIndicators(sectionId);
  });
}

/**
 * Tear down the navigation module — remove listeners and reset state.
 * Useful for cleanup in tests or SPA transitions.
 */
export function destroyNav() {
  destroyed = true;

  window.removeEventListener('scroll', onScroll);
  document.removeEventListener('keydown', onKeydown);

  if (triggerEl) {
    triggerEl.removeEventListener('click', onTriggerClick);
  }

  if (navEl) {
    navEl.removeEventListener('click', onNavLinkClick);
  }

  document.body.style.overflow = '';

  // Reset references
  navEl = null;
  heroEl = null;
  indicatorEl = null;
  triggerEl = null;
  dots = null;
  pillLinks = null;
  overlayLinks = null;
  sections = [];
  currentState = STATE.HERO;
  activeSection = null;
  ticking = false;
}
