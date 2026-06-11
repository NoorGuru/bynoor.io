# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.js >> nav links hidden by default on mobile, shown after hamburger click
- Location: tests/e2e/navigation.spec.js:21:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.nav__hamburger')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('hamburger menu is visible below 768px', async ({ page }) => {
  4  |   await page.setViewportSize({ width: 375, height: 667 });
  5  |   await page.goto('/');
  6  |   await page.waitForLoadState('networkidle');
  7  | 
  8  |   const hamburger = page.locator('.nav__hamburger');
  9  |   await expect(hamburger).toBeVisible();
  10 | });
  11 | 
  12 | test('hamburger menu is hidden at 768px and above', async ({ page }) => {
  13 |   await page.setViewportSize({ width: 768, height: 1024 });
  14 |   await page.goto('/');
  15 |   await page.waitForLoadState('networkidle');
  16 | 
  17 |   const hamburger = page.locator('.nav__hamburger');
  18 |   await expect(hamburger).toBeHidden();
  19 | });
  20 | 
  21 | test('nav links hidden by default on mobile, shown after hamburger click', async ({ page }) => {
  22 |   await page.setViewportSize({ width: 375, height: 667 });
  23 |   await page.goto('/');
  24 |   await page.waitForLoadState('networkidle');
  25 | 
  26 |   const navLinks = page.locator('#nav-links');
  27 | 
  28 |   // Nav links should be visually hidden on mobile by default
  29 |   await expect(navLinks).not.toBeVisible();
  30 | 
  31 |   // Click hamburger to open menu
  32 |   const hamburger = page.locator('.nav__hamburger');
> 33 |   await hamburger.click();
     |                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
  34 | 
  35 |   // Nav links should now be visible
  36 |   await expect(navLinks).toBeVisible();
  37 | });
  38 | 
```