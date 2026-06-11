/**
 * Canvas 2D particle system — constellation-style nodes with connections.
 *
 * Renders drifting nodes connected by proximity lines, creating a geometric
 * network effect for the hero background. Configurable density, drift speed,
 * connection distance, and color palette.
 *
 * Only initializes on viewports >= 768px and respects reduced-motion.
 * Pauses automatically when the tab is hidden (Visibility API).
 *
 * @module effects/particles
 * @see Requirements 1.3, 13.1
 */

import { prefersReducedMotion, onChange as onMotionChange } from '../utils/motion.js';
import { randomBetween, randomInt } from '../utils/random.js';

// --- Default configuration ---

/**
 * @typedef {Object} ParticleConfig
 * @property {number} [density=20000] - Area per particle (lower = more particles)
 * @property {number} [maxCount=50] - Maximum particle count
 * @property {number} [minCount=8] - Minimum particle count
 * @property {number} [connectionDistance=150] - Max distance to draw connections
 * @property {number} [driftSpeed=0.15] - Max velocity magnitude
 * @property {number[]} [hues=[265, 195, 330, 45]] - Color hues for particles
 * @property {number} [minSize=1.5] - Minimum particle radius
 * @property {number} [maxSize=3] - Maximum particle radius
 */

/** @type {ParticleConfig} */
const DEFAULTS = {
  density: 20000,
  maxCount: 50,
  minCount: 8,
  connectionDistance: 150,
  driftSpeed: 0.15,
  hues: [265, 195, 330, 45],
  minSize: 1.5,
  maxSize: 3,
};

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

/** @type {{ start: Function, stop: Function, destroy: Function, resize: Function }|null} */
let activeController = null;

/**
 * Reads CSS custom properties for particle config from the document.
 * Config object values take precedence over CSS values.
 * @param {ParticleConfig} config - User-provided config
 * @returns {ParticleConfig} Merged config
 */
function resolveConfig(config) {
  const styles = getComputedStyle(document.documentElement);

  // Read design tokens from CSS (fallback to DEFAULTS if not found)
  const cssMaxCount = parseInt(styles.getPropertyValue('--particle-max-count'), 10);
  const cssMinSize = parseFloat(styles.getPropertyValue('--particle-min-size'));
  const cssMaxSize = parseFloat(styles.getPropertyValue('--particle-max-size'));

  return {
    ...DEFAULTS,
    // CSS token overrides (if present and valid)
    ...(Number.isFinite(cssMaxCount) && { maxCount: cssMaxCount }),
    ...(Number.isFinite(cssMinSize) && { minSize: cssMinSize }),
    ...(Number.isFinite(cssMaxSize) && { maxSize: cssMaxSize }),
    // User config takes final precedence
    ...config,
  };
}

/**
 * Initializes the particle system on the given canvas element.
 *
 * Returns a controller object with start/stop/destroy/resize methods,
 * or `null` if initialization is skipped (viewport too small, reduced-motion,
 * or canvas context unavailable).
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to render into
 * @param {ParticleConfig} [config={}] - Configuration overrides
 * @returns {{ start: Function, stop: Function, destroy: Function, resize: Function }|null}
 */
