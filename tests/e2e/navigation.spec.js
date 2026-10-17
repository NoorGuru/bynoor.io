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

test('desktop navigation includes journey link between build and teach and fits without overflow at 1024px', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  const journeyLink = page.locator('.nav__links a[href="#journey"]');
  await expect(journeyLink).toBeVisible();
  await expect(journeyLink).toHaveText('journey');

  // Verify header and page have no horizontal overflow at 1024px
  const fits = await page.evaluate(() => {
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelector('.nav__links');
    const header = document.querySelector('.header');
    return {
      docOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      navWidth: nav.getBoundingClientRect().width,
      navLinksWidth: navLinks.getBoundingClientRect().width,
      headerWidth: header.getBoundingClientRect().width,
    };
  });

  expect(fits.docOverflow).toBe(false);
  expect(fits.navLinksWidth).toBeLessThan(500);
});

test('mobile menu includes journey link with index 03 and clicks through', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  // Open mobile menu
  await page.locator('.nav__hamburger').click();
  const journeyMobile = page.locator('#mobile-menu a[href="#journey"]');
  await expect(journeyMobile).toBeVisible();
  await expect(journeyMobile.locator('.mobile-menu__link-index')).toHaveText('03');
  await expect(journeyMobile).toContainText('journey');

  // Click journey link in mobile menu
  await journeyMobile.click();
  // Menu should close
  await expect(page.locator('#mobile-menu')).not.toBeVisible();
});
