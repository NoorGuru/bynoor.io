/**
 * Living hero — pointer-reactive aurora + scroll-linked hero content.
 *
 * Two depth layers, both compositor-only (transform/opacity), both driven
 * directly from live input every frame so they stay interruptible —
 * reversing the scroll or pointer reverses the motion with no seam:
 * - Aurora drifts toward the pointer (lerped) and lags scroll for depth.
 * - Hero content parallaxes slower than the page, settles slightly smaller,
 *   and fades as it leaves — purely from current scrollY, no timeline.
 *
 * The loop runs only while the hero is on-screen and never under
 * prefers-reduced-motion. Writes are skipped when nothing moved.
 */

import { prefersReducedMotion } from './utils/reduced-motion.js';

const POINTER_RANGE_X = 64; // px max aurora pull toward pointer
const POINTER_RANGE_Y = 40;
const AURORA_SCROLL_FACTOR = 0.12; // aurora scroll lag (depth vs content)
const CONTENT_SCROLL_FACTOR = 0.35; // content scroll lag (depth vs page)
const CONTENT_MIN_SCALE = 0.94;
const CONTENT_END_OPACITY = 0.05;
const CONTENT_TILT_X = 3; // deg max content tilt toward pointer
const CONTENT_TILT_Y = 4;
const LERP = 0.08;

export function initHeroAlive() {
  if (prefersReducedMotion()) return;

  const hero = document.getElementById('hero');
  const content = hero ? hero.querySelector('.hero__content') : null;
  const shift = hero ? hero.querySelector('.hero__aurora-shift') : null;
  if (!hero || !content || !shift) return;

  const canHover = window.matchMedia('(hover: hover)').matches;

  let heroVisible = true;
  let raf = null;
  let heroH = 1;
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let lastWritten = '';

  function refreshHeroH() {
    heroH = hero.getBoundingClientRect().height || 1;
  }

  function onPointerMove(e) {
    // Normalized against the viewport — no layout reads on pointermove.
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  }

  function startLoop() {
    if (raf == null && heroVisible && !document.hidden) {
      raf = requestAnimationFrame(frame);
    }
  }

  function stopLoop() {
    if (raf != null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  function frame() {
    raf = null;

    cx += (tx - cx) * LERP;
    cy += (ty - cy) * LERP;

    const y = window.scrollY || 0;
    const p = Math.min(Math.max(y / heroH, 0), 1);

    const ax = cx * POINTER_RANGE_X;
    const ay = cy * POINTER_RANGE_Y + y * AURORA_SCROLL_FACTOR;
    const scale = 1 - p * (1 - CONTENT_MIN_SCALE);
    const opacity = 1 - p * p * (1 - CONTENT_END_OPACITY);
    const rx = (-cy * CONTENT_TILT_X).toFixed(2);
    const ry = (cx * CONTENT_TILT_Y).toFixed(2);

    const key = `${ax.toFixed(2)}|${ay.toFixed(2)}|${scale.toFixed(4)}|${opacity.toFixed(3)}|${rx}|${ry}`;
    if (key !== lastWritten) {
      lastWritten = key;
      shift.style.transform = `translate3d(${ax.toFixed(2)}px, ${ay.toFixed(2)}px, 0)`;
      content.style.transform =
        `translate3d(0, ${(y * CONTENT_SCROLL_FACTOR).toFixed(1)}px, 0) perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale.toFixed(4)})`;
      content.style.opacity = opacity.toFixed(3);
    }

    startLoop();
  }

  if (canHover) {
    hero.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  refreshHeroH();
  window.addEventListener('resize', refreshHeroH);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) {
          refreshHeroH();
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0 }
    ).observe(hero);
  }

  startLoop();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else startLoop();
  });
}
