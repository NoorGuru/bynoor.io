/**
 * Custom Cursor Module
 * A floating DOM element that tracks the mouse with a lerp-based trailing delay.
 * Only active at viewport >= 1024px and when reduced-motion is not preferred.
 */

import { lerp } from './utils/lerp.js';
import { prefersReducedMotion, onMotionPreferenceChange } from './utils/reduced-motion.js';
import { onBreakpointChange } from './utils/breakpoints.js';

const LERP_FACTOR = 0.35;
const DESKTOP_BREAKPOINT = 1024;
const INTERACTIVE_SELECTOR = 'a, button, [role="button"]';

/** @type {HTMLElement | null} */
let cursorEl = null;

/** @type {number | null} */
let rafId = null;

/** @type {{ targetX: number, targetY: number, currentX: number, currentY: number, isVisible: boolean, isHovering: boolean }} */
let state = {
  targetX: 0,
  targetY: 0,
  currentX: 0,
  currentY: 0,
  isVisible: false,
  isHovering: false,
};

let isActive = false;
let isDesktop = false;
let isReducedMotion = false;

// --- Event handlers (stored for cleanup) ---

function onMouseMove(e) {
  state.targetX = e.clientX;
  state.targetY = e.clientY;
}

function onMouseEnter() {
  state.isVisible = true;
  if (cursorEl) cursorEl.style.opacity = '1';
}

function onMouseLeave() {
  state.isVisible = false;
  if (cursorEl) cursorEl.style.opacity = '0';
}

function onPointerOver(e) {
  if (e.target.closest(INTERACTIVE_SELECTOR)) {
    state.isHovering = true;
    if (cursorEl) cursorEl.classList.add('custom-cursor--hover');
  }
}

function onPointerOut(e) {
  if (e.target.closest(INTERACTIVE_SELECTOR)) {
    state.isHovering = false;
    if (cursorEl) cursorEl.classList.remove('custom-cursor--hover');
  }
}

// --- Animation loop ---

function animate() {
  state.currentX = lerp(state.currentX, state.targetX, LERP_FACTOR);
  state.currentY = lerp(state.currentY, state.targetY, LERP_FACTOR);

  if (cursorEl) {
    cursorEl.style.transform = `translate(${state.currentX}px, ${state.currentY}px) translate(-50%, -50%)`;
  }

  rafId = requestAnimationFrame(animate);
}

// --- Lifecycle ---

function createCursor() {
  if (cursorEl) return;

  cursorEl = document.createElement('div');
  cursorEl.classList.add('custom-cursor');
  cursorEl.setAttribute('aria-hidden', 'true');
  cursorEl.style.opacity = '0';
  document.body.appendChild(cursorEl);

  document.documentElement.classList.add('cursor-active');

  // Attach listeners
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseenter', onMouseEnter);
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('pointerover', onPointerOver);
  document.addEventListener('pointerout', onPointerOut);

  // Start animation loop
  rafId = requestAnimationFrame(animate);
  isActive = true;
}

function destroyCursor() {
  if (!isActive) return;

  // Stop animation loop
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  // Remove listeners
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseenter', onMouseEnter);
  document.removeEventListener('mouseleave', onMouseLeave);
  document.removeEventListener('pointerover', onPointerOver);
  document.removeEventListener('pointerout', onPointerOut);

  // Remove DOM element
  if (cursorEl) {
    cursorEl.remove();
    cursorEl = null;
  }

  document.documentElement.classList.remove('cursor-active');

  // Reset state
  state = {
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    isVisible: false,
    isHovering: false,
  };

  isActive = false;
}

function evaluateState() {
  if (isDesktop && !isReducedMotion) {
    createCursor();
  } else {
    destroyCursor();
  }
}

/**
 * Initializes the custom cursor system.
 * The cursor is only created when viewport >= 1024px and reduced motion is not preferred.
 * Automatically destroys/re-creates on breakpoint or motion preference changes.
 */
export function initCustomCursor() {
  // Watch breakpoint changes
  onBreakpointChange(DESKTOP_BREAKPOINT, (matches) => {
    isDesktop = matches;
    evaluateState();
  });

  // Watch reduced-motion changes
  onMotionPreferenceChange((reduced) => {
    isReducedMotion = reduced;
    evaluateState();
  });
}
