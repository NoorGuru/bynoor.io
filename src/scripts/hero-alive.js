/**
 * Living hero — pointer-reactive aurora + scroll-linked hero content.
 * Desktop only: touch devices get a fully static hero (no loops, no
 * listeners) because every per-frame cost — JS, repaints, re-blurs —
 * lands hardest on phone GPUs during scroll.
 *
 * Two depth layers, both compositor-only (transform/opacity), both driven
 * directly from live input so they stay interruptible — reversing the
 * scroll or pointer reverses the motion with no seam:
 * - Aurora drifts toward the pointer (lerped) and lags scroll for depth.
 * - Hero content parallaxes slower than the page, settles slightly smaller,
 *   and fades as it leaves — purely from current scrollY, no timeline.
 *
 * The loop is on-demand, never perpetual: a frame is scheduled only when
 * input arrives (pointermove, scroll, resize) and the loop sleeps again as
 * soon as the pointer lerp settles and scrollY stops changing. The loop
 * also pauses off-screen and never runs under prefers-reduced-motion.
 * Writes are skipped when nothing moved.
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
const SETTLE_EPSILON = 0.0005; // below this the pointer lerp snaps + sleeps

let activeCleanup = null;

export function initHeroAlive() {
  // Tear down any previous instance so a double-init (dev/HMR, tests)
  // can never stack duplicate loops or scroll listeners.
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
  if (prefersReducedMotion()) return;
  // Touch devices: hero stays fully static. No rAF loop, no scroll or
  // pointer listeners — nothing to compete with the scroll gesture.
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  const hero = document.getElementById('hero');
  const content = hero ? hero.querySelector('.hero__content') : null;
  const shift = hero ? hero.querySelector('.hero__aurora-shift') : null;
  if (!hero || !content || !shift) return;

  let heroVisible = true;
  let raf = null;
  let heroH = 1;
  let lastY = typeof window.scrollY === 'number' ? window.scrollY : 0;
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let lastWritten = '';

  function refreshHeroH() {
    heroH = hero.getBoundingClientRect().height || 1;
  }

  function requestFrame() {
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

  function onPointerMove(e) {
    // Normalized against the viewport — no layout reads on pointermove.
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
    requestFrame();
  }

  function onScroll() {
    requestFrame();
  }

  function onResize() {
    refreshHeroH();
    requestFrame();
  }

  function frame() {
    raf = null;

    cx += (tx - cx) * LERP;
    cy += (ty - cy) * LERP;
    if (Math.abs(tx - cx) < SETTLE_EPSILON) cx = tx;
    if (Math.abs(ty - cy) < SETTLE_EPSILON) cy = ty;

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

    if (y !== lastY || cx !== tx || cy !== ty) {
      lastY = y;
      requestFrame();
    } else {
      lastY = y;
    }
  }

  hero.addEventListener('pointermove', onPointerMove, { passive: true });

  refreshHeroH();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) {
          refreshHeroH();
          requestFrame();
        } else {
          stopLoop();
        }
      },
      { threshold: 0 }
    );
    observer.observe(hero);
  }

  function onVisibilityChange() {
    if (document.hidden) stopLoop();
    else requestFrame();
  }

  requestFrame();

  document.addEventListener('visibilitychange', onVisibilityChange);

  activeCleanup = () => {
    stopLoop();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    hero.removeEventListener('pointermove', onPointerMove);
    if (observer) observer.disconnect();
  };
}
