import { test, expect } from '@playwright/test';

test('hamburger menu is visible below 768px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const hamburger = page.locator('.nav__hamburger');
  await expect(hamburger).toBeVisible();
});

test('hamburger menu is hidden at 768px and above', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const hamburger = page.locator('.nav__hamburger');
  await expect(hamburger).toBeHidden();
});

test('nav links hidden by default on mobile, shown after hamburger click', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const navLinks = page.locator('#nav-links');

  // Nav links should be visually hidden on mobile by default
  await expect(navLinks).not.toBeVisible();

  // Click hamburger to open menu
  const hamburger = page.locator('.nav__hamburger');
  await hamburger.click();

  // Nav links should now be visible
  await expect(navLinks).toBeVisible();
});
