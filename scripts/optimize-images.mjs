import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

async function optimizeProfilePic() {
  const inputPath = path.join(publicDir, 'profile-pic.png');
  const webpOutput = path.join(publicDir, 'profile-pic.webp');
  const pngOutput = path.join(publicDir, 'profile-pic.png');

  console.log('Optimizing profile picture...');

  // Convert to WebP (target under 200KB)
  await sharp(inputPath)
    .resize(400, 400, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(webpOutput);

  const webpSize = fs.statSync(webpOutput).size;
  console.log(`  WebP: ${(webpSize / 1024).toFixed(1)}KB`);

  // Optimize PNG (target under 200KB)
  const optimizedPng = await sharp(inputPath)
    .resize(400, 400, { fit: 'cover' })
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(pngOutput, optimizedPng);
  const pngSize = fs.statSync(pngOutput).size;
  console.log(`  PNG: ${(pngSize / 1024).toFixed(1)}KB`);

  if (webpSize > 200 * 1024) {
    console.warn('  ⚠️  WebP exceeds 200KB, reducing quality...');
    await sharp(inputPath)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 60 })
      .toFile(webpOutput);
    console.log(`  WebP (reduced): ${(fs.statSync(webpOutput).size / 1024).toFixed(1)}KB`);
  }

  if (pngSize > 200 * 1024) {
    console.warn('  ⚠️  PNG exceeds 200KB, reducing quality...');
    const reducedPng = await sharp(inputPath)
      .resize(350, 350, { fit: 'cover' })
      .png({ quality: 70, compressionLevel: 9 })
      .toBuffer();
    fs.writeFileSync(pngOutput, reducedPng);
    console.log(`  PNG (reduced): ${(fs.statSync(pngOutput).size / 1024).toFixed(1)}KB`);
  }

  // Also update the root profile-pic.png
  fs.copyFileSync(pngOutput, path.join(projectRoot, 'profile-pic.png'));
  console.log('  ✓ Profile picture optimized');
}

async function createOGImage() {
  const outputPath = path.join(publicDir, 'og-image.png');

  console.log('Creating OG image...');

  const width = 1200;
  const height = 630;
  const bgColor = '#6366f1'; // Primary indigo

  // Create SVG with text overlay
  const svgText = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg-gradient)"/>
      
      <!-- Decorative circles -->
      <circle cx="100" cy="530" r="180" fill="rgba(255,255,255,0.05)"/>
      <circle cx="1100" cy="100" r="120" fill="rgba(255,255,255,0.05)"/>
      
      <!-- Name -->
      <text x="600" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="700" fill="white" text-anchor="middle">Mohammad Noor Abu Khlaif</text>
      
      <!-- Tagline -->
      <text x="600" y="330" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="400" fill="rgba(255,255,255,0.9)" text-anchor="middle">I build tools that help engineers move faster.</text>
      
      <!-- Subtitle -->
      <text x="600" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="400" fill="rgba(255,255,255,0.7)" text-anchor="middle">Software Engineer · AI Advocate · Tech Educator</text>
      
      <!-- Domain -->
      <text x="600" y="520" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="rgba(255,255,255,0.8)" text-anchor="middle">bynoor.io</text>
    </svg>
  `;

  await sharp(Buffer.from(svgText))
    .png()
    .toFile(outputPath);

  const ogSize = fs.statSync(outputPath).size;
  console.log(`  OG Image: ${(ogSize / 1024).toFixed(1)}KB`);

  if (ogSize > 200 * 1024) {
    // Compress if too large
    await sharp(outputPath)
      .png({ compressionLevel: 9, quality: 80 })
      .toFile(outputPath + '.tmp');
    fs.renameSync(outputPath + '.tmp', outputPath);
    console.log(`  OG Image (compressed): ${(fs.statSync(outputPath).size / 1024).toFixed(1)}KB`);
  }

  console.log('  ✓ OG image created');
}

async function main() {
  try {
    await optimizeProfilePic();
    await createOGImage();

    // Final size check
    console.log('\n--- Final file sizes ---');
    const files = ['profile-pic.png', 'profile-pic.webp', 'og-image.png'];
    for (const file of files) {
      const filePath = path.join(publicDir, file);
      if (fs.existsSync(filePath)) {
        const size = fs.statSync(filePath).size;
        const status = size <= 200 * 1024 ? '✓' : '✗';
        console.log(`  ${status} ${file}: ${(size / 1024).toFixed(1)}KB`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
