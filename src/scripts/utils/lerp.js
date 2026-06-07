/**
 * Linearly interpolates between two values.
 * @param {number} current - The start value
 * @param {number} target - The end value
 * @param {number} factor - The interpolation factor (0–1)
 * @returns {number} The interpolated value
 */
export function lerp(current, target, factor) {
  return current + (target - current) * factor;
}
