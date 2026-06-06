import { test, expect } from '@playwright/test';

const viewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1200, height: 900 },
  { width: 2560, height: 1440 },
];

for (const vp of viewports) {
  test(`no horizontal overflow at ${vp.width}px viewport`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasOverflow).toBe(false);
  });
}
