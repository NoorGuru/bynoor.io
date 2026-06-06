// Main application module
import { initNavigation } from './navigation.js';
import { initScrollSpy } from './scroll-spy.js';

// Initialize modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollSpy();
});
