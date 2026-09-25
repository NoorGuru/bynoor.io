/**
 * Scroll Progress Bar
 * Shows a fixed gradient bar at the top of the page indicating scroll percentage.
 * Sets --scroll-progress CSS custom property on the progress element.
 * Uses requestAnimationFrame to batch DOM writes for performance.
 */

/**
 * Initializes the scroll progress indicator.
 * Listens to scroll events (passive) and updates --scroll-progress
 * on the .scroll-progress element.
 */
export function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) return;

  let ticking = false;
  // scrollHeight forces layout — cache it and recompute at most once per
  // second (plus on resize) instead of on every scroll frame.
  let cachedMaxScroll = -1;
  let lastMeasured = 0;
  const MEASURE_TTL_MS = 1000;

  function getMaxScroll() {
    const now = Date.now();
    if (cachedMaxScroll < 0 || now - lastMeasured > MEASURE_TTL_MS) {
      cachedMaxScroll =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      lastMeasured = now;
    }
    return cachedMaxScroll;
  }

  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = getMaxScroll();

    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    const clampedProgress = Math.min(Math.max(progress, 0), 1);

    progressBar.style.setProperty('--scroll-progress', clampedProgress);
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }

  function onResize() {
    cachedMaxScroll = -1;
    onScroll();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  // Set initial progress on load
  updateProgress();
}
