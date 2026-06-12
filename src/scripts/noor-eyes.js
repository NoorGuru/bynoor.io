/**
 * NOOR Eyes — Googly eyes on the OO.
 * 
 * Injects a white circle with a dark pupil into each O character span.
 * The pupil follows the cursor with spring physics.
 * Periodic blinks and occasional winks.
 * 
 * Respects prefers-reduced-motion.
 */

export function initNoorEyes() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const oChars = document.querySelectorAll('.hero__o-char');
  if (oChars.length !== 2) return;

  const hasHover = window.matchMedia('(hover: hover)').matches;

  // Inject eye elements into each O
  const eyes = [];
  const pupils = [];

  oChars.forEach((o) => {
    const eye = document.createElement('span');
    eye.className = 'hero__googly';
    eye.setAttribute('aria-hidden', 'true');

    const pupil = document.createElement('span');
    pupil.className = 'hero__googly-pupil';
    eye.appendChild(pupil);
    o.appendChild(eye);

    eyes.push(eye);
    pupils.push(pupil);
  });

  // --- State ---
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let raf = null;

  const state = [
    { x: 0, y: 0, vx: 0, vy: 0 },
    { x: 0, y: 0, vx: 0, vy: 0 },
  ];

  const SPRING = 0.07;
  const DAMPING = 0.74;
  const MAX_MOVE = 28; // % of pupil travel from center

  function onMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function tick() {
    eyes.forEach((eye, i) => {
      const rect = eye.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.hypot(dx, dy);

      const strength = Math.min(dist / 250, 1);
      const tx = dist > 0 ? (dx / dist) * strength * MAX_MOVE : 0;
      const ty = dist > 0 ? (dy / dist) * strength * MAX_MOVE : 0;

      const ax = (tx - state[i].x) * SPRING;
      const ay = (ty - state[i].y) * SPRING;
      state[i].vx = (state[i].vx + ax) * DAMPING;
      state[i].vy = (state[i].vy + ay) * DAMPING;
      state[i].x += state[i].vx;
      state[i].y += state[i].vy;

      pupils[i].style.transform =
        `translate(calc(-50% + ${state[i].x}%), calc(-50% + ${state[i].y}%))`;
    });

    raf = requestAnimationFrame(tick);
  }

  // --- Blink ---
  function blink(index) {
    const el = eyes[index];
    if (!el) return;
    el.classList.add('hero__googly--blink');
    setTimeout(() => el.classList.remove('hero__googly--blink'), 120);
  }

  function blinkBoth() { blink(0); blink(1); }
  function wink() { blink(Math.random() < 0.5 ? 0 : 1); }

  function schedule() {
    const delay = 2500 + Math.random() * 3500;
    setTimeout(() => {
      const r = Math.random();
      if (r < 0.7) blinkBoth();
      else if (r < 0.85) { blinkBoth(); setTimeout(blinkBoth, 200); }
      else wink();
      schedule();
    }, delay);
  }

  // --- Mobile ---
  function startWander() {
    let t = 0;
    (function loop() {
      t += 0.005;
      mouseX = window.innerWidth / 2 + Math.sin(t * 1.3) * 200;
      mouseY = window.innerHeight * 0.4 + Math.cos(t) * 80;
      requestAnimationFrame(loop);
    })();
  }

  // --- Go ---
  if (hasHover) {
    document.addEventListener('mousemove', onMove, { passive: true });
  } else {
    startWander();
  }

  raf = requestAnimationFrame(tick);

  setTimeout(() => { blinkBoth(); setTimeout(schedule, 600); }, 2000);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf) { raf = requestAnimationFrame(tick); }
  });
}
