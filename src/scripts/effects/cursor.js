/**
 * MagneticCursor — unified custom cursor with lerp-smoothed positioning,
 * magnetic pull toward [data-magnetic] elements, shape morphing states,
 * and touch/reduced-motion/breakpoint auto-disable.
 *
 * Combines and enhances the previous custom-cursor.js and magnetic-elements.js
 * into a single class-based module.
 */

import { lerp } from '../utils/lerp.js';
import { prefersReducedMotion, onMotionPreferenceChange } from '../utils/reduced-motion.js';
import { onBreakpointChange } from '../utils/breakpoints.js';

const DEFAULTS = {
  ringLerp: 0.15,
  dotLerp: 0.3,
  magneticThreshold: 80,
  desktopBreakpoint: 1024,
  textSelector: 'p, span, blockquote, li',
  actionSelector: 'a, button, [role="button"], .link-card, .project-card, [data-magnetic]',
};

/**
 * @typedef {Object} CursorOptions
 * @property {number} [ringLerp] - Lerp factor for outer ring (default 0.15)
 * @property {number} [dotLerp] - Lerp factor for inner dot (default 0.3)
 * @property {number} [magneticThreshold] - Proximity threshold in px (default 80)
 * @property {number} [desktopBreakpoint] - Min viewport width to activate (default 1024)
 * @property {string} [textSelector] - CSS selector for text-morph state
 * @property {string} [actionSelector] - CSS selector for action-morph state
 */

export class MagneticCursor {
  /**
   * @param {CursorOptions} [options]
   */
  constructor(options = {}) {
    this.config = { ...DEFAULTS, ...options };

    // Position state
    this.targetX = 0;
    this.targetY = 0;
    this.ringX = 0;
    this.ringY = 0;
    this.dotX = 0;
    this.dotY = 0;

    // DOM references
    this.container = null;
    this.ring = null;
    this.dot = null;
    this.label = null;

    // Runtime flags
    this._active = false;
    this._rafId = null;
    this._isDesktop = false;
    this._isReducedMotion = false;
    this._isPointerDevice = false;
    this._currentState = 'default';

    // Bound handlers (stored for cleanup)
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseDown = this._handleMouseDown.bind(this);
    this._onMouseUp = this._handleMouseUp.bind(this);
    this._onMouseOver = this._handleMouseOver.bind(this);
    this._onMouseOut = this._handleMouseOut.bind(this);
    this._onMouseEnter = this._handleDocMouseEnter.bind(this);
    this._onMouseLeave = this._handleDocMouseLeave.bind(this);

    // Cleanup functions for breakpoint/motion listeners
    this._cleanupBreakpoint = null;
    this._cleanupMotion = null;
    this._cleanupPointer = null;
  }

  /**
   * Initialize the cursor system. Creates DOM elements, attaches event
   * listeners, and starts the rAF loop if conditions are met.
   */
  init() {
    // Touch device detection — only activate for pointer devices
    const pointerMql = window.matchMedia('(hover: hover) and (pointer: fine)');
    this._isPointerDevice = pointerMql.matches;

    const pointerHandler = (e) => {
      this._isPointerDevice = e.matches;
      this._evaluate();
    };
    pointerMql.addEventListener('change', pointerHandler);
    this._cleanupPointer = () => pointerMql.removeEventListener('change', pointerHandler);

    // Breakpoint detection
    const bpMql = window.matchMedia(`(min-width: ${this.config.desktopBreakpoint}px)`);
    this._isDesktop = bpMql.matches;

    const bpHandler = (e) => {
      this._isDesktop = e.matches;
      this._evaluate();
    };
    bpMql.addEventListener('change', bpHandler);
    this._cleanupBreakpoint = () => bpMql.removeEventListener('change', bpHandler);

    // Reduced motion detection
    const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._isReducedMotion = motionMql.matches;

    const motionHandler = (e) => {
      this._isReducedMotion = e.matches;
      this._evaluate();
    };
    motionMql.addEventListener('change', motionHandler);
    this._cleanupMotion = () => motionMql.removeEventListener('change', motionHandler);

    // Initial evaluation
    this._evaluate();
  }

