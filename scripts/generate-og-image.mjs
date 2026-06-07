/**
 * Generate OG image for bynoor.io with dark theme and neon accents.
 * Uses sharp to compose an SVG overlay onto a dark background.
 * Output: public/og-image.png at 1200×630.
 */
import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../public/og-image.png');

const WIDTH = 1200;
const HEIGHT = 630;

// Design tokens
const BG_COLOR = '#0e0e14'; // hsl(240, 15%, 6%) approximate
const VIOLET = '#a855f7';   // accent-primary (violet)
const CYAN = '#22d3ee';     // accent-secondary (cyan)
const MAGENTA = '#ec4899';  // accent-tertiary (magenta)
const AMBER = '#eab308';    // accent-quaternary (amber)
const TEXT_COLOR = '#ededed'; // --color-text
const TEXT_SECONDARY = '#adadad'; // --color-text-secondary

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <!-- Background gradient -->
    <radialGradient id="glow1" cx="20%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="80%" cy="60%" r="45%">
      <stop offset="0%" stop-color="${CYAN}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow3" cx="50%" cy="80%" r="40%">
      <stop offset="0%" stop-color="${MAGENTA}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <!-- Text gradient -->
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${VIOLET}"/>
      <stop offset="50%" stop-color="${CYAN}"/>
      <stop offset="100%" stop-color="${MAGENTA}"/>
    </linearGradient>
    <!-- Border gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="${CYAN}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${MAGENTA}" stop-opacity="0.6"/>
    </linearGradient>
  </defs>

  <!-- Dark background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG_COLOR}"/>

  <!-- Gradient glows -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow1)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow2)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow3)"/>

  <!-- Subtle grid pattern -->
  <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  </pattern>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)"/>

  <!-- Decorative particles -->
  <circle cx="150" cy="120" r="3" fill="${VIOLET}" opacity="0.4"/>
  <circle cx="300" cy="80" r="2" fill="${CYAN}" opacity="0.3"/>
  <circle cx="900" cy="150" r="4" fill="${MAGENTA}" opacity="0.3"/>
  <circle cx="1050" cy="100" r="2.5" fill="${AMBER}" opacity="0.35"/>
  <circle cx="200" cy="500" r="3" fill="${CYAN}" opacity="0.3"/>
  <circle cx="1000" cy="480" r="3.5" fill="${VIOLET}" opacity="0.35"/>
  <circle cx="700" cy="550" r="2" fill="${AMBER}" opacity="0.3"/>
  <circle cx="450" cy="90" r="2.5" fill="${AMBER}" opacity="0.25"/>
  <circle cx="800" cy="530" r="3" fill="${MAGENTA}" opacity="0.3"/>

  <!-- Border frame with gradient -->
  <rect x="24" y="24" width="${WIDTH - 48}" height="${HEIGHT - 48}" rx="16" ry="16"
        fill="none" stroke="url(#borderGrad)" stroke-width="1.5" opacity="0.5"/>

  <!-- Glassmorphism card background -->
  <rect x="80" y="160" width="1040" height="310" rx="20" ry="20"
        fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- Name with gradient -->
  <text x="600" y="280" text-anchor="middle"
        font-family="'Space Grotesk', 'Inter', -apple-system, sans-serif"
        font-size="56" font-weight="700" fill="url(#textGrad)">
    Mohammad Noor Abu Khlaif
  </text>

  <!-- Tagline -->
  <text x="600" y="340" text-anchor="middle"
        font-family="'Inter', -apple-system, sans-serif"
        font-size="24" font-weight="400" fill="${TEXT_COLOR}">
    Software Engineer &amp; AI Advocate
  </text>

  <!-- URL -->
  <text x="600" y="410" text-anchor="middle"
        font-family="'JetBrains Mono', 'Fira Code', monospace"
        font-size="18" font-weight="400" fill="${TEXT_SECONDARY}" opacity="0.7">
    bynoor.io
  </text>

  <!-- Accent line under name -->
  <rect x="400" y="360" width="400" height="2" rx="1" fill="url(#textGrad)" opacity="0.5"/>
</svg>
`;

async function generateOgImage() {
  try {
    const svgBuffer = Buffer.from(svg);

    await sharp(svgBuffer)
      .resize(WIDTH, HEIGHT)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(OUTPUT_PATH);

    console.log(`✓ OG image generated: ${OUTPUT_PATH} (${WIDTH}×${HEIGHT})`);
  } catch (error) {
    console.error('Failed to generate OG image:', error.message);
    process.exit(1);
  }
}

generateOgImage();