export function initParticles(canvas, config = {}) {
  // Viewport gate: skip on viewports < 768px (Requirement 13.1)
  if (window.innerWidth < 768) return null;

  // Reduced-motion gate
  if (prefersReducedMotion()) return null;

  // Canvas 2D feature detection
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Resolve config: DEFAULTS → CSS tokens → user config
  const cfg = resolveConfig(config);

  // --- Internal state ---
  /** @type {Particle[]} */
  let particles = [];
  /** @type {number|null} */
  let rafId = null;
  /** @type {ResizeObserver|null} */
  let resizeObserver = null;
  /** @type {number} */
  let canvasWidth = 0;
  /** @type {number} */
  let canvasHeight = 0;
  /** @type {number} */
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  /** @type {boolean} */
  let destroyed = false;
  /** @type {(() => void)|null} */
  let motionUnsub = null;

  canvas.style.pointerEvents = 'none';

  // --- Helpers ---

  /**
   * Creates a particle with random properties within the current canvas bounds.
   * @returns {Particle}
   */
  function createParticle() {
    return {
      x: randomBetween(0, canvasWidth),
      y: randomBetween(0, canvasHeight),
      radius: randomBetween(cfg.minSize, cfg.maxSize),
      vx: randomBetween(-cfg.driftSpeed, cfg.driftSpeed),
      vy: randomBetween(-cfg.driftSpeed * 0.67, cfg.driftSpeed * 0.67),
      opacity: randomBetween(0.3, 0.7),
      hue: cfg.hues[randomInt(0, cfg.hues.length - 1)],
    };
  }

  /**
   * Computes target particle count based on canvas area and hardware.
   * Uses cfg.density (area per particle), capped between cfg.minCount and cfg.maxCount.
   * @param {number} width
   * @param {number} height
   * @returns {number}
   */
  function computeCount(width, height) {
    const area = width * height;
    let count = Math.floor(area / cfg.density);

    // Hardware scaling for low-end devices
    if (navigator.hardwareConcurrency != null && navigator.hardwareConcurrency < 4) {
      count = Math.floor(count / 2);
    }

    return Math.max(cfg.minCount, Math.min(cfg.maxCount, count));
  }

  /**
   * Updates positions and renders all particles + connections for one frame.
   */
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update positions with toroidal wrapping
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x += canvasWidth;
      else if (p.x > canvasWidth) p.x -= canvasWidth;
      if (p.y < 0) p.y += canvasHeight;
      else if (p.y > canvasHeight) p.y -= canvasHeight;
    }

    // Draw connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < cfg.connectionDistance) {
          const lineOpacity = (1 - dist / cfg.connectionDistance) * 0.25;
          ctx.beginPath();
          ctx.moveTo(a.x * dpr, a.y * dpr);
          ctx.lineTo(b.x * dpr, b.y * dpr);
          ctx.strokeStyle = `hsla(${a.hue}, 70%, 60%, ${lineOpacity})`;
          ctx.lineWidth = 0.5 * dpr;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x * dpr, p.y * dpr, p.radius * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.opacity})`;
      ctx.fill();
    }
  }

  /**
   * Animation loop — pauses when document is hidden.
   */
  function loop() {
    if (document.hidden || destroyed) {
      rafId = null;
      return;
    }
    render();
    rafId = requestAnimationFrame(loop);
  }

  /**
   * Handles visibility change — resume when tab becomes visible.
   */
  function handleVisibilityChange() {
    if (document.hidden || destroyed) return;
    start();
  }

  /**
   * Handles canvas resize via ResizeObserver.
   * @param {ResizeObserverEntry[]} entries
   */
  function handleResize(entries) {
    if (destroyed) return;
    const entry = entries[0];
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;
    applySize(width, height);
  }

  /**
   * Applies a new size to the canvas and adjusts particle count.
   * @param {number} width
   * @param {number} height
   */
  function applySize(width, height) {
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

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

    // Adjust particle count to match new area
    const targetCount = computeCount(canvasWidth, canvasHeight);
    if (particles.length > targetCount) {
      particles.length = targetCount;
    } else {
      while (particles.length < targetCount) {
        particles.push(createParticle());
      }
    }
  }

  // --- Initial sizing ---
  const parent = canvas.parentElement;
  if (parent) {
    const rect = parent.getBoundingClientRect();
    applySize(rect.width, rect.height);
  }

  // Create initial particles
  const count = computeCount(canvasWidth, canvasHeight);
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(createParticle());
  }

  // Set up ResizeObserver on parent element
  if (parent) {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(parent);
  }

  // Visibility change listener to pause/resume
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Listen for reduced-motion changes — stop if user enables it
  motionUnsub = onMotionChange((reduced) => {
    if (reduced) {
      stop();
    } else {
      start();
    }
  });

  // --- Controller methods ---

  /**
   * Start or resume the animation loop.
   */
  function start() {
    if (destroyed || prefersReducedMotion()) return;
    if (rafId == null) {
      rafId = requestAnimationFrame(loop);
    }
  }

  /**
   * Pause the animation loop.
   */
  function stop() {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  /**
   * Force a resize recalculation (e.g., after layout changes).
   */
  function resize() {
    if (destroyed) return;
    const el = canvas.parentElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    applySize(rect.width, rect.height);
  }

  /**
   * Full cleanup — stops loop, removes listeners, disconnects observer.
   */
  function destroyController() {
    destroyed = true;
    stop();

    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    document.removeEventListener('visibilitychange', handleVisibilityChange);

    if (motionUnsub) {
      motionUnsub();
      motionUnsub = null;
    }

    particles = [];

    if (activeController === controller) {
      activeController = null;
    }
  }

  const controller = {
    start,
    stop,
    destroy: destroyController,
    resize,
  };

  // Track active controller for module-level exports
  activeController = controller;

  // Start rendering
  start();

  return controller;
}

/**
 * Destroys the currently active particle system (if any).
 * Convenience export for module-level cleanup.
 */
export function destroy() {
  if (activeController) {
    activeController.destroy();
  }
}

/**
 * Pauses the currently active particle system (if any).
 * Convenience export for module-level control.
 */
export function pause() {
  if (activeController) {
    activeController.stop();
  }
}

/**
 * Resumes the currently active particle system (if any).
 * Convenience export for module-level control.
 */
export function resume() {
  if (activeController) {
    activeController.start();
  }
}
