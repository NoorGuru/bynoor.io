/**
 * Generate OG image for bynoor.io with dark theme, neon accents, and profile photo.
 * Embeds actual site fonts (Space Grotesk, Inter) as base64 in SVG for accurate rendering.
 * Output: public/og-image.png at 1200×630.
 */
import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../public/og-image.png');
const PROFILE_PIC_PATH = resolve(__dirname, '../public/profile-pic.png');

// Load the actual fonts and encode as base64 for SVG embedding
const SPACE_GROTESK_PATH = resolve(__dirname, '../src/assets/fonts/space-grotesk-variable.woff2');
const INTER_PATH = resolve(__dirname, '../src/assets/fonts/inter-variable.woff2');

const spaceGroteskBase64 = readFileSync(SPACE_GROTESK_PATH).toString('base64');
const interBase64 = readFileSync(INTER_PATH).toString('base64');

const WIDTH = 1200;
const HEIGHT = 630;

// Design tokens matching the site exactly
const BG_COLOR = '#0a0a12';
const VIOLET = '#a855f7';
const CYAN = '#22d3ee';
const MAGENTA = '#ec4899';
const AMBER = '#eab308';
const TEXT_COLOR = '#f5f5f5';
const TEXT_SECONDARY = '#c8c8d8';
const TEXT_MUTED = '#7878a0';

// Photo dimensions
const PHOTO_SIZE = 340;
const PHOTO_X = 50;
const PHOTO_Y = 145;
const RING_SIZE = PHOTO_SIZE + 20;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <!-- Embed actual site fonts -->
    <style type="text/css">
      @font-face {
        font-family: 'Space Grotesk';
        font-weight: 300 700;
        src: url(data:font/woff2;base64,${spaceGroteskBase64}) format('woff2');
      }
      @font-face {
        font-family: 'Inter';
        font-weight: 100 900;
        src: url(data:font/woff2;base64,${interBase64}) format('woff2');
      }
    </style>

    <!-- Background ambient glows -->
    <radialGradient id="glow1" cx="10%" cy="30%" r="55%">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="92%" cy="65%" r="45%">
      <stop offset="0%" stop-color="${CYAN}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow3" cx="55%" cy="95%" r="40%">
      <stop offset="0%" stop-color="${MAGENTA}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="photoGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.5"/>
      <stop offset="50%" stop-color="${CYAN}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>

    <!-- Gradients -->
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${VIOLET}"/>
      <stop offset="50%" stop-color="${CYAN}"/>
      <stop offset="100%" stop-color="${MAGENTA}"/>
    </linearGradient>
    <linearGradient id="noorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${VIOLET}"/>
      <stop offset="100%" stop-color="${CYAN}"/>
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${VIOLET}"/>
      <stop offset="33%" stop-color="${CYAN}"/>
      <stop offset="66%" stop-color="${MAGENTA}"/>
      <stop offset="100%" stop-color="${VIOLET}"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.5"/>
      <stop offset="50%" stop-color="${CYAN}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${MAGENTA}" stop-opacity="0.5"/>
    </linearGradient>
    <linearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${VIOLET}"/>
      <stop offset="50%" stop-color="${CYAN}"/>
      <stop offset="100%" stop-color="${MAGENTA}"/>
    </linearGradient>
    <linearGradient id="pillStroke" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="${CYAN}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${MAGENTA}" stop-opacity="0.8"/>
    </linearGradient>
  </defs>

  <!-- Dark background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG_COLOR}"/>

  <!-- Ambient gradient glows -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow1)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow2)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow3)"/>

  <!-- Subtle dot grid pattern -->
  <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
    <circle cx="20" cy="20" r="0.6" fill="rgba(255,255,255,0.03)"/>
  </pattern>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#dotGrid)"/>

  <!-- Decorative particles -->
  <circle cx="80" cy="50" r="2.5" fill="${VIOLET}" opacity="0.5"/>
  <circle cx="500" cy="38" r="1.8" fill="${CYAN}" opacity="0.4"/>
  <circle cx="1020" cy="65" r="3.5" fill="${MAGENTA}" opacity="0.35"/>
  <circle cx="1145" cy="200" r="2.2" fill="${AMBER}" opacity="0.4"/>
  <circle cx="95" cy="580" r="2.5" fill="${CYAN}" opacity="0.35"/>
  <circle cx="1105" cy="560" r="3" fill="${VIOLET}" opacity="0.4"/>
  <circle cx="850" cy="592" r="1.8" fill="${AMBER}" opacity="0.35"/>
  <circle cx="650" cy="42" r="2.2" fill="${AMBER}" opacity="0.3"/>
  <circle cx="1150" cy="380" r="1.8" fill="${MAGENTA}" opacity="0.4"/>
  <circle cx="42" cy="300" r="1.8" fill="${MAGENTA}" opacity="0.3"/>

  <!-- Outer border frame -->
  <rect x="14" y="14" width="${WIDTH - 28}" height="${HEIGHT - 28}" rx="20" ry="20"
        fill="none" stroke="url(#borderGrad)" stroke-width="1.5"/>

  <!-- Photo luminous ring glow (soft outer bloom) -->
  <circle cx="${PHOTO_X + PHOTO_SIZE / 2}" cy="${PHOTO_Y + PHOTO_SIZE / 2}" r="${RING_SIZE / 2 + 35}"
          fill="url(#photoGlow)" opacity="0.7"/>

  <!-- Photo luminous ring -->
  <circle cx="${PHOTO_X + PHOTO_SIZE / 2}" cy="${PHOTO_Y + PHOTO_SIZE / 2}" r="${RING_SIZE / 2}"
          fill="none" stroke="url(#ringGrad)" stroke-width="4.5" opacity="0.9"/>

  <!-- Photo ring inner shadow -->
  <circle cx="${PHOTO_X + PHOTO_SIZE / 2}" cy="${PHOTO_Y + PHOTO_SIZE / 2}" r="${PHOTO_SIZE / 2 + 2}"
          fill="none" stroke="${BG_COLOR}" stroke-width="5"/>

  <!-- ===== Text content (right side) ===== -->

  <!-- Name line 1 — Space Grotesk Bold (site heading font) -->
  <text x="460" y="210"
        font-family="Space Grotesk" font-size="72" font-weight="700"
        fill="${TEXT_COLOR}" letter-spacing="-2">Mohammad Noor</text>

  <!-- Name line 2 — Space Grotesk Bold with gradient -->
  <text x="460" y="295"
        font-family="Space Grotesk" font-size="72" font-weight="700"
        fill="url(#textGrad)" letter-spacing="-2">Abu Khlaif</text>

  <!-- Accent line -->
  <rect x="460" y="318" width="520" height="3" rx="1.5" fill="url(#accentLine)"/>

  <!-- Role — Inter medium (site body font) -->
  <text x="460" y="372"
        font-family="Inter" font-size="24" font-weight="500"
        fill="${TEXT_SECONDARY}" letter-spacing="0.3">Software Engineer · AI Advocate · Tech Educator</text>

  <!-- bynoor.io — single text, NO SPACES, tspan for color split -->
  <!-- Pill background — tight fit -->
  <rect x="455" y="408" width="180" height="44" rx="22" ry="22"
        fill="rgba(168,85,247,0.08)" stroke="url(#pillStroke)" stroke-width="1.5"/>

  <!-- bynoor.io as one continuous text block using tspan -->
  <text x="485" y="438" font-family="Space Grotesk" font-size="28" letter-spacing="-0.5">
    <tspan font-weight="300" fill="${TEXT_MUTED}">by</tspan><tspan font-weight="700" fill="url(#noorGrad)">noor</tspan><tspan font-weight="300" fill="${TEXT_MUTED}">.io</tspan>
  </text>
