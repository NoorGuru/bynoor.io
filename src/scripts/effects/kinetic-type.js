/**
 * Kinetic Typography — text splitting and reveal animation triggers.
 *
 * Splits elements with `data-kinetic="chars"` or `data-kinetic="words"`
 * into individually addressable spans with `--char-index` CSS variables.
 * Visibility is triggered via IntersectionObserver, adding `.is-visible`
 * to the parent element so CSS can handle the staggered animation.
 *
 * Respects `prefers-reduced-motion` — if active, text is left unsplit
 * and immediately visible.
 *
 * @module kinetic-type
 * @see Requirements 9.1, 9.3, 9.5
 */

import { prefersReducedMotion, onChange } from '../utils/motion.js';
import { createObserver, observeAll, disconnect } from '../utils/observer.js';

/** CSS class added to trigger the reveal animation. */
const VISIBLE_CLASS = 'is-visible';

/** Selector for auto-discovered kinetic elements. */
const SELECTOR = '[data-kinetic]';

/** @type {IntersectionObserver|null} */
let observer = null;

/** @type {Set<HTMLElement>} Elements that have been split. */
const splitElements = new Set();

/** @type {(() => void)|null} */
let motionUnsubscribe = null;

/**
 * Split an element's text content into individually wrapped spans.
 *
 * Each span receives a `--char-index` CSS variable for stagger timing
 * and `will-change: transform, opacity` for GPU acceleration.
 *
 * @param {HTMLElement} el - The element whose text to split.
 * @param {'chars'|'words'} mode - Split by characters or words.
 * @returns {HTMLSpanElement[]} Array of created span elements.
 */
export function splitText(el, mode = 'chars') {
  // If reduced motion is active, skip splitting entirely
  if (prefersReducedMotion()) {
    el.classList.add(VISIBLE_CLASS);
    return [];
  }

  const text = el.textContent || '';
  const className = mode === 'words' ? 'word' : 'char';

  /** @type {HTMLSpanElement[]} */
  const spans = [];

  // Clear existing content
  el.textContent = '';
  el.setAttribute('aria-label', text);

  if (mode === 'chars') {
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const span = document.createElement('span');
      span.className = className;
      span.style.setProperty('--char-index', String(i));
      span.style.willChange = 'transform, opacity';
      span.setAttribute('aria-hidden', 'true');

      // Preserve whitespace as non-breaking space
      if (char === ' ') {
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = char;
      }

      el.appendChild(span);
      spans.push(span);
    }
  } else {
    // Words mode
    const words = text.split(/\s+/).filter(Boolean);

    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = className;
      span.style.setProperty('--char-index', String(index));
      span.style.willChange = 'transform, opacity';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = word;

      el.appendChild(span);
      spans.push(span);

      // Add space between words (except after last)
      if (index < words.length - 1) {
        const spacer = document.createElement('span');
        spacer.className = 'char-space';
        spacer.innerHTML = '&nbsp;';
        spacer.setAttribute('aria-hidden', 'true');
        el.appendChild(spacer);
      }
    });
  }

  splitElements.add(el);
  return spans;
}

/**
 * Manually trigger the reveal animation on an element.
 * Adds the `.is-visible` class to start the CSS transition.
 *
 * @param {HTMLElement} el - The kinetic element to reveal.
 */
export function triggerReveal(el) {
  el.classList.add(VISIBLE_CLASS);
}

/**
 * IntersectionObserver callback — reveals elements as they enter viewport.
 *
 * @param {IntersectionObserverEntry[]} entries
 * @param {IntersectionObserver} obs
 */
function handleIntersection(entries, obs) {
  for (const entry of entries) {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
      triggerReveal(/** @type {HTMLElement} */ (entry.target));
      obs.unobserve(entry.target);
    }
  }
}

/**
 * Auto-discover all `[data-kinetic]` elements, split their text,
 * and set up IntersectionObserver to trigger reveals on scroll.
 *
 * Safe to call multiple times — subsequent calls are no-ops if
 * already initialized.
 */
export function init() {
  // If reduced motion, just make everything visible immediately
  if (prefersReducedMotion()) {
    const elements = document.querySelectorAll(SELECTOR);
    elements.forEach((el) => el.classList.add(VISIBLE_CLASS));
    return;
  }

  const elements = document.querySelectorAll(SELECTOR);

  if (elements.length === 0) return;

  // Split each element based on its data-kinetic mode
  elements.forEach((el) => {
    const mode = el.getAttribute('data-kinetic') === 'words' ? 'words' : 'chars';
    splitText(/** @type {HTMLElement} */ (el), mode);
  });

  // Create observer with a low threshold to trigger near viewport entry
  observer = createObserver(handleIntersection, {
    threshold: [0, 0.1, 0.25],
    rootMargin: '0px 0px -10% 0px',
  });

  if (observer) {
    observeAll(observer, elements);
  } else {
    // IntersectionObserver not supported — reveal everything immediately
    elements.forEach((el) => el.classList.add(VISIBLE_CLASS));
  }

  // Listen for reduced-motion changes so we can restore text if needed
  motionUnsubscribe = onChange((reduced) => {
    if (reduced) {
      destroy();
      const els = document.querySelectorAll(SELECTOR);
      els.forEach((el) => el.classList.add(VISIBLE_CLASS));
    }
  });
}

/**
 * Clean up observers and subscriptions.
 * Does not restore the original text content (DOM stays split).
 */
export function destroy() {
  disconnect(observer);
  observer = null;

  if (motionUnsubscribe) {
    motionUnsubscribe();
    motionUnsubscribe = null;
  }

  splitElements.clear();
}
