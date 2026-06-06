/**
 * Scroll-triggered entrance animations
 * Progressive enhancement: elements remain visible if JS is disabled.
 * JS adds .animate-hidden on load, then .animate-visible on intersection.
 */

export function initAnimations() {
  const elements = document.querySelectorAll('[data-animate]');

  if (!elements.length) return;

  // Add .animate-hidden via JS (progressive enhancement)
  elements.forEach((el) => {
    el.classList.add('animate-hidden');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.getAttribute('data-animate-delay');

          if (delay) {
            el.style.transitionDelay = `${delay}ms`;
          }

          el.classList.add('animate-visible');
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.2 }
  );

  elements.forEach((el) => {
    observer.observe(el);
  });
}
