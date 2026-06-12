/**
 * core/app.js — Main application entry point.
 *
 * Orchestrates initialization of all critical and non-critical modules:
 * - Critical path (immediate): ScrollEngine, SceneManager, navigation,
 *   ambient layer, grain overlay, glow system, cursor, particles, scroll progress.
 * - Deferred (idle/interaction): command palette, sound toggle, easter eggs.
 *
 * Lazy-loads non-critical UI modules via dynamic import to keep the initial
 * bundle small and meet Requirement 12.8 (lazy-load non-critical assets).
 *
 * @module core/app
 * @see Requirements 2.1, 12.8
 */

import { ScrollEngine } from './scroll-engine.js';
import { SceneManager } from './scene-manager.js';
import { initNav } from './nav.js';
import { initAmbient } from '../effects/ambient.js';
import { initGrain } from '../effects/grain.js';
import { initGlow } from '../effects/glow.js';
import { initCursor } from '../effects/cursor.js';
import { initParticles } from '../effects/particles.js';
import { initScrollProgress } from '../scroll-progress.js';
import { initAnimationEngine, initSectionAccentReveal } from '../animation-engine.js';
import { initTiltCards } from '../tilt-cards.js';

// --- Scene accent hue mapping (mirrors SCENE_DEFAULTS in scene-manager.js) ---

const SCENE_HUES = {
  hero: 270,
  highlights: 40,
  timeline: 200,
  projects: 280,
  theater: 320,
  skills: 180,
  connect: 250,
  footer: 260,
};

/**
 * Schedules a callback via requestIdleCallback (with fallback to setTimeout).
 * @param {() => void} fn
 */
function onIdle(fn) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(fn, { timeout: 3000 });
  } else {
    setTimeout(fn, 1500);
  }
}

/**
 * Lazy-load non-critical UI modules (command palette, sound, easter eggs).
 * Triggered on idle or first user interaction — whichever comes first.
 */
function loadDeferredModules() {
  let loaded = false;

  async function load() {
    if (loaded) return;
    loaded = true;

    // Remove one-shot interaction listeners
    document.removeEventListener('pointerdown', load);
    document.removeEventListener('keydown', load);

    // Dynamic imports — Requirement 12.8
    const [
      { CommandPalette },
      { SoundToggle },
      { initEasterEggs },
    ] = await Promise.all([
      import('../ui/command-palette.js'),
      import('../ui/sound.js'),
      import('../ui/easter-eggs.js'),
    ]);

    // --- Command Palette ---
    const palette = new CommandPalette();
    palette.init();
    registerCommands(palette);

    // --- Sound Toggle ---
    const sound = new SoundToggle();
    await sound.init();

    // Wire sound toggle button in DOM
    const soundBtn = document.querySelector('[data-sound-toggle]');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => sound.toggle());
    }

    // --- Easter Eggs ---
    initEasterEggs();
  }

  // Fire on idle
  onIdle(load);

  // Also fire on first interaction (whichever comes first)
  document.addEventListener('pointerdown', load, { once: true, passive: true });
  document.addEventListener('keydown', load, { once: true, passive: true });
}

/**
 * Register command palette navigation commands and resources.
 * @param {import('../ui/command-palette.js').CommandPalette} palette
 */
