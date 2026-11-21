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

test('desktop navigation fits without overflow at 1024px', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  const workLink = page.locator('.nav__links a[href="#projects"]');
  await expect(workLink).toBeVisible();
  await expect(workLink).toHaveText('Work');

  const teachLink = page.locator('.nav__links a[href="#teach"]');
  await expect(teachLink).toBeVisible();
  await expect(teachLink).toHaveText('Teaching');

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

test('mobile menu includes Teaching link with index 04 and clicks through', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  // Open mobile menu
  await page.locator('.nav__hamburger').click();
  const teachMobile = page.locator('#mobile-menu a[href="#teach"]');
  await expect(teachMobile).toBeVisible();
  await expect(teachMobile.locator('.mobile-menu__link-index')).toHaveText('04');
  await expect(teachMobile).toContainText('Teaching');

  // Click teach link in mobile menu
  await teachMobile.click();
  // Menu should close
  await expect(page.locator('#mobile-menu')).not.toBeVisible();
});

test('desktop More dropdown displays and navigates to Technical Interview Preparation Kit', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  const moreTrigger = page.locator('.nav__dropdown-trigger');
  await expect(moreTrigger).toBeVisible();

  // Click More trigger to open dropdown
  await moreTrigger.click();
  const prepKitItem = page.locator('.nav__dropdown-menu a[href="/technical-interview-preparation-kit/"]');
  await expect(prepKitItem).toBeVisible();

  await prepKitItem.click();
  await page.waitForURL('**/technical-interview-preparation-kit/**');
  await expect(page).toHaveURL(/technical-interview-preparation-kit/);
});

test('desktop More dropdown lists bynoor ecosystem sites', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  const moreTrigger = page.locator('.nav__dropdown-trigger');
  await moreTrigger.click();

  const auraLink = page.locator('.nav__dropdown-menu a[href="https://aura.bynoor.io"]');
  const nebulaLink = page.locator('.nav__dropdown-menu a[href="https://nebula.bynoor.io"]');
  const presentLink = page.locator('.nav__dropdown-menu a[href="https://present.bynoor.io"]');
  const voidLink = page.locator('.nav__dropdown-menu a[href="https://void.bynoor.io"]');

  await expect(auraLink).toBeVisible();
  await expect(nebulaLink).toBeVisible();
  await expect(presentLink).toBeVisible();
  await expect(voidLink).toBeVisible();
});

test('mobile More accordion expands and navigates to Technical Interview Preparation Kit', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  // Open mobile menu
  await page.locator('.nav__hamburger').click();
  const moreTrigger = page.locator('.mobile-menu__accordion-trigger');
  await expect(moreTrigger).toBeVisible();

  // Click More accordion
  await moreTrigger.click();
  const prepKitSublink = page.locator('.mobile-menu__drawer a[href="/technical-interview-preparation-kit/"]');
  await expect(prepKitSublink).toBeVisible();

  await prepKitSublink.click();
  await page.waitForURL('**/technical-interview-preparation-kit/**');
  await expect(page).toHaveURL(/technical-interview-preparation-kit/);
});
