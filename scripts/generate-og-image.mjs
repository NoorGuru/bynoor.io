/**
 * Generate OG image for bynoor.io
 * Design: "NOOR" as massive architectural backdrop, photo overlaid on top,
 * clean centered info below. One gradient moment, restrained everywhere else.
 * Uses resvg with static TTF fonts.
 */
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../public/og-image.png');
const PROFILE_PIC_PATH = resolve(__dirname, '../public/profile-pic.png');

const FONTS_DIR = resolve(__dirname, 'fonts');
const fontFiles = [
  resolve(FONTS_DIR, 'SpaceGrotesk-Bold.ttf'),
  resolve(FONTS_DIR, 'SpaceGrotesk-Medium.ttf'),
  resolve(FONTS_DIR, 'SpaceGrotesk-Light.ttf'),
  resolve(FONTS_DIR, 'Inter-Medium.ttf'),
];

const WIDTH = 1200;
const HEIGHT = 630;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;

// Palette — surgical use
const BG = '#06060c';
const VIOLET = '#a855f7';
const CYAN = '#22d3ee';
const MAGENTA = '#ec4899';
const WHITE = '#ffffff';
const GHOST = '#3d3d5c'; // more visible for the backdrop text

// Photo — large, overlapping the NOOR backdrop
const PHOTO_SIZE = 220;
const PHOTO_X = CX - PHOTO_SIZE / 2;
const PHOTO_Y = 60;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="nameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${VIOLET}"/>
      <stop offset="50%" stop-color="${CYAN}"/>
      <stop offset="100%" stop-color="${MAGENTA}"/>
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="${CYAN}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${MAGENTA}" stop-opacity="0.9"/>
    </linearGradient>
    <radialGradient id="photoGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.5"/>
      <stop offset="60%" stop-color="${CYAN}" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="tagGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${CYAN}"/>
      <stop offset="100%" stop-color="${VIOLET}"/>
    </linearGradient>

    <!-- Infinity-style flowing border gradient — multiple color stops that loop -->
    <linearGradient id="borderTop" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${VIOLET}"/>
      <stop offset="25%" stop-color="${CYAN}"/>
      <stop offset="50%" stop-color="${MAGENTA}"/>
      <stop offset="75%" stop-color="${CYAN}"/>
      <stop offset="100%" stop-color="${VIOLET}"/>
    </linearGradient>
    <linearGradient id="borderRight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${VIOLET}"/>
      <stop offset="25%" stop-color="${MAGENTA}"/>
      <stop offset="50%" stop-color="${CYAN}"/>
      <stop offset="75%" stop-color="${VIOLET}"/>
      <stop offset="100%" stop-color="${MAGENTA}"/>
    </linearGradient>
    <linearGradient id="borderBottom" x1="100%" y1="0%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${MAGENTA}"/>
      <stop offset="25%" stop-color="${CYAN}"/>
      <stop offset="50%" stop-color="${VIOLET}"/>
      <stop offset="75%" stop-color="${CYAN}"/>
      <stop offset="100%" stop-color="${MAGENTA}"/>
    </linearGradient>
    <linearGradient id="borderLeft" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${CYAN}"/>
      <stop offset="25%" stop-color="${VIOLET}"/>
      <stop offset="50%" stop-color="${MAGENTA}"/>
      <stop offset="75%" stop-color="${CYAN}"/>
      <stop offset="100%" stop-color="${VIOLET}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>

  <!-- "NOOR" as architectural backdrop — enormous, more visible -->
  <text x="${CX}" y="380" text-anchor="middle"
        font-family="Space Grotesk" font-size="420" font-weight="700"
        fill="${GHOST}" opacity="0.6">NOOR</text>

  <!-- Infinity-feel border — four sides with flowing gradients -->
  <!-- Top -->
  <rect x="20" y="20" width="${WIDTH - 40}" height="2.5" rx="1.25" fill="url(#borderTop)" opacity="0.7"/>
  <!-- Right -->
  <rect x="${WIDTH - 22}" y="20" width="2.5" height="${HEIGHT - 40}" rx="1.25" fill="url(#borderRight)" opacity="0.7"/>
  <!-- Bottom -->
  <rect x="20" y="${HEIGHT - 22}" width="${WIDTH - 40}" height="2.5" rx="1.25" fill="url(#borderBottom)" opacity="0.7"/>
  <!-- Left -->
  <rect x="20" y="20" width="2.5" height="${HEIGHT - 40}" rx="1.25" fill="url(#borderLeft)" opacity="0.7"/>
  <!-- Corner glows -->
  <circle cx="21" cy="21" r="4" fill="${VIOLET}" opacity="0.6"/>
  <circle cx="${WIDTH - 21}" cy="21" r="4" fill="${CYAN}" opacity="0.6"/>
  <circle cx="${WIDTH - 21}" cy="${HEIGHT - 21}" r="4" fill="${MAGENTA}" opacity="0.6"/>
  <circle cx="21" cy="${HEIGHT - 21}" r="4" fill="${CYAN}" opacity="0.6"/>

  <!-- Photo glow -->
  <circle cx="${CX}" cy="${PHOTO_Y + PHOTO_SIZE / 2}" r="${PHOTO_SIZE / 2 + 50}"
          fill="url(#photoGlow)" opacity="0.8"/>

  <!-- Photo ring -->
  <circle cx="${CX}" cy="${PHOTO_Y + PHOTO_SIZE / 2}" r="${PHOTO_SIZE / 2 + 5}"
          fill="none" stroke="url(#ringGrad)" stroke-width="3"/>

  <!-- Photo mask -->
  <circle cx="${CX}" cy="${PHOTO_Y + PHOTO_SIZE / 2}" r="${PHOTO_SIZE / 2 + 1}"
          fill="${BG}"/>

  <!-- Name — gradient, larger -->
  <text x="${CX}" y="370" text-anchor="middle"
        font-family="Space Grotesk" font-size="58" font-weight="700"
        fill="url(#nameGrad)">Mohammad Noor Abu Khlaif</text>

  <!-- Tagline — white, clean, bigger -->
  <text x="${CX}" y="435" text-anchor="middle"
        font-family="Space Grotesk" font-size="38" font-weight="500"
        fill="${WHITE}">I build tools that help engineers move faster</text>

  <!-- Role line — gradient, bigger -->
  <text x="${CX}" y="495" text-anchor="middle"
        font-family="Inter" font-size="22" font-weight="500"
        fill="url(#tagGrad)">Software Engineer  ·  AI Advocate  ·  Tech Educator</text>

  <!-- bynoor.io — bottom center, bigger, properly spaced -->
  <text x="${CX - 50}" y="575" font-family="Space Grotesk" font-size="30" font-weight="300" fill="${WHITE}">by</text>
  <text x="${CX - 18}" y="575" font-family="Space Grotesk" font-size="30" font-weight="700" fill="${CYAN}">noor</text>
  <text x="${CX + 48}" y="575" font-family="Space Grotesk" font-size="30" font-weight="300" fill="${WHITE}">.io</text>
</svg>
`;

async function generateOgImage() {
  try {
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: WIDTH },
      font: {
        fontFiles,
        loadSystemFonts: false,
        defaultFontFamily: 'Inter',
      },
    });

    const svgPng = resvg.render().asPng();

    // Circular profile picture
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

    // Composite
    await sharp(svgPng)
      .composite([{
        input: profilePic,
        left: PHOTO_X,
        top: PHOTO_Y,
      }])
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(OUTPUT_PATH);

    console.log(`✓ OG image generated: ${OUTPUT_PATH} (${WIDTH}×${HEIGHT})`);
    console.log(`  → "NOOR" at 420px as ghosted backdrop`);
    console.log(`  → Photo ${PHOTO_SIZE}px centered, overlapping the backdrop`);
    console.log(`  → Name in gradient, tagline in white, roles in cyan→violet`);
  } catch (error) {
    console.error('Failed to generate OG image:', error.message);
    process.exit(1);
  }
}

generateOgImage();
