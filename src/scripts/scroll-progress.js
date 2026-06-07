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

  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

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

  window.addEventListener('scroll', onScroll, { passive: true });

  // Set initial progress on load
  updateProgress();
}
