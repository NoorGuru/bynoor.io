/**
 * Canvas-based particle system for the hero section background.
 * Renders floating orbs that drift in toroidal space and fade out on scroll.
 */

import { prefersReducedMotion } from './utils/reduced-motion.js';
import { isAbove } from './utils/breakpoints.js';
import { randomBetween, randomInt } from './utils/random.js';

/** Accent palette hue angles (violet, cyan, magenta, amber) */
const ACCENT_HUES = [265, 195, 330, 45];

/** @type {Particle[]} */
let particles = [];
/** @type {number|null} */
let rafId = null;
/** @type {HTMLCanvasElement|null} */
let canvas = null;
/** @type {CanvasRenderingContext2D|null} */
let ctx = null;
/** @type {ResizeObserver|null} */
let resizeObserver = null;
/** @type {number} */
let canvasWidth = 0;
/** @type {number} */
let canvasHeight = 0;
/** @type {number} */
let dpr = 1;

/**
 * @typedef {Object} Particle
 * @property {number} x
 * @property {number} y
 * @property {number} radius
 * @property {number} vx
 * @property {number} vy
 * @property {number} opacity
 * @property {number} hue
 */

/**
 * Creates a particle with random properties within the current canvas bounds.
 * @returns {Particle}
 */
function createParticle() {
  return {
    x: randomBetween(0, canvasWidth),
    y: randomBetween(0, canvasHeight),
    radius: randomBetween(2, 6),
    vx: randomBetween(-0.3, 0.3),
    vy: randomBetween(-0.2, 0.2),
    opacity: randomBetween(0.1, 0.4),
    hue: ACCENT_HUES[randomInt(0, ACCENT_HUES.length - 1)],
  };
}

/**
 * Computes the target particle count based on canvas area and hardware.
 * @param {number} width - Logical canvas width
 * @param {number} height - Logical canvas height
 * @returns {number}
 */
function computeParticleCount(width, height) {
  const area = width * height;
  let count = Math.min(50, Math.floor(area / 10000));
  if (navigator.hardwareConcurrency != null && navigator.hardwareConcurrency < 4) {
    count = Math.floor(count / 2);
  }
  return count;
}

/**
 * Updates and draws all particles for one frame.
 */
function render() {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    // Update position
    p.x += p.vx;
    p.y += p.vy;

    // Toroidal wrapping
    if (p.x < 0) p.x += canvasWidth;
    else if (p.x > canvasWidth) p.x -= canvasWidth;
    if (p.y < 0) p.y += canvasHeight;
    else if (p.y > canvasHeight) p.y -= canvasHeight;

    // Draw particle (scale radius by dpr for crisp rendering)
    ctx.beginPath();
    ctx.arc(p.x * dpr, p.y * dpr, p.radius * dpr, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity})`;
    ctx.fill();
  }
}

/**
 * The animation loop. Pauses when tab is hidden.
 */
function loop() {
  if (document.hidden) {
    rafId = null;
    return;
  }
  render();
  rafId = requestAnimationFrame(loop);
}

/**
 * Starts or resumes the animation loop.
 */
function startLoop() {
  if (rafId == null) {
    rafId = requestAnimationFrame(loop);
  }
}

/**
 * Handles visibility change — pause/resume RAF.
 */
function handleVisibilityChange() {
  if (document.hidden) {
    // Loop will self-terminate on next frame check
    return;
  }
  startLoop();
}

/**
 * Handles scroll to fade particle container opacity.
 */
function handleScroll() {
  if (!canvas) return;
  const hero = canvas.parentElement;
  if (!hero) return;

  const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
  const scrollPastHero = window.scrollY - (heroBottom - window.innerHeight);
  const opacity = Math.max(0, 1 - scrollPastHero / 200);
  canvas.style.opacity = String(opacity);
}

/**
 * Handles canvas resize via ResizeObserver.
 * @param {ResizeObserverEntry[]} entries
 */
function handleResize(entries) {
  if (!canvas || !ctx) return;

  const entry = entries[0];
  const width = entry.contentRect.width;
  const height = entry.contentRect.height;

  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  const oldCanvasWidth = canvasWidth;
  const oldCanvasHeight = canvasHeight;
  canvasWidth = width;
  canvasHeight = height;

  // Clamp existing particles to new bounds
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (p.x > canvasWidth) p.x = canvasWidth - 1;
    if (p.y > canvasHeight) p.y = canvasHeight - 1;
    if (p.x < 0) p.x = 0;
    if (p.y < 0) p.y = 0;
  }

  // Adjust particle count if canvas grew/shrank significantly
  const targetCount = computeParticleCount(canvasWidth, canvasHeight);
  if (particles.length > targetCount) {
    particles.length = targetCount;
  } else {
    while (particles.length < targetCount) {
      particles.push(createParticle());
    }
  }
}

/**
 * Initializes the particle system on the given canvas element.
 * Skips initialization on mobile (<768px) or if reduced-motion is preferred.
 * @param {HTMLCanvasElement} canvasElement
 */
export function initParticleSystem(canvasElement) {
  // Guard: skip on mobile or reduced-motion
  if (!isAbove(768) || prefersReducedMotion()) return;

  // Guard: ensure valid canvas context
  const context = canvasElement.getContext('2d');
  if (!context) return;

  canvas = canvasElement;
  ctx = context;
  canvas.style.pointerEvents = 'none';

  // Initial sizing
  const hero = canvas.parentElement;
  if (!hero) return;

  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = hero.getBoundingClientRect();
  canvasWidth = rect.width;
  canvasHeight = rect.height;

  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;
  canvas.style.width = canvasWidth + 'px';
  canvas.style.height = canvasHeight + 'px';

  // Create particles
  const count = computeParticleCount(canvasWidth, canvasHeight);
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(createParticle());
  }

  // Set up ResizeObserver on hero
  resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(hero);

  // Scroll listener for opacity fade
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Visibility change listener to pause/resume
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Start the render loop
  startLoop();
}

/**
 * Destroys the particle system and cleans up all resources.
 */
export function destroyParticleSystem() {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('visibilitychange', handleVisibilityChange);

  particles = [];
  canvas = null;
  ctx = null;
  canvasWidth = 0;
  canvasHeight = 0;
}
