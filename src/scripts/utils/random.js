/**
 * Returns a random float in [min, max).
 * @param {number} min - Lower bound (inclusive)
 * @param {number} max - Upper bound (exclusive)
 * @returns {number}
 */
export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Returns a random integer in [min, max] (inclusive both ends).
 * @param {number} min - Lower bound (inclusive)
 * @param {number} max - Upper bound (inclusive)
 * @returns {number}
 */
export function randomInt(min, max) {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}
