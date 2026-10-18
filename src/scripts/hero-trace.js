/**
 * Hero trace — the mono caption under the headline counts the sentence in.
 *
 * The reveal itself is CSS (see .hero__w / .hero__phrase / .hero__trace in
 * home.css), so the headline still assembles with JS disabled and stays fully
 * visible under reduced motion. This module only swaps the caption copy while
 * the beats land, then settles it on the final state. It never touches layout.
 */

export function initHeroTrace() {
  const strip = document.querySelector('[data-hero-trace-status]');
  const label = document.querySelector('[data-trace-label]');
  const root = document.querySelector('[data-hero-trace]');
  if (!strip || !label || !root) return;

  const FINAL = 'done · weeks → hrs';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    label.textContent = FINAL;
    strip.classList.add('is-done');
    return;
  }

  // Beats mirror the CSS delays in home.css: five words every 56ms from 110ms,
  // then the brass phrase at 720ms. Each caption update lands as its beat settles.
  const words = Array.from(root.querySelectorAll('.hero__w:not(.hero__w--period)'));
  const phrase = root.querySelector('.hero__phrase');
  const beats = [
    ...words.map((_, index) => 110 + index * 56 + 380),
    ...(phrase ? [720 + 320] : []),
  ];

  beats.forEach((at, index) => {
    window.setTimeout(() => {
      label.textContent = `${String(index + 1).padStart(2, '0')} / ${String(beats.length).padStart(2, '0')}`;
    }, at);
  });

  window.setTimeout(() => {
    label.textContent = FINAL;
    strip.classList.add('is-done');
  }, 1800);
}
