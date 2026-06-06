import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = join(process.cwd(), 'dist');

/**
 * Build output validation tests.
 * These tests validate the contents of dist/ after a Vite build.
 * Run `npm run build` before executing these tests.
 *
 * Validates: Requirements 10.4, 10.6, 11.2, 11.4
 */

describe('Build Output Validation', () => {
  it('dist/index.html exists after build', () => {
    const filePath = join(DIST_DIR, 'index.html');
    expect(existsSync(filePath)).toBe(true);
  });

  it('dist/technical-interview-preparation-kit/index.html exists after build', () => {
    const filePath = join(DIST_DIR, 'technical-interview-preparation-kit', 'index.html');
    expect(existsSync(filePath)).toBe(true);
  });

  it('dist/CNAME contains "bynoor.io"', () => {
    const filePath = join(DIST_DIR, 'CNAME');
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('bynoor.io');
  });

  it('no image file in dist exceeds 200KB', () => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico'];
    const oversizedImages = [];

    function walkDir(dir) {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (imageExtensions.some((ext) => entry.name.toLowerCase().endsWith(ext))) {
          const stats = statSync(fullPath);
          const sizeKB = stats.size / 1024;
          if (sizeKB > 200) {
            oversizedImages.push({ file: fullPath.replace(DIST_DIR + '/', ''), sizeKB: Math.round(sizeKB) });
          }
        }
      }
    }

    walkDir(DIST_DIR);
    expect(oversizedImages).toEqual([]);
  });

  it('total dist size is under 1.5MB', () => {
    let totalSize = 0;

    function walkDir(dir) {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else {
          totalSize += statSync(fullPath).size;
        }
      }
    }

    walkDir(DIST_DIR);
    const totalMB = totalSize / (1024 * 1024);
    expect(totalMB).toBeLessThan(1.5);
  });
});
