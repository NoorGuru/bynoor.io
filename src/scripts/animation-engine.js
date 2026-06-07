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
import { onBreakpointChange } from './utils/breakpoints.js';

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

/**
 * Parallax scroll effect for decorative elements.
 *
 * Translates elements with [data-parallax] at a fraction of scroll speed.
 * The factor is read from the attribute value (e.g., data-parallax="0.3")
 * and clamped to a maximum of 0.5 (50% of scroll speed).
 *
 * Disabled on mobile (<768px) and when reduced-motion is active.
 * Uses requestAnimationFrame to batch DOM writes.
 *
 * Requirements: 4.5, 10.6
 */
export function initParallax() {
  const elements = document.querySelectorAll('[data-parallax]');

  if (!elements.length) return;

  // Skip entirely if user prefers reduced motion
  if (prefersReducedMotion()) return;

  let enabled = false;
  let rafId = null;
  let ticking = false;

  /**
   * Apply parallax transforms based on current scroll position.
   */
  function applyParallax() {
    const scrollTop = window.scrollY || window.pageYOffset;

    elements.forEach((el) => {
      const factor = Math.min(
        parseFloat(el.getAttribute('data-parallax')) || 0.3,
        0.5
      );
      const offset = scrollTop * factor;
      el.style.transform = `translateY(${offset}px)`;
    });

    ticking = false;
  }

  /**
   * Reset all parallax transforms to zero.
   */
  function resetParallax() {
    elements.forEach((el) => {
      el.style.transform = 'translateY(0px)';
    });
  }

  /**
   * Scroll handler — uses RAF to batch DOM writes.
   */
  function onScroll() {
    if (!enabled) return;

    if (!ticking) {
      ticking = true;
      rafId = requestAnimationFrame(applyParallax);
    }
  }

  // Listen for scroll with passive flag for performance
  window.addEventListener('scroll', onScroll, { passive: true });

  // Respond to breakpoint changes at 768px
  onBreakpointChange(768, (matches) => {
    if (matches) {
      // Desktop/tablet: enable parallax
      enabled = true;
      // Apply immediately for current scroll position
      applyParallax();
    } else {
      // Mobile: disable and reset transforms
      enabled = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      ticking = false;
      resetParallax();
    }
  });
}

/**
 * Section accent color reveal.
 *
 * Uses a separate IntersectionObserver (threshold: 0.1) to watch
 * elements with [data-section-accent]. When they intersect the viewport,
 * the .section--revealed class is added, triggering a CSS border-glow
 * or gradient-highlight transition (300–600ms, defined in CSS).
 *
 * Requirements: 1.4
 */
export function initSectionAccentReveal() {
  const sections = document.querySelectorAll('[data-section-accent]');

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section--revealed');
          // Fire-once: unobserve after revealing
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });
}
