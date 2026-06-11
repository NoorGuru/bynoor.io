/**
 * Preservation Property Tests — Interview Kit Layout & Structure
 *
 * These tests verify that layout, spacing, typography, responsive behavior,
 * and scroll offsets are correctly defined in the UNFIXED code. They establish
 * a baseline that must remain unchanged after the bug fix is applied.
 *
 * Tests parse raw CSS to verify property declarations (since JSDOM doesn't
 * fully compute CSS custom properties), and use fast-check to generate
 * random viewport widths to verify spacing/layout token consistency.
 *
 * EXPECTED: All tests PASS on unfixed code (confirms baseline to preserve).
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

// --- File Loading ---

const tokensPath = resolve(__dirname, '../../src/styles/tokens.css');
const resourcesPath = resolve(__dirname, '../../src/styles/resources.css');
const htmlPath = resolve(__dirname, '../../technical-interview-preparation-kit/index.html');

const tokensCss = readFileSync(tokensPath, 'utf-8');
const resourcesCss = readFileSync(resourcesPath, 'utf-8');
const htmlContent = readFileSync(htmlPath, 'utf-8');

// --- CSS Parsing Helpers ---

/**
 * Extract the value of a CSS variable definition from tokens.css :root block.
 */
function getTokenValue(varName) {
  const regex = new RegExp(`${varName.replace(/[-]/g, '\\-')}\\s*:\\s*([^;]+);`, 'm');
  const match = tokensCss.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Strip @media blocks from CSS, returning only top-level rules.
 */
function stripMediaBlocks(css) {
  let result = '';
  let depth = 0;
  let inMedia = false;
  let i = 0;

  while (i < css.length) {
    if (css.slice(i).startsWith('@media')) {
      inMedia = true;
      // Skip to the opening brace
      while (i < css.length && css[i] !== '{') i++;
      depth = 1;
      i++; // skip the '{'
      // Skip entire media block
      while (i < css.length && depth > 0) {
        if (css[i] === '{') depth++;
        else if (css[i] === '}') depth--;
        i++;
      }
      inMedia = false;
    } else {
      result += css[i];
      i++;
    }
  }
  return result;
}

/**
 * Strip CSS comments from text.
 */
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Extract declarations for a given selector in resources.css (top-level only).
 * Returns an object mapping property -> value.
 * Uses exact selector matching to avoid substring collisions.
 */
function getDeclarationsForSelector(css, targetSelector) {
  const declarations = {};
  const topLevelCss = stripMediaBlocks(css);

  const ruleRegex = /([^{}]+)\{([^}]+)\}/g;
  let match;

  while ((match = ruleRegex.exec(topLevelCss)) !== null) {
    const rawSelector = match[1];
    const body = match[2].trim();

    // Strip comments from selector block before comparing
    const selectorBlock = stripComments(rawSelector).trim();

    // Check if target selector exactly matches any of the comma-separated selectors
    const selectors = selectorBlock.split(',').map((s) => s.trim());
    const matches = selectors.some((s) => s === targetSelector);

    if (matches) {
      const declRegex = /([\w-]+)\s*:\s*([^;]+);/g;
      let declMatch;
      while ((declMatch = declRegex.exec(body)) !== null) {
        declarations[declMatch[1].trim()] = declMatch[2].trim();
      }
    }
  }
  return declarations;
}

/**
 * Extract declarations inside a specific media query for a given selector.
 */
function getMediaQueryDeclarations(css, mediaQuery, targetSelector) {
  const declarations = {};
  // Find the media query block
  const mediaRegex = new RegExp(
    `@media\\s*\\(${mediaQuery.replace(/[()]/g, '\\$&')}\\)\\s*\\{([\\s\\S]*?)\\n\\}`,
    'gm'
  );
  const mediaMatch = mediaRegex.exec(css);
  if (!mediaMatch) return declarations;

  const mediaBody = mediaMatch[1];
  const ruleRegex = /([^{}]+)\{([^}]+)\}/g;
  let match;

  while ((match = ruleRegex.exec(mediaBody)) !== null) {
    const selector = match[1].trim();
    if (selector === targetSelector || selector.includes(targetSelector)) {
      const declRegex = /([\w-]+)\s*:\s*([^;]+);/g;
      let declMatch;
      while ((declMatch = declRegex.exec(match[2])) !== null) {
        declarations[declMatch[1].trim()] = declMatch[2].trim();
      }
    }
  }
  return declarations;
}

/**
 * Check if a CSS variable is defined in tokens.css.
 */
function isTokenDefined(varName) {
  const regex = new RegExp(`${varName.replace(/[-]/g, '\\-')}\\s*:`, 'm');
  return regex.test(tokensCss);
}