function registerCommands(palette) {
  palette.registerCommand({
    id: 'nav-home',
    label: 'Home',
    action: () => { document.querySelector('#hero')?.scrollIntoView({ behavior: 'smooth' }); },
    category: 'navigation',
    keywords: ['home', 'top', 'hero'],
  });

  palette.registerCommand({
    id: 'nav-journey',
    label: 'Journey',
    action: () => { document.querySelector('#timeline')?.scrollIntoView({ behavior: 'smooth' }); },
    category: 'navigation',
    keywords: ['journey', 'timeline', 'experience'],
  });

  palette.registerCommand({
    id: 'nav-projects',
    label: 'Projects',
    action: () => { document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }); },
    category: 'navigation',
    keywords: ['projects', 'work', 'portfolio'],
  });

  palette.registerCommand({
    id: 'nav-highlights',
    label: 'Highlights',
    action: () => { document.querySelector('#highlights')?.scrollIntoView({ behavior: 'smooth' }); },
    category: 'navigation',
    keywords: ['highlights', 'achievements'],
  });

  palette.registerCommand({
    id: 'nav-testimonials',
    label: 'Testimonials',
    action: () => { document.querySelector('#theater')?.scrollIntoView({ behavior: 'smooth' }); },
    category: 'navigation',
    keywords: ['testimonials', 'theater', 'reviews'],
  });

  palette.registerCommand({
    id: 'nav-resources',
    label: 'Resources — Technical Interview Preparation Kit',
    action: () => { window.location.href = '/technical-interview-preparation-kit/'; },
    category: 'navigation',
    keywords: ['resources', 'interview', 'preparation', 'kit', 'technical'],
  });
}

// --- Application bootstrap ---

document.addEventListener('DOMContentLoaded', () => {
  // Signal JS has loaded — used by CSS for progressive enhancement
  document.documentElement.classList.add('js-loaded');

  // Set current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // --- Critical path: immediate initialization ---

  // 1. ScrollEngine — central scroll orchestrator (Requirement 2.1)
  const scrollEngine = new ScrollEngine();

  // 2. SceneManager — discovers scenes, wires lifecycle to ScrollEngine
  const sceneManager = new SceneManager({ scrollEngine });
  sceneManager.init();

  // 3. Navigation — morphing nav state machine
  initNav();

  // 4. Ambient gradient layer
  const ambient = initAmbient();

  // 5. Wire scroll engine scene changes to ambient hue shifts
  if (ambient) {
    scrollEngine.onSceneChange((sceneId, lifecycle) => {
      if (lifecycle === 'enter' || lifecycle === 'active') {
        const hue = SCENE_HUES[sceneId];
        if (hue != null) {
          // Spread hue across three orbs with slight offsets for variation
          ambient.setAccentHue(hue, hue + 30, hue - 20);
        }
      }
    });
  }

  // 6. Film grain overlay
  initGrain();

  // 7. Glow system — cursor-following radial glow on [data-glow] elements
  initGlow('[data-glow]');

  // 8. Custom cursor with magnetic pull
  initCursor();

  // 9. Particle system on hero canvas (new effects/particles.js)
  const heroCanvas = document.querySelector('.hero__canvas');
  if (heroCanvas) {
    initParticles(heroCanvas);
  }

  // 10. Scroll progress bar
  initScrollProgress();

  // --- Kinetic type: ensure text reveal system runs regardless of scene loading ---
  import('../effects/kinetic-type.js').then(m => m.init());

  // --- Footer reveal observer ---
  const footer = document.querySelector('.footer');
  if (footer) {
    const footerObs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { footer.classList.add('is-visible'); footerObs.disconnect(); }
    }, { threshold: 0.1 });
    footerObs.observe(footer);
  }

  // --- Connect section reveal observers ---
  const connectReveals = document.querySelectorAll('.scene--connect .links__heading, .scene--connect .links__subtitle, .scene--connect .links__cta-banner, .scene--connect .link-card, .scene--connect .links__grid-heading');
  if (connectReveals.length) {
    const connectObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); connectObs.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    connectReveals.forEach(el => connectObs.observe(el));
  }

  // --- Deferred after first paint: animation/creative modules ---

  requestAnimationFrame(() => {
    // Animation engine (stagger, fade-up, etc.)
    initAnimationEngine();
    initSectionAccentReveal();

    // Tilt cards (still needed for card hover effects)
    initTiltCards();
  });

  // --- Non-critical UI modules: lazy-loaded on idle/interaction ---
  loadDeferredModules();
});
