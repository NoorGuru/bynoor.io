/**
 * Easter Egg Engine
 * 
 * Hidden interactions for delightful discovery:
 * - Konami Code (↑↑↓↓←→←→BA) → confetti burst
 * - Logo multi-click (7 clicks within 3s) → Matrix rain effect
 *
 * Requirements: 10.4, 10.5
 */

// Konami code sequence
const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
];

// Confetti colors from the accent palette
const CONFETTI_COLORS = [
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#d946ef', // magenta
  '#f59e0b'  // gold
];

const LOGO_CLICK_THRESHOLD = 7;
const LOGO_CLICK_TIMEOUT = 3000; // 3 seconds window
const MATRIX_DURATION = 3000;    // 3 seconds display

// State
let konamiProgress = [];
let logoClickCount = 0;
let logoClickTimer = null;
let activeCanvases = [];
let keydownHandler = null;
let logoClickHandler = null;
let logoElement = null;

/**
 * Initialize all easter eggs
 */
export function initEasterEggs() {
  initKonamiCode();
  initLogoMultiClick();
}

/**
 * Clean up all easter eggs — remove listeners and active effects
 */
export function destroyEasterEggs() {
  // Remove Konami listener
  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler);
    keydownHandler = null;
  }

  // Remove logo click listener
  if (logoElement && logoClickHandler) {
    logoElement.removeEventListener('click', logoClickHandler);
    logoClickHandler = null;
    logoElement = null;
  }

  // Clear timers
  if (logoClickTimer) {
    clearTimeout(logoClickTimer);
    logoClickTimer = null;
  }

  // Remove any active canvases
  activeCanvases.forEach(canvas => {
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  });
  activeCanvases = [];

  // Reset state
  konamiProgress = [];
  logoClickCount = 0;
}

// ─── Konami Code ────────────────────────────────────────────────────────────

function initKonamiCode() {
  konamiProgress = [];

  keydownHandler = (e) => {
    const key = e.code;
    const expected = KONAMI_SEQUENCE[konamiProgress.length];

    if (key === expected) {
      konamiProgress.push(key);

      if (konamiProgress.length === KONAMI_SEQUENCE.length) {
        konamiProgress = [];
        triggerConfetti();
      }
    } else {
      // Reset but check if this key starts the sequence
      konamiProgress = key === KONAMI_SEQUENCE[0] ? [key] : [];
    }
  };

  document.addEventListener('keydown', keydownHandler);
}

function triggerConfetti() {
  const canvas = createOverlayCanvas();
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    cleanupCanvas(canvas);
    return;
  }

  const particles = createConfettiParticles(canvas.width, canvas.height);
  let startTime = null;
  let animationId = null;
  const duration = 2500; // 2.5 seconds

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      updateConfettiParticle(particle, elapsed);
      drawConfettiParticle(ctx, particle, progress);
    });

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      cleanupCanvas(canvas);
    }
  }

  animationId = requestAnimationFrame(animate);

  // Store reference for cleanup
  canvas._animationId = animationId;
}

function createConfettiParticles(width, height) {
  const count = 100 + Math.floor(Math.random() * 50); // 100-150
  const particles = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: -10 - Math.random() * 100, // Start above viewport
      vx: (Math.random() - 0.5) * 4, // Horizontal drift
      vy: Math.random() * 2 + 2,     // Downward velocity
      gravity: 0.05 + Math.random() * 0.03,
      size: Math.random() * 6 + 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    });
  }

  return particles;
}

function updateConfettiParticle(particle, elapsed) {
  particle.vy += particle.gravity;
  particle.x += particle.vx + Math.sin(elapsed * 0.002 + particle.rotation) * 0.5;
  particle.y += particle.vy;
  particle.rotation += particle.rotationSpeed;
}

function drawConfettiParticle(ctx, particle, progress) {
  const alpha = 1 - progress;
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = particle.color;

  if (particle.shape === 'rect') {
    ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ─── Logo Multi-Click (Matrix Rain) ────────────────────────────────────────

function initLogoMultiClick() {
  logoElement = document.querySelector('.footer__logo');

  if (!logoElement) return;

  logoClickCount = 0;

  logoClickHandler = (e) => {
    logoClickCount++;

    // Reset timer on each click
    if (logoClickTimer) {
      clearTimeout(logoClickTimer);
    }

    // Reset counter after timeout window
    logoClickTimer = setTimeout(() => {
      logoClickCount = 0;
    }, LOGO_CLICK_TIMEOUT);

    if (logoClickCount >= LOGO_CLICK_THRESHOLD) {
      logoClickCount = 0;
      clearTimeout(logoClickTimer);
      logoClickTimer = null;
      e.preventDefault();
      triggerMatrixRain();
    }
  };

  logoElement.addEventListener('click', logoClickHandler);
}

function triggerMatrixRain() {
  const canvas = createOverlayCanvas();
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    cleanupCanvas(canvas);
    return;
  }

  // Dark overlay background
  canvas.style.background = 'rgba(0, 0, 0, 0.85)';
  canvas.style.transition = 'opacity 0.5s ease-out';

  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = new Array(columns).fill(1);

  // Matrix characters (katakana + latin + digits)
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let animationId = null;
  const startTime = Date.now();

  function drawMatrix() {
    const elapsed = Date.now() - startTime;

    // Semi-transparent black to create trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f0';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];

      // Vary green shades for depth
      const brightness = Math.random();
      if (brightness > 0.9) {
        ctx.fillStyle = '#fff'; // occasional bright white
      } else if (brightness > 0.5) {
        ctx.fillStyle = '#0f0'; // bright green
      } else {
        ctx.fillStyle = '#003300'; // dim green
      }

      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      // Reset drop to top randomly after it passes the bottom
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    }

    // Fade out in the last 500ms
    if (elapsed > MATRIX_DURATION - 500) {
      const fadeProgress = (elapsed - (MATRIX_DURATION - 500)) / 500;
      canvas.style.opacity = String(1 - fadeProgress);
    }

    if (elapsed < MATRIX_DURATION) {
      animationId = requestAnimationFrame(drawMatrix);
    } else {
      cleanupCanvas(canvas);
    }
  }

  animationId = requestAnimationFrame(drawMatrix);
  canvas._animationId = animationId;
}

// ─── Shared Utilities ───────────────────────────────────────────────────────

function createOverlayCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.setAttribute('aria-hidden', 'true');

  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '9999'
  });

  document.body.appendChild(canvas);
  activeCanvases.push(canvas);

  return canvas;
}

function cleanupCanvas(canvas) {
  if (canvas._animationId) {
    cancelAnimationFrame(canvas._animationId);
    canvas._animationId = null;
  }

  if (canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }

  const index = activeCanvases.indexOf(canvas);
  if (index > -1) {
    activeCanvases.splice(index, 1);
  }
}
