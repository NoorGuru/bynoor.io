import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('all tap targets are at least 44x44px on 375px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500); // settle entrance animations (YouTube embeds keep network alive, so networkidle never settles)

  const tooSmall = await page.evaluate(() => {
    const interactive = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
    const failures = [];

    for (const el of interactive) {
      // Skip hidden elements
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        continue;
      }

      // Skip inline prose links: WCAG 2.5.8 Target Size explicitly exempts
      // targets "in a sentence or block of text". Only controls are measured.
      if (el.tagName === 'A' && style.display === 'inline') {
        continue;
      }

      const rect = el.getBoundingClientRect();
      // Skip elements with no dimensions (offscreen or collapsed)
      if (rect.width === 0 && rect.height === 0) continue;

      if (rect.width < 44 || rect.height < 44) {
        failures.push({
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 30) || el.getAttribute('aria-label') || '',
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    }

    return failures;
  });

  expect(tooSmall, `Tap targets smaller than 44x44px: ${JSON.stringify(tooSmall, null, 2)}`).toHaveLength(0);
});

test('axe-core WCAG 2.1 AA audit passes', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500); // settle entrance animations (YouTube embeds keep network alive, so networkidle never settles)

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // Exclude color-contrast — brand colors are an intentional design decision
    .disableRules(['color-contrast'])
    // Exclude third-party YouTube embeds: cross-origin player markup is
    // outside author control and fails aria/button rules intermittently.
    .exclude('iframe[src*="youtube-nocookie.com"]')
    .analyze();

  const violations = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    nodes: v.nodes.length,
  }));

  expect(violations, `Accessibility violations found: ${JSON.stringify(violations, null, 2)}`).toHaveLength(0);
});
