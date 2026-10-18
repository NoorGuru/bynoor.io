import { test, expect } from '@playwright/test';

test('animations not applied when prefers-reduced-motion is set', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500); // settle entrance animations (YouTube embeds keep network alive, so networkidle never settles)

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
    '.ledger__row',
    '.links__world',
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

test('journey rail is fully drawn with no transform under reduced motion', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  const journeyState = await page.evaluate(() => {
    const entries = Array.from(document.querySelectorAll('#journey .journey__entry'));
    return entries.map((entry) => {
      const isFeatured = entry.classList.contains('journey__entry--featured');
      const isLit = entry.classList.contains('journey__entry--lit');
      const transform = window.getComputedStyle(entry).transform;
      const node = entry.querySelector('.journey__node');
      const nodeBg = node ? window.getComputedStyle(node).backgroundColor : null;
      return {
        isFeatured,
        isLit,
        transform,
        nodeBg,
      };
    });
  });

  expect(journeyState.length).toBeGreaterThan(0);
  for (const entry of journeyState) {
    expect(entry.isLit).toBe(true);
    expect(entry.transform === 'none' || entry.transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);
    if (entry.isFeatured) {
      expect(entry.nodeBg).toBe('rgb(138, 100, 20)');
    } else {
      expect(entry.nodeBg).toBe('rgb(38, 81, 56)');
    }
  }

  await context.close();
});

test('skills chapters are fully visible with no transform under reduced motion', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  const getSkillsState = async () => {
    return await page.evaluate(() => {
      const chapters = Array.from(document.querySelectorAll('#skills .skills__chapter'));
      return chapters.map((chapter) => {
        const style = window.getComputedStyle(chapter);
        return {
          opacity: style.opacity,
          transform: style.transform,
        };
      });
    });
  };

  const beforeScroll = await getSkillsState();
  expect(beforeScroll.length).toBe(3);
  for (const chapter of beforeScroll) {
    expect(chapter.opacity).toBe('1');
    expect(chapter.transform === 'none' || chapter.transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);
  }

  await page.locator('#skills').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const afterScroll = await getSkillsState();
  expect(afterScroll.length).toBe(3);
  for (const chapter of afterScroll) {
    expect(chapter.opacity).toBe('1');
    expect(chapter.transform === 'none' || chapter.transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);
  }

  await context.close();
});


