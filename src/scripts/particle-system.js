/**
 * Canvas-based constellation effect for the hero section background.
 * Renders nodes connected by lines when within proximity, creating
 * a techy geometric network that drifts slowly.
 */

import { prefersReducedMotion } from './utils/reduced-motion.js';
import { isAbove } from './utils/breakpoints.js';
import { randomBetween, randomInt } from './utils/random.js';

/** Accent palette hue angles (violet, cyan, magenta, amber) */
const ACCENT_HUES = [265, 195, 330, 45];

/** Maximum distance between nodes to draw a connecting line */
const CONNECTION_DISTANCE = 150;

/** @type {Node[]} */
let nodes = [];
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
 * @typedef {Object} Node
 * @property {number} x
 * @property {number} y
 * @property {number} radius
 * @property {number} vx
 * @property {number} vy
 * @property {number} opacity
 * @property {number} hue
 */

/**
 * Creates a node with random properties within the current canvas bounds.
 * @returns {Node}
 */
function createNode() {
  return {
    x: randomBetween(0, canvasWidth),
    y: randomBetween(0, canvasHeight),
    radius: randomBetween(1.5, 3),
    vx: randomBetween(-0.15, 0.15),
    vy: randomBetween(-0.1, 0.1),
    opacity: randomBetween(0.3, 0.7),
    hue: ACCENT_HUES[randomInt(0, ACCENT_HUES.length - 1)],
  };
}

/**
 * Computes the target node count based on canvas area and hardware.
 * @param {number} width - Logical canvas width
 * @param {number} height - Logical canvas height
 * @returns {number}
 */
function computeNodeCount(width, height) {
  const area = width * height;
  let count = Math.min(40, Math.floor(area / 20000));
  if (navigator.hardwareConcurrency != null && navigator.hardwareConcurrency < 4) {
    count = Math.floor(count / 2);
  }
  return Math.max(count, 8);
}

/**
 * Updates and draws all nodes and their connections for one frame.
 */
function render() {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update positions
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    n.x += n.vx;
    n.y += n.vy;

    // Toroidal wrapping
    if (n.x < 0) n.x += canvasWidth;
    else if (n.x > canvasWidth) n.x -= canvasWidth;
    if (n.y < 0) n.y += canvasHeight;
    else if (n.y > canvasHeight) n.y -= canvasHeight;
  }

  // Draw connections between nearby nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONNECTION_DISTANCE) {
        const lineOpacity = (1 - dist / CONNECTION_DISTANCE) * 0.25;
        ctx.beginPath();
        ctx.moveTo(a.x * dpr, a.y * dpr);
        ctx.lineTo(b.x * dpr, b.y * dpr);
        ctx.strokeStyle = `hsla(${a.hue}, 70%, 60%, ${lineOpacity})`;
        ctx.lineWidth = 0.5 * dpr;
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    ctx.beginPath();
    ctx.arc(n.x * dpr, n.y * dpr, n.radius * dpr, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${n.hue}, 80%, 65%, ${n.opacity})`;
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
  if (document.hidden) return;
  startLoop();
}

/**
 * Handles scroll to fade constellation container opacity.
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

  canvasWidth = width;
  canvasHeight = height;

  // Clamp existing nodes to new bounds
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.x > canvasWidth) n.x = canvasWidth - 1;
    if (n.y > canvasHeight) n.y = canvasHeight - 1;
    if (n.x < 0) n.x = 0;
    if (n.y < 0) n.y = 0;
  }

  // Adjust node count if canvas grew/shrank significantly
  const targetCount = computeNodeCount(canvasWidth, canvasHeight);
  if (nodes.length > targetCount) {
    nodes.length = targetCount;
  } else {
    while (nodes.length < targetCount) {
      nodes.push(createNode());
    }
  }
}

/**
 * Initializes the constellation system on the given canvas element.
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

  // Create nodes
  const count = computeNodeCount(canvasWidth, canvasHeight);
  nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push(createNode());
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
 * Destroys the constellation system and cleans up all resources.
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

  nodes = [];
  canvas = null;
  ctx = null;
  canvasWidth = 0;
  canvasHeight = 0;
}
