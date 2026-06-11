/**
 * Bug Condition Exploration Test — Interview Kit Dark Theme
 *
 * This test verifies that the bug condition exists in the UNFIXED code:
 * - Hardcoded light-theme hex colors (#f8fafc, #f1f5f9, #e2e8f0) produce
 *   backgrounds with luminance > 0.3 (too light for a dark-theme page)
 * - Undefined CSS variables (--color-border, --color-primary, --color-primary-hover)
 *   do not resolve to visible/accent values
 *
 * EXPECTED: This test FAILS on unfixed code, proving the bug exists.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

// --- Helpers ---

/**
 * Parse a hex color to { r, g, b } in 0-255 range.
 */
function hexToRgb(hex) {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Calculate relative luminance per WCAG 2.1.
 * Returns value between 0 (black) and 1 (white).
 */
function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG contrast ratio between two luminance values.
 */
function contrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse an HSL string like "hsl(240, 15%, 6%)" to { r, g, b }.
 */
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

// --- Constants ---

// The dark page background from tokens.css
const PAGE_BG = hslToRgb(240, 15, 6); // hsl(240, 15%, 6%)
const PAGE_BG_LUMINANCE = relativeLuminance(PAGE_BG);

// Light text color from tokens.css: hsl(0, 0%, 93%)
const TEXT_COLOR = hslToRgb(0, 0, 93);
const TEXT_LUMINANCE = relativeLuminance(TEXT_COLOR);

// Hardcoded light hex colors used in resources.css (the bug)
const HARDCODED_LIGHT_COLORS = {
  '#f8fafc': { usage: ['blockquote bg', 'even row bg'] },
  '#f1f5f9': { usage: ['inline code bg', 'pre bg', 'thead bg', 'hover row bg'] },
  '#e2e8f0': { usage: ['group header bg'] },
};

// Undefined variables used in resources.css (the bug)
const UNDEFINED_VARIABLES = ['--color-border', '--color-primary', '--color-primary-hover'];

// --- CSS Parsing ---

const tokensPath = resolve(__dirname, '../../src/styles/tokens.css');
const resourcesPath = resolve(__dirname, '../../src/styles/resources.css');

const tokensCss = readFileSync(tokensPath, 'utf-8');
const resourcesCss = readFileSync(resourcesPath, 'utf-8');

/**
 * Check if a CSS variable is defined in tokens.css (:root block).
 */
function isVariableDefinedInTokens(varName) {
  // Match pattern like: --color-border: <value>;
  const regex = new RegExp(`${varName.replace(/[-]/g, '\\-')}\\s*:`, 'm');
  return regex.test(tokensCss);
}

/**
 * Extract all CSS rules from resources.css that match the bug condition.
 * Returns an array of { selector, property, value, bugType }.
 */
function extractBugConditionRules(css) {
  const rules = [];
  // Simple CSS rule parser (handles single-level selectors)
  const ruleRegex = /([^{}]+)\{([^}]+)\}/g;
  let match;

  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    const declarations = match[2].trim();

    // Only consider rules within .resources scope
    if (!selector.includes('.resources') && !selector.includes('.toc')) continue;

    // Parse declarations
    const declRegex = /([\w-]+)\s*:\s*([^;]+);/g;
    let declMatch;
    while ((declMatch = declRegex.exec(declarations)) !== null) {
      const property = declMatch[1].trim();
      const value = declMatch[2].trim();

      // Check for hardcoded light colors
      for (const hex of Object.keys(HARDCODED_LIGHT_COLORS)) {
        if (value.toLowerCase().includes(hex.toLowerCase())) {
          rules.push({ selector, property, value, bugType: 'hardcoded-light-color', hex });
        }
      }

      // Check for undefined variables
      for (const varName of UNDEFINED_VARIABLES) {
        if (value.includes(`var(${varName})`)) {
          rules.push({ selector, property, value, bugType: 'undefined-variable', varName });
        }
      }
    }
  }

  return rules;
}

// --- Tests ---

