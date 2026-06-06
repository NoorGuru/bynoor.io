import { test, expect } from '@playwright/test';

test('animations not applied when prefers-reduced-motion is set', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Scroll to trigger animation observer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  // Check that elements with data-animate don't have transform-based animations
  const hasTransformAnimations = await page.evaluate(() => {
    const animatedElements = document.querySelectorAll('[data-animate]');
    for (const el of animatedElements) {
      const style = window.getComputedStyle(el);
      const transform = style.transform;
      // 'none' or matrix identity means no visual transform applied
      if (transform && transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
        return true;
      }
    }
    return false;
  });

  expect(hasTransformAnimations).toBe(false);

  // Also verify hover transforms are disabled on interactive elements
  const hoverSelectors = [
    '.hero__btn--primary',
    '.hero__social-link',
    '.highlights__card',
    '.link-card',
    '.project-card',
  ];

  for (const selector of hoverSelectors) {
    const el = page.locator(selector).first();
    if (await el.isVisible()) {
      await el.hover();
      const transform = await el.evaluate((node) => {
        return window.getComputedStyle(node).transform;
      });
      expect(
        transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)',
        `${selector} should not have transform on hover with reduced motion, got: ${transform}`
      ).toBe(true);
    }
  }

  await context.close();
});