  /**
   * Fully cleans up the cursor — removes DOM, cancels rAF, removes all
   * event listeners. Leaves zero listeners on document/window.
   */
  destroy() {
    this._deactivate();

    // Remove media query listeners
    if (this._cleanupBreakpoint) {
      this._cleanupBreakpoint();
      this._cleanupBreakpoint = null;
    }
    if (this._cleanupMotion) {
      this._cleanupMotion();
      this._cleanupMotion = null;
    }
    if (this._cleanupPointer) {
      this._cleanupPointer();
      this._cleanupPointer = null;
    }
  }

  // --- Private Methods ---

  /**
   * Decides whether to activate or deactivate based on current conditions.
   */
  _evaluate() {
    if (this._isDesktop && this._isPointerDevice && !this._isReducedMotion) {
      this._activate();
    } else {
      this._deactivate();
    }
  }

  /**
   * Creates DOM elements, attaches event listeners, starts rAF loop.
   */
  _activate() {
    if (this._active) return;
    this._active = true;

    // Create DOM structure
    this.container = document.createElement('div');
    this.container.classList.add('cursor');
    this.container.setAttribute('aria-hidden', 'true');

    this.ring = document.createElement('div');
    this.ring.classList.add('cursor__ring');

    this.dot = document.createElement('div');
    this.dot.classList.add('cursor__dot');

    this.label = document.createElement('div');
    this.label.classList.add('cursor__label');

    this.container.appendChild(this.ring);
    this.container.appendChild(this.dot);
    this.container.appendChild(this.label);
    document.body.appendChild(this.container);

    // Add active class to html element
    document.documentElement.classList.add('cursor-active');

    // Attach event listeners
    document.addEventListener('mousemove', this._onMouseMove, { passive: true });
    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('mouseover', this._onMouseOver, { passive: true });
    document.addEventListener('mouseout', this._onMouseOut, { passive: true });
    document.addEventListener('mouseenter', this._onMouseEnter);
    document.addEventListener('mouseleave', this._onMouseLeave);

    // Start animation loop
    this._rafId = requestAnimationFrame(this._tick.bind(this));
  }

  /**
   * Removes DOM, cancels rAF, detaches document-level event listeners.
   */
  _deactivate() {
    if (!this._active) return;
    this._active = false;

    // Cancel animation loop
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    // Remove event listeners
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('mouseover', this._onMouseOver);
    document.removeEventListener('mouseout', this._onMouseOut);
    document.removeEventListener('mouseenter', this._onMouseEnter);
    document.removeEventListener('mouseleave', this._onMouseLeave);

    // Remove DOM
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.ring = null;
      this.dot = null;
      this.label = null;
    }

    // Remove active class from html
    document.documentElement.classList.remove('cursor-active');

