import { test, expect } from '@playwright/test';

test('hamburger menu is visible below 768px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500); // settle entrance animations (YouTube embeds keep network alive, so networkidle never settles)

  const hamburger = page.locator('.nav__hamburger');
  await expect(hamburger).toBeVisible();
});

test('hamburger menu is hidden at 768px and above', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500); // settle entrance animations (YouTube embeds keep network alive, so networkidle never settles)

  const hamburger = page.locator('.nav__hamburger');
  await expect(hamburger).toBeHidden();
});

test('overlay menu opens and closes on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500); // settle entrance animations (YouTube embeds keep network alive, so networkidle never settles)

  const overlay = page.locator('#mobile-menu');

  // Overlay hidden by default on mobile
  await expect(overlay).not.toBeVisible();

  // Click hamburger to open the single overlay menu
  await page.locator('.nav__hamburger').click();
  await expect(overlay).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/menu-open/);

  // Click hamburger again to close
  await page.locator('.nav__hamburger').click();
  await expect(overlay).not.toBeVisible();
});
