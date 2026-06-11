# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.js >> axe-core WCAG 2.1 AA audit passes
- Location: tests/e2e/accessibility.spec.js:40:1

# Error details

```
Error: Accessibility violations found: [
  {
    "id": "document-title",
    "impact": "serious",
    "description": "Ensure each HTML document contains a non-empty <title> element",
    "nodes": 1
  },
  {
    "id": "html-has-lang",
    "impact": "serious",
    "description": "Ensure every HTML document has a lang attribute",
    "nodes": 1
  }
]

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 2
Received array:  [{"description": "Ensure each HTML document contains a non-empty <title> element", "id": "document-title", "impact": "serious", "nodes": 1}, {"description": "Ensure every HTML document has a lang attribute", "id": "html-has-lang", "impact": "serious", "nodes": 1}]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | 
  4  | test('all tap targets are at least 44x44px on 375px viewport', async ({ page }) => {
  5  |   await page.setViewportSize({ width: 375, height: 667 });
  6  |   await page.goto('/');
  7  |   await page.waitForLoadState('networkidle');
  8  | 
  9  |   const tooSmall = await page.evaluate(() => {
  10 |     const interactive = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
  11 |     const failures = [];
  12 | 
  13 |     for (const el of interactive) {
  14 |       // Skip hidden elements
  15 |       const style = window.getComputedStyle(el);
  16 |       if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
  17 |         continue;
  18 |       }
  19 | 
  20 |       const rect = el.getBoundingClientRect();
  21 |       // Skip elements with no dimensions (offscreen or collapsed)
  22 |       if (rect.width === 0 && rect.height === 0) continue;
  23 | 
  24 |       if (rect.width < 44 || rect.height < 44) {
  25 |         failures.push({
  26 |           tag: el.tagName,
  27 |           text: el.textContent?.trim().slice(0, 30) || el.getAttribute('aria-label') || '',
  28 |           width: Math.round(rect.width),
  29 |           height: Math.round(rect.height),
  30 |         });
  31 |       }
  32 |     }
  33 | 
  34 |     return failures;
  35 |   });
  36 | 
  37 |   expect(tooSmall, `Tap targets smaller than 44x44px: ${JSON.stringify(tooSmall, null, 2)}`).toHaveLength(0);
  38 | });
  39 | 
  40 | test('axe-core WCAG 2.1 AA audit passes', async ({ page }) => {
  41 |   await page.goto('/');
  42 |   await page.waitForLoadState('networkidle');
  43 | 
  44 |   const results = await new AxeBuilder({ page })
  45 |     .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  46 |     // Exclude color-contrast — brand colors are an intentional design decision
  47 |     .disableRules(['color-contrast'])
  48 |     .analyze();
  49 | 
  50 |   const violations = results.violations.map((v) => ({
  51 |     id: v.id,
  52 |     impact: v.impact,
  53 |     description: v.description,
  54 |     nodes: v.nodes.length,
  55 |   }));
  56 | 
> 57 |   expect(violations, `Accessibility violations found: ${JSON.stringify(violations, null, 2)}`).toHaveLength(0);
     |                                                                                                ^ Error: Accessibility violations found: [
  58 | });
  59 | 
```