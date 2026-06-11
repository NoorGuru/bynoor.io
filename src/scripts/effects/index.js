/**
 * effects/ — Visual effects and atmospheric layers
 *
 * Modules:
 * - ambient.js      → Gradient orbs, color shifts
 * - grain.js        → Film grain overlay
 * - glow.js         → Cursor-following glows
 * - cursor.js       → Magnetic cursor
 * - particles.js    → Canvas particle system
 * - kinetic-type.js → Text splitting + animation triggers
 */

export { initGlow, destroy as destroyGlow } from './glow.js';
