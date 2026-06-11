/**
 * Procedural Film Grain Overlay
 * -----------------------------
 * Generates a 256×256 canvas of random noise, converts it to a data URL,
 * and applies it as a repeating background on the `.grain-overlay` element.
 * Re-renders at 10fps for a filmic flickering appearance.
 *
 * Respects `prefers-reduced-motion` — renders a single static frame when
 * the user prefers reduced motion.
 *
 * @module effects/grain
 * @see Requirements 8.2
 */

import { prefersReducedMotion, onChange } from '../utils/motion.js';

/** Canvas dimensions for noise texture */
const CANVAS_SIZE = 256;

/** Interval in ms between noise frames (~10fps) */
const FRAME_INTERVAL = 100;

/** @type {HTMLElement | null} */
let grainEl = null;

/** @type {HTMLCanvasElement | null} */
let canvas = null;

/** @type {CanvasRenderingContext2D | null} */
let ctx = null;

/** @type {number | null} */
let intervalId = null;

/** @type {(() => void) | null} */
let unsubscribeMotion = null;

/**
 * Generate random noise on the offscreen canvas and return a data URL.
 * Each pixel is assigned a random grayscale value with full opacity.
 * @returns {string} data URL of the noise texture
 */
function renderNoise() {
  const imageData = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
  const data = imageData.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const value = (Math.random() * 256) | 0;
    data[i] = value;       // R
    data[i + 1] = value;   // G
    data[i + 2] = value;   // B
    data[i + 3] = 255;     // A
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Apply a fresh noise frame to the grain overlay element.
 */
function applyFrame() {
  if (!grainEl) return;
  const dataUrl = renderNoise();
  grainEl.style.backgroundImage = `url(${dataUrl})`;
}

/**
 * Start the animation loop (re-render noise at 10fps).
 */
function startAnimation() {
  stopAnimation();
  applyFrame();
  intervalId = setInterval(applyFrame, FRAME_INTERVAL);
}

/**
 * Stop the animation loop.
 */
function stopAnimation() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/**
 * Handle motion preference changes.
 * @param {boolean} reduced — true if user prefers reduced motion
 */
function handleMotionChange(reduced) {
  if (reduced) {
    stopAnimation();
    // Render one static frame
    applyFrame();
  } else {
    startAnimation();
  }
}

/**
 * Initialize the grain overlay effect.
 * Finds the `.grain-overlay` element, creates an offscreen canvas,
 * and begins rendering noise frames.
 */
export function initGrain() {
  grainEl = document.querySelector('.grain-overlay');
  if (!grainEl) return;

  // Create offscreen canvas for noise generation
  canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  ctx = canvas.getContext('2d');

  // Render based on motion preference
  if (prefersReducedMotion()) {
    applyFrame();
  } else {
    startAnimation();
  }

  // Listen for motion preference changes
  unsubscribeMotion = onChange(handleMotionChange);
}

/**
 * Clean up the grain effect — stop animation, remove references.
 */
export function destroy() {
  stopAnimation();

  if (unsubscribeMotion) {
    unsubscribeMotion();
    unsubscribeMotion = null;
  }

  if (grainEl) {
    grainEl.style.backgroundImage = '';
    grainEl = null;
  }

  canvas = null;
  ctx = null;
}
