// Main application module
import { initNavigation } from './navigation.js';
import { initScrollSpy } from './scroll-spy.js';
import { initAnimations } from './animations.js';

// Initialize modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollSpy();
  initAnimations();

  // Set current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
