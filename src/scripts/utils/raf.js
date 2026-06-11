/**
 * requestAnimationFrame scheduler with batched reads/writes.
 *
 * Batches DOM reads and writes into separate phases each frame to avoid
 * layout thrashing. All scheduled reads execute first, then all writes,
 * ensuring the browser only recalculates layout once per frame.
 *
 * Usage:
 *   import { scheduleRead, scheduleWrite, start, stop } from './raf.js';
 *
 *   start();
 *   scheduleRead(() => { const h = el.offsetHeight; });
 *   scheduleWrite(() => { el.style.transform = '...'; });
 */

/** @type {Array<() => void>} */
let reads = [];

/** @type {Array<() => void>} */
let writes = [];

/** @type {number | null} */
let frameId = null;

/** Whether the loop is currently running */
let running = false;

/**
 * The core loop — executes all reads, then all writes, then requests
 * the next frame if the scheduler is still running.
 */
function tick() {
  // Drain reads
  const currentReads = reads;
  reads = [];
  for (let i = 0; i < currentReads.length; i++) {
    currentReads[i]();
  }

  // Drain writes
  const currentWrites = writes;
  writes = [];
  for (let i = 0; i < currentWrites.length; i++) {
    currentWrites[i]();
  }

  // Continue loop if running
  if (running) {
    frameId = requestAnimationFrame(tick);
  }
}

/**
 * Schedule a DOM read callback for the next frame's read phase.
 * @param {() => void} fn - Callback that reads from the DOM
 */
export function scheduleRead(fn) {
  reads.push(fn);
  // If the loop isn't running, do a one-shot frame
  if (!running && frameId === null) {
    frameId = requestAnimationFrame(flush);
  }
}

/**
 * Schedule a DOM write callback for the next frame's write phase.
 * @param {() => void} fn - Callback that writes to the DOM
 */
export function scheduleWrite(fn) {
  writes.push(fn);
  // If the loop isn't running, do a one-shot frame
  if (!running && frameId === null) {
    frameId = requestAnimationFrame(flush);
  }
}

/**
 * One-shot flush for when the loop is not running.
 * Executes pending reads and writes in a single frame.
 */
function flush() {
  frameId = null;

  const currentReads = reads;
  reads = [];
  for (let i = 0; i < currentReads.length; i++) {
    currentReads[i]();
  }

  const currentWrites = writes;
  writes = [];
  for (let i = 0; i < currentWrites.length; i++) {
    currentWrites[i]();
  }
}

/**
 * Start the continuous rAF loop.
 * While running, reads and writes are batched every frame automatically.
 */
export function start() {
  if (running) return;
  running = true;
  frameId = requestAnimationFrame(tick);
}

/**
 * Stop the continuous rAF loop.
 * Pending reads/writes scheduled before stop() will still execute
 * via one-shot mode on the next frame.
 */
export function stop() {
  running = false;
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
}

/**
 * Returns whether the scheduler loop is currently active.
 * @returns {boolean}
 */
export function isRunning() {
  return running;
}

/**
 * Clear all pending callbacks without executing them.
 * Useful for cleanup/teardown.
 */
export function clear() {
  reads = [];
  writes = [];
}
