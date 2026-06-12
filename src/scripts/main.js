// Main application module
import { initNavigation } from './navigation.js';
import { initNav } from './core/nav.js';
import { initScrollSpy } from './scroll-spy.js';
import { CommandPalette } from './ui/command-palette.js';
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

  // Command Palette — ready quickly but not blocking critical UI
  const palette = new CommandPalette();
  palette.init();

  palette.registerCommand({
    id: 'nav-resources',
    label: 'Resources — Technical Interview Preparation Kit',
    action: () => { window.location.href = '/technical-interview-preparation-kit/'; },
    category: 'navigation',
    keywords: ['resources', 'interview', 'preparation', 'kit', 'technical']
  });

  palette.registerCommand({
    id: 'nav-home',
    label: 'Home',
    action: () => { document.querySelector('#hero')?.scrollIntoView({ behavior: 'smooth' }); },
    category: 'navigation',
    keywords: ['home', 'top', 'hero']
  });

  palette.registerCommand({
    id: 'nav-journey',
    label: 'Journey',
    action: () => { document.querySelector('#timeline')?.scrollIntoView({ behavior: 'smooth' }); },
    category: 'navigation',
    keywords: ['journey', 'timeline', 'experience']
  });

  palette.registerCommand({
    id: 'nav-projects',
    label: 'Projects',
    action: () => { document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }); },
    category: 'navigation',
    keywords: ['projects', 'work', 'portfolio']
  });

  palette.registerCommand({
    id: 'nav-highlights',
    label: 'Highlights',
    action: () => { document.querySelector('#highlights')?.scrollIntoView({ behavior: 'smooth' }); },
    category: 'navigation',
    keywords: ['highlights', 'achievements']
  });

  palette.registerCommand({
    id: 'nav-testimonials',
    label: 'Testimonials',
    action: () => { document.querySelector('#theater')?.scrollIntoView({ behavior: 'smooth' }); },
    category: 'navigation',
    keywords: ['testimonials', 'theater', 'reviews']
  });

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
