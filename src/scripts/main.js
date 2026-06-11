// Main application module
import { initNavigation } from './navigation.js';
import { initNav } from './core/nav.js';
import { initScrollSpy } from './scroll-spy.js';
import { initAnimationEngine, initParallax, initSectionAccentReveal } from './animation-engine.js';
import { initParticleSystem } from './particle-system.js';
import { initScrollProgress } from './scroll-progress.js';
import { initMagneticElements } from './magnetic-elements.js';
import { initTiltCards } from './tilt-cards.js';

// Initialize modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Signal that JS is loaded — used by CSS for no-JS fallbacks
  // (e.g., show nav links on mobile when JS is disabled)
  document.documentElement.classList.add('js-loaded');

  // Critical UI — initialize immediately
  initNavigation();
  initNav();
  initScrollSpy();

  // Set current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Defer animation/creative modules until after first paint (one frame)
  requestAnimationFrame(() => {
    initAnimationEngine();
    initParallax();
    initSectionAccentReveal();
    initScrollProgress();
    initMagneticElements();
    initTiltCards();

    // Pass hero canvas element to constellation system
    const heroCanvas = document.querySelector('.hero__canvas');
    if (heroCanvas) {
      initParticleSystem(heroCanvas);
    }
  });
});