// --- Tests ---

describe('Preservation Property: Layout and Structure Unchanged', () => {
  let dom;
  let document;

  beforeAll(() => {
    dom = new JSDOM(htmlContent);
    document = dom.window.document;
  });

  describe('Requirement 3.6: Spacing tokens and layout variables are defined and unaffected', () => {
    /**
     * **Validates: Requirements 3.6**
     *
     * Property: For all spacing tokens (--space-xs through --space-2xl),
     * --max-width, and --header-height, the tokens must be defined in
     * tokens.css with their expected values.
     */
    const expectedTokens = {
      '--max-width': '1200px',
      '--header-height': '64px',
      '--space-xs': '0.25rem',
      '--space-sm': '0.5rem',
      '--space-md': '1rem',
      '--space-lg': '2rem',
      '--space-xl': '4rem',
      '--space-2xl': '6rem',
    };

    it('all layout and spacing tokens are defined with correct values', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(expectedTokens)),
          (tokenName) => {
            const value = getTokenValue(tokenName);
            expect(value).not.toBeNull();
            expect(value).toBe(expectedTokens[tokenName]);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('typography tokens are defined', () => {
      const typographyTokens = ['--font-primary', '--font-heading', '--font-mono'];

      fc.assert(
        fc.property(fc.constantFrom(...typographyTokens), (tokenName) => {
          expect(isTokenDefined(tokenName)).toBe(true);
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Requirement 3.6: .resources container layout properties preserved', () => {
    /**
     * **Validates: Requirements 3.6**
     *
     * Property: The .resources container must use --max-width for max-width,
     * spacing tokens for padding, --font-primary for font-family, and
     * line-height of 1.7.
     */
    it('.resources uses correct max-width, padding, font-family, and line-height', () => {
      const decls = getDeclarationsForSelector(resourcesCss, '.resources');

      expect(decls['max-width']).toBe('var(--max-width)');
      expect(decls['padding']).toBe('var(--space-xl) var(--space-lg)');
      expect(decls['padding-top']).toBe('calc(var(--header-height) + var(--space-xl))');
      expect(decls['font-family']).toBe('var(--font-primary)');
      expect(decls['line-height']).toBe('1.7');
      expect(decls['margin']).toBe('0 auto');
    });

    it('.resources container properties remain consistent across random viewport widths', () => {
      // Property-based: For any viewport width, the base .resources declarations
      // should be the same in the CSS source (they're not viewport-dependent at base level)
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1920 }),
          (_viewportWidth) => {
            // The base declarations are static in CSS source regardless of viewport
            const decls = getDeclarationsForSelector(resourcesCss, '.resources');
            expect(decls['max-width']).toBe('var(--max-width)');
            expect(decls['font-family']).toBe('var(--font-primary)');
            expect(decls['line-height']).toBe('1.7');
            expect(decls['margin']).toBe('0 auto');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Requirement 3.2: Heading scroll-margin-top preserved', () => {
    /**
     * **Validates: Requirements 3.2**
     *
     * Property: h2, h3, h4 within .resources must have
     * scroll-margin-top: calc(var(--header-height) + 1rem) for proper
     * anchor navigation offset.
     */
    it('h2/h3/h4 scroll-margin-top is calc(var(--header-height) + 1rem)', () => {
      const selectors = ['.resources h2', '.resources h3', '.resources h4'];

      // The selector is combined as ".resources h2,\n.resources h3,\n.resources h4"
      // so we look for the grouped rule
      const ruleRegex = /\.resources\s+h2[\s\S]*?\{([^}]+)\}/g;
      let found = false;

      // Parse the combined selector rule
      const combinedRegex =
        /\.resources\s+h2,\s*\n?\.resources\s+h3,\s*\n?\.resources\s+h4\s*\{([^}]+)\}/;
      const match = combinedRegex.exec(resourcesCss);

      if (match) {
        const body = match[1];
        const scrollMarginMatch = body.match(/scroll-margin-top\s*:\s*([^;]+);/);
        expect(scrollMarginMatch).not.toBeNull();
        expect(scrollMarginMatch[1].trim()).toBe('calc(var(--header-height) + 1rem)');
        found = true;
      }

      expect(found).toBe(true);
    });

    it('scroll-margin-top references --header-height token which equals 64px', () => {
      fc.assert(
        fc.property(fc.constant('--header-height'), (tokenName) => {
          const value = getTokenValue(tokenName);
          expect(value).toBe('64px');
        }),
        { numRuns: 1 }
      );
    });
  });

  describe('Requirement 3.1: Responsive font-size at 768px breakpoint', () => {
    /**
     * **Validates: Requirements 3.1**
     *
     * Property: At max-width: 768px, responsive padding and font-size
     * adjustments must continue to be defined as specified.
     */
    it('responsive .resources padding adjusts at 768px breakpoint', () => {
      const mediaDecls = getMediaQueryDeclarations(
        resourcesCss,
        'max-width: 768px',
        '.resources'
      );

      expect(mediaDecls['padding']).toBe('var(--space-lg) var(--space-md)');
      expect(mediaDecls['padding-top']).toBe('calc(var(--header-height) + var(--space-lg))');
    });

    it('responsive h1 font-size reduces at 768px breakpoint', () => {
      const mediaDecls = getMediaQueryDeclarations(
        resourcesCss,
        'max-width: 768px',
        '.resources h1'
      );
      expect(mediaDecls['font-size']).toBe('2rem');
    });

    it('responsive h2 font-size reduces at 768px breakpoint', () => {
      const mediaDecls = getMediaQueryDeclarations(
        resourcesCss,
        'max-width: 768px',
        '.resources h2'
      );
      expect(mediaDecls['font-size']).toBe('1.5rem');
    });

    it('responsive h3 font-size reduces at 768px breakpoint', () => {
      const mediaDecls = getMediaQueryDeclarations(
        resourcesCss,
        'max-width: 768px',
        '.resources h3'
      );
      expect(mediaDecls['font-size']).toBe('1.2rem');
    });

    it('font-size reductions are consistent across random viewport widths below 768px', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 768 }),
          (_viewportWidth) => {
            // The media query declarations are the same for all widths <= 768px
            const h1Decls = getMediaQueryDeclarations(
              resourcesCss,
              'max-width: 768px',
              '.resources h1'
            );
            const h2Decls = getMediaQueryDeclarations(
              resourcesCss,
              'max-width: 768px',
              '.resources h2'
            );
            const h3Decls = getMediaQueryDeclarations(
              resourcesCss,
              'max-width: 768px',
              '.resources h3'
            );
            expect(h1Decls['font-size']).toBe('2rem');
            expect(h2Decls['font-size']).toBe('1.5rem');
            expect(h3Decls['font-size']).toBe('1.2rem');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Requirement 3.6: List padding-left uses spacing tokens', () => {
    /**
     * **Validates: Requirements 3.6**
     *
     * Property: Lists within .resources use spacing tokens for padding-left.
     */
    it('list padding-left uses var(--space-lg)', () => {
      // Main lists
      const listDecls = getDeclarationsForSelector(resourcesCss, '.resources ul');
      expect(listDecls['padding-left']).toBe('var(--space-lg)');
    });

    it('nested list padding-left also uses var(--space-lg)', () => {
      const nestedDecls = getDeclarationsForSelector(resourcesCss, '.resources ul ul');
      expect(nestedDecls['padding-left']).toBe('var(--space-lg)');
    });

    it('TOC nested list padding-left uses var(--space-lg)', () => {
      const tocOlDecls = getDeclarationsForSelector(resourcesCss, '.toc__list ol');
      expect(tocOlDecls['padding-left']).toBe('var(--space-lg)');
    });
  });

  describe('Requirement 3.4: TOC structure preserved', () => {
    /**
     * **Validates: Requirements 3.4**
     *
     * Property: The TOC is rendered as a bordered, rounded container
     * with proper list formatting and link styling.
     */
    it('TOC has border, border-radius, padding, and margin declarations', () => {
      const tocDecls = getDeclarationsForSelector(resourcesCss, '.toc');

      expect(tocDecls['border']).toBe('1px solid var(--color-border)');
      expect(tocDecls['border-radius']).toBe('8px');
      expect(tocDecls['padding']).toBe('var(--space-md) var(--space-lg)');
      expect(tocDecls['margin-top']).toBe('var(--space-lg)');
      expect(tocDecls['margin-bottom']).toBe('var(--space-xl)');
    });

    it('TOC list has no list-style and zero padding-left', () => {
      const tocListDecls = getDeclarationsForSelector(resourcesCss, '.toc__list');

      expect(tocListDecls['list-style']).toBe('none');
      expect(tocListDecls['padding-left']).toBe('0');
    });

    it('HTML contains TOC navigation element with correct structure', () => {
      const toc = document.querySelector('.toc');
      expect(toc).not.toBeNull();
      expect(toc.tagName.toLowerCase()).toBe('nav');
      expect(toc.getAttribute('aria-label')).toBe('Table of Contents');

      const tocList = toc.querySelector('.toc__list');
      expect(tocList).not.toBeNull();
      expect(tocList.tagName.toLowerCase()).toBe('ol');
    });
  });

  describe('Requirement 3.5: Table wrapper overflow-x preserved', () => {
    /**
     * **Validates: Requirements 3.5**
     *
     * Property: .resources__table-wrapper provides horizontal scrolling
     * via overflow-x: auto for narrow viewports.
     */
    it('.resources__table-wrapper has overflow-x: auto', () => {
      const wrapperDecls = getDeclarationsForSelector(
        resourcesCss,
        '.resources__table-wrapper'
      );
      expect(wrapperDecls['overflow-x']).toBe('auto');
    });

    it('table wrapper overflow is defined regardless of viewport width', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1920 }),
          (_viewportWidth) => {
            const wrapperDecls = getDeclarationsForSelector(
              resourcesCss,
              '.resources__table-wrapper'
            );
            expect(wrapperDecls['overflow-x']).toBe('auto');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('HTML contains table-wrapper elements', () => {
      const wrappers = document.querySelectorAll('.resources__table-wrapper');
      expect(wrappers.length).toBeGreaterThan(0);
    });
  });

  describe('Requirement 3.3/3.6: Typography preserved (font-family, font-weight, line-height)', () => {
    /**
     * **Validates: Requirements 3.3, 3.6**
     *
     * Property: Typography declarations (font-family, font-weight, line-height)
     * on headings and text elements use the correct design tokens.
     */
    it('headings use --font-heading font-family', () => {
      const headingSelectors = ['.resources h1', '.resources h2', '.resources h3'];

      fc.assert(
        fc.property(fc.constantFrom(...headingSelectors), (selector) => {
          const decls = getDeclarationsForSelector(resourcesCss, selector);
          expect(decls['font-family']).toBe('var(--font-heading)');
        }),
        { numRuns: 20 }
      );
    });

    it('h1 has expected font-size and margin', () => {
      const h1Decls = getDeclarationsForSelector(resourcesCss, '.resources h1');
      expect(h1Decls['font-size']).toBe('2.5rem');
      expect(h1Decls['margin-bottom']).toBe('var(--space-sm)');
    });

    it('h2 has expected font-size and margins', () => {
      const h2Decls = getDeclarationsForSelector(resourcesCss, '.resources h2');
      expect(h2Decls['font-size']).toBe('1.75rem');
      expect(h2Decls['margin-top']).toBe('var(--space-xl)');
      expect(h2Decls['margin-bottom']).toBe('var(--space-md)');
    });

    it('h3 has expected font-size and margins', () => {
      const h3Decls = getDeclarationsForSelector(resourcesCss, '.resources h3');
      expect(h3Decls['font-size']).toBe('1.35rem');
      expect(h3Decls['margin-top']).toBe('var(--space-lg)');
      expect(h3Decls['margin-bottom']).toBe('var(--space-sm)');
    });

    it('strong elements use font-weight 600', () => {
      const strongDecls = getDeclarationsForSelector(resourcesCss, '.resources strong');
      expect(strongDecls['font-weight']).toBe('600');
    });

    it('.resources base line-height is 1.7', () => {
      const decls = getDeclarationsForSelector(resourcesCss, '.resources');
      expect(decls['line-height']).toBe('1.7');
    });

    it('pre code uses line-height 1.6 and font-size 0.875rem', () => {
      const preCodeDecls = getDeclarationsForSelector(resourcesCss, '.resources pre code');
      expect(preCodeDecls['line-height']).toBe('1.6');
      expect(preCodeDecls['font-size']).toBe('0.875rem');
    });
  });

  describe('Property-based: Layout tokens remain consistent across viewport widths', () => {
    /**
     * **Validates: Requirements 3.1, 3.6**
     *
     * Property: For ALL viewport widths between 320px and 1920px,
     * the layout and spacing token definitions in tokens.css remain
     * constant (they don't change with viewport).
     */
    it('spacing tokens are viewport-independent', () => {
      const spacingTokens = [
        '--space-xs',
        '--space-sm',
        '--space-md',
        '--space-lg',
        '--space-xl',
        '--space-2xl',
      ];
      const expectedValues = {
        '--space-xs': '0.25rem',
        '--space-sm': '0.5rem',
        '--space-md': '1rem',
        '--space-lg': '2rem',
        '--space-xl': '4rem',
        '--space-2xl': '6rem',
      };

      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1920 }),
          fc.constantFrom(...spacingTokens),
          (_viewportWidth, tokenName) => {
            // Token values are defined once in :root, unaffected by viewport
            const value = getTokenValue(tokenName);
            expect(value).toBe(expectedValues[tokenName]);
          }
        ),
        { numRuns: 200 }
      );
    });

    it('--max-width and --header-height are viewport-independent', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1920 }),
          (_viewportWidth) => {
            expect(getTokenValue('--max-width')).toBe('1200px');
            expect(getTokenValue('--header-height')).toBe('64px');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