describe('Bug Condition Exploration: Light-Theme Colors on Dark Background', () => {
  let bugRules;

  beforeAll(() => {
    bugRules = extractBugConditionRules(resourcesCss);
  });

  it('should find bug condition rules in resources.css', () => {
    // Sanity check: we expect to find the buggy rules
    expect(bugRules.length).toBeGreaterThan(0);
  });

  describe('Property 1: Hardcoded light hex backgrounds must have luminance < 0.3 (dark)', () => {
    /**
     * **Validates: Requirements 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9**
     *
     * Property: For all elements with hardcoded hex backgrounds in .resources,
     * the background luminance MUST be < 0.3 (dark-theme compatible).
     *
     * On unfixed code, this will FAIL because #f8fafc, #f1f5f9, #e2e8f0 all
     * have luminance > 0.9 (nearly white).
     */
    it('all hardcoded background colors should have luminance < 0.3', () => {
      const hardcodedBgRules = bugRules.filter(
        (r) => r.bugType === 'hardcoded-light-color' && r.property.includes('background')
      );

      // Use fast-check to pick from the set of hardcoded bg rules
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: Math.max(0, hardcodedBgRules.length - 1) }),
          (index) => {
            const rule = hardcodedBgRules[index];
            if (!rule) return true; // skip if no rules (shouldn't happen)

            const rgb = hexToRgb(rule.hex);
            const luminance = relativeLuminance(rgb);

            // Assert: background luminance must be < 0.3 for dark theme
            expect(luminance).toBeLessThan(0.3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('all hardcoded background colors should provide >= 4.5:1 contrast ratio with light text', () => {
      const hardcodedBgRules = bugRules.filter(
        (r) => r.bugType === 'hardcoded-light-color' && r.property.includes('background')
      );

      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: Math.max(0, hardcodedBgRules.length - 1) }),
          (index) => {
            const rule = hardcodedBgRules[index];
            if (!rule) return true;

            const bgRgb = hexToRgb(rule.hex);
            const bgLuminance = relativeLuminance(bgRgb);
            const ratio = contrastRatio(TEXT_LUMINANCE, bgLuminance);

            // Assert: text-to-background contrast must be >= 4.5:1
            expect(ratio).toBeGreaterThanOrEqual(4.5);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1: Undefined variables must resolve to visible values', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     *
     * Property: --color-border must resolve to a visible border color (not transparent/initial)
     * and --color-primary must resolve to an accent color (not browser default blue).
     *
     * On unfixed code, this FAILS because these variables are NOT defined in tokens.css.
     */
    it('--color-border should be defined in tokens.css', () => {
      fc.assert(
        fc.property(fc.constant('--color-border'), (varName) => {
          const isDefined = isVariableDefinedInTokens(varName);
          // Assert: variable must be defined for it to resolve
          expect(isDefined).toBe(true);
        }),
        { numRuns: 1 }
      );
    });

    it('--color-primary should be defined in tokens.css', () => {
      fc.assert(
        fc.property(fc.constant('--color-primary'), (varName) => {
          const isDefined = isVariableDefinedInTokens(varName);
          // Assert: variable must be defined for link colors to work
          expect(isDefined).toBe(true);
        }),
        { numRuns: 1 }
      );
    });

    it('--color-primary-hover should be defined in tokens.css', () => {
      fc.assert(
        fc.property(fc.constant('--color-primary-hover'), (varName) => {
          const isDefined = isVariableDefinedInTokens(varName);
          // Assert: variable must be defined for hover states to work
          expect(isDefined).toBe(true);
        }),
        { numRuns: 1 }
      );
    });
  });

  describe('Combined Property: All bug condition elements must be dark-theme compatible', () => {
    /**
     * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9**
     *
     * Combined property: For ALL CSS rules matching isBugCondition(), the element
     * must render with dark-theme-compatible values. This means:
     * - Hardcoded colors must have low luminance (< 0.3)
     * - Variables must be defined in the token system
     */
    it('for all bug-condition rules, elements should be dark-theme compatible', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: Math.max(0, bugRules.length - 1) }),
          (index) => {
            const rule = bugRules[index];
            if (!rule) return true;

            if (rule.bugType === 'hardcoded-light-color') {
              const rgb = hexToRgb(rule.hex);
              const luminance = relativeLuminance(rgb);
              // Dark theme: background luminance must be < 0.3
              expect(luminance).toBeLessThan(0.3);
            } else if (rule.bugType === 'undefined-variable') {
              // Variable must be defined in tokens
              const isDefined = isVariableDefinedInTokens(rule.varName);
              expect(isDefined).toBe(true);
            }
          }
        ),
        { numRuns: 200 }
      );
    });
  });
});
