/**
 * Animation Engine — scroll-triggered entrance animations
 *
 * Replaces the basic animations.js with a full-featured animation system:
 * - Single IntersectionObserver with threshold 0.2
 * - Fire-once semantics (unobserve after first trigger)
 * - Stagger logic via data-animate-stagger on parent containers
 * - Reduced-motion support: skips animate-hidden, elements visible immediately
 *
 * Configuration via data attributes:
 *   data-animate="fade-up|fade-in|scale-in" — animation type
 *   data-animate-delay="<ms>" — explicit delay
 *   data-animate-stagger="<ms>" — parent-level: auto-delays children by increment
 */

import { prefersReducedMotion } from './utils/reduced-motion.js';

/**
 * Initializes the animation engine.
 * Creates an IntersectionObserver that triggers entrance animations
 * on elements with [data-animate] when they become 20% visible.
 */
export function initAnimationEngine() {
  const elements = document.querySelectorAll('[data-animate]');

  if (!elements.length) return;

  // If user prefers reduced motion, skip all animations —
  // elements stay in their natural visible state.
  if (prefersReducedMotion()) {
    return;
  }

  // Apply stagger delays to children of containers with data-animate-stagger
  applyStaggerDelays();

  // Add .animate-hidden via JS (progressive enhancement).
  // Without JS, elements remain visible.
  elements.forEach((el) => {
    el.classList.add('animate-hidden');
  });

  // Single observer for all animated elements
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;

          // Apply explicit delay from data attribute
          const delay = el.getAttribute('data-animate-delay');
          if (delay) {
            el.style.transitionDelay = `${delay}ms`;
          }

          // Trigger the entrance animation
          el.classList.add('animate-visible');

          // Fire-once: unobserve immediately after triggering
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.2 }
  );

  // Observe all animated elements
  elements.forEach((el) => {
    observer.observe(el);
  });
}

/**
 * Reads data-animate-stagger on parent containers and
 * auto-calculates transition-delay for each child with [data-animate].
 *
 * Example: A parent with data-animate-stagger="100" and 4 children
 * will assign delays of 0ms, 100ms, 200ms, 300ms to its children.
 */
function applyStaggerDelays() {
  const staggerParents = document.querySelectorAll('[data-animate-stagger]');

  staggerParents.forEach((parent) => {
    const staggerMs = parseInt(parent.getAttribute('data-animate-stagger'), 10);
    if (!staggerMs || isNaN(staggerMs)) return;

    const children = parent.querySelectorAll('[data-animate]');
    children.forEach((child, index) => {
      // Only set stagger delay if no explicit delay is already defined
      if (!child.hasAttribute('data-animate-delay')) {
        child.setAttribute('data-animate-delay', String(staggerMs * index));
      }
    });
  });
}