</svg>
`;

async function generateOgImage() {
  try {
    // Create the SVG background layer
    const svgBuffer = Buffer.from(svg);
    const background = sharp(svgBuffer).resize(WIDTH, HEIGHT).png();

    // Load and prepare the circular profile picture
    const profilePic = await sharp(PROFILE_PIC_PATH)
      .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: 'cover' })
      .composite([{
        input: Buffer.from(`
          <svg width="${PHOTO_SIZE}" height="${PHOTO_SIZE}">
            <circle cx="${PHOTO_SIZE / 2}" cy="${PHOTO_SIZE / 2}" r="${PHOTO_SIZE / 2}" fill="white"/>
          </svg>
        `),
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();

    // Composite profile picture onto the background
    await background
      .composite([{
        input: profilePic,
        left: PHOTO_X,
        top: PHOTO_Y,
      }])
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(OUTPUT_PATH);

    console.log(`✓ OG image generated: ${OUTPUT_PATH} (${WIDTH}×${HEIGHT})`);
    console.log(`  → Profile picture: ${PHOTO_SIZE}×${PHOTO_SIZE}px`);
    console.log(`  → Fonts embedded: Space Grotesk (heading), Inter (body)`);
  } catch (error) {
    console.error('Failed to generate OG image:', error.message);
    process.exit(1);
  }
}

generateOgImage();