    // Reset state
    this._setState('default');
    this.targetX = 0;
    this.targetY = 0;
    this.ringX = 0;
    this.ringY = 0;
    this.dotX = 0;
    this.dotY = 0;
  }

  /**
   * rAF loop — lerps ring/dot positions, applies magnetic pull.
   */
  _tick() {
    if (!this._active) return;

    // Compute effective target with magnetic pull
    let effectiveX = this.targetX;
    let effectiveY = this.targetY;

    const magneticElements = document.querySelectorAll('[data-magnetic]');
    for (const el of magneticElements) {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = centerX - this.targetX;
      const dy = centerY - this.targetY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.config.magneticThreshold) {
        // Exponential decay strength — closer = stronger pull
        const strength = 1 - distance / this.config.magneticThreshold;
        effectiveX += dx * strength;
        effectiveY += dy * strength;
        break; // Only pull toward closest qualifying element
      }
    }

    // Lerp positions
    this.ringX = lerp(this.ringX, effectiveX, this.config.ringLerp);
    this.ringY = lerp(this.ringY, effectiveY, this.config.ringLerp);
    this.dotX = lerp(this.dotX, effectiveX, this.config.dotLerp);
    this.dotY = lerp(this.dotY, effectiveY, this.config.dotLerp);

    // Apply transforms
    if (this.ring) {
      this.ring.style.transform = `translate(${this.ringX}px, ${this.ringY}px) translate(-50%, -50%)`;
    }
    if (this.dot) {
      this.dot.style.transform = `translate(${this.dotX}px, ${this.dotY}px) translate(-50%, -50%)`;
    }
    if (this.label) {
      this.label.style.transform = `translate(${this.ringX}px, ${this.ringY}px) translate(-50%, -50%)`;
    }

    this._rafId = requestAnimationFrame(this._tick.bind(this));
  }

  // --- Event Handlers ---

  /** @param {MouseEvent} e */
  _handleMouseMove(e) {
    this.targetX = e.clientX;
    this.targetY = e.clientY;
  }

  _handleMouseDown() {
    if (!this.container) return;
    this.container.classList.add('cursor--click');
  }

  _handleMouseUp() {
    if (!this.container) return;
    this.container.classList.remove('cursor--click');
  }

  /** @param {MouseEvent} e */
  _handleMouseOver(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    if (!target || !target.closest) return;

    // Check action elements first (higher priority)
    const actionEl = target.closest(this.config.actionSelector);
    if (actionEl) {
      this._setState('action');
      this._setLabel(actionEl);
      return;
    }

    // Check text elements (only if not inside an interactive element)
    const textEl = target.closest(this.config.textSelector);
    if (textEl && !textEl.closest(this.config.actionSelector)) {
      this._setState('text');
      return;
    }
  }

  /** @param {MouseEvent} e */
  _handleMouseOut(e) {
    const relatedTarget = /** @type {HTMLElement} */ (e.relatedTarget);

    // If moving to another element, let mouseover handle the new state
    if (relatedTarget && relatedTarget.closest) {
      const stillInAction = relatedTarget.closest(this.config.actionSelector);
      const stillInText = relatedTarget.closest(this.config.textSelector);
      if (stillInAction || stillInText) return;
    }

    this._setState('default');
  }

  _handleDocMouseEnter() {
    if (this.container) {
      this.container.style.opacity = '1';
    }
  }

  _handleDocMouseLeave() {
    if (this.container) {
      this.container.style.opacity = '0';
    }
  }

  // --- State Management ---

  /**
   * Sets the cursor shape state via CSS class.
   * @param {'default' | 'text' | 'action' | 'click'} state
   */
  _setState(state) {
    if (this._currentState === state) return;

    // Remove previous state class
    if (this.container && this._currentState !== 'default') {
      this.container.classList.remove(`cursor--${this._currentState}`);
    }

    this._currentState = state;

    // Add new state class
    if (this.container && state !== 'default') {
      this.container.classList.add(`cursor--${state}`);
    }

    // Clear label when not in action state
    if (state !== 'action' && this.label) {
      this.label.textContent = '';
    }
  }

  /**
   * Sets the label text based on the hovered element type.
   * @param {Element} el
   */
  _setLabel(el) {
    if (!this.label) return;

    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute('role');

    if (el.classList.contains('project-card') || el.classList.contains('link-card')) {
      this.label.textContent = 'View';
    } else if (tag === 'a') {
      this.label.textContent = 'Open';
    } else if (tag === 'button' || role === 'button') {
      this.label.textContent = 'Click';
    } else {
      this.label.textContent = 'View';
    }
  }
}

/**
 * Convenience function — creates and initializes a MagneticCursor instance.
 * @param {CursorOptions} [options]
 * @returns {MagneticCursor}
 */
export function initCursor(options) {
  const cursor = new MagneticCursor(options);
  cursor.init();
  return cursor;
}
