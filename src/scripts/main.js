// Main application module
import { initNavigation } from './navigation.js';
import { initScrollSpy } from './scroll-spy.js';
import { initAnimationEngine, initParallax, initSectionAccentReveal } from './animation-engine.js';
import { initScrollProgress } from './scroll-progress.js';
import { initMagneticElements } from './magnetic-elements.js';
import { initTiltCards } from './tilt-cards.js';
import { initRecommendations } from './recommendations.js';
import { initNoorEyes } from './noor-eyes.js';

// Initialize modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Signal that JS is loaded — used by CSS for no-JS fallbacks
  document.documentElement.classList.add('js-loaded');

  // Critical UI — initialize immediately
  initNavigation();
  initScrollSpy();
  initRecommendations();

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
    initNoorEyes();
  });
});
