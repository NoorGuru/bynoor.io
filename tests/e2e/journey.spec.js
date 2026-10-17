import { test, expect } from '@playwright/test';

test.describe('Journey Section E2E', () => {
  test('journey has no horizontal overflow at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const overflow = await page.evaluate(() => {
      const docOverflow =
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth;
      const section = document.querySelector('#journey');
      const rect = section.getBoundingClientRect();
      const sectionOverflow =
        rect.right > document.documentElement.clientWidth;
      return { docOverflow, sectionOverflow };
    });

    expect(overflow.docOverflow).toBe(false);
    expect(overflow.sectionOverflow).toBe(false);
  });

  test('longest role title wraps instead of overflowing at 320px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const titleMetrics = await page.evaluate(() => {
      const titles = Array.from(
        document.querySelectorAll('#journey .journey__role-title')
      );
      const target = titles.find((el) =>
        el.textContent.includes('Partner Developer Experience')
      );
      if (!target) return null;
      const computed = window.getComputedStyle(target);
      const fontSize = parseFloat(computed.fontSize);
      const lineHeight = parseFloat(computed.lineHeight) || fontSize * 1.3;
      const height = target.getBoundingClientRect().height;
      return {
        scrollWidth: target.scrollWidth,
        clientWidth: target.clientWidth,
        height,
        lineHeight,
        wraps: height > lineHeight * 1.2,
      };
    });

    expect(titleMetrics).not.toBeNull();
    expect(titleMetrics.scrollWidth).toBeLessThanOrEqual(
      titleMetrics.clientWidth
    );
    expect(titleMetrics.wraps).toBe(true);
  });

  test('meta is sticky on desktop and static on mobile', async ({ page }) => {
    // Mobile check at 375px
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const mobilePosition = await page.evaluate(() => {
      const meta = document.querySelector('#journey .journey__meta');
      return window.getComputedStyle(meta).position;
    });
    expect(mobilePosition).toBe('static');

    // Desktop check at 1200px
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Scroll the Amazon act so its sticky meta activates
    await page.evaluate(() => {
      const act = document.querySelector(
        '#journey [aria-labelledby="journey-company-amazon"]'
      );
      const top = window.scrollY + act.getBoundingClientRect().top;
      window.scrollTo({ top: top + 150, behavior: 'instant' });
    });
    await page.waitForTimeout(300);

    const desktopMeta = await page.evaluate(() => {
      const amazonMeta = document.querySelector(
        '#journey [aria-labelledby="journey-company-amazon"] .journey__meta'
      );
      const style = window.getComputedStyle(amazonMeta);
      const rect = amazonMeta.getBoundingClientRect();
      return {
        position: style.position,
        top: Math.round(rect.top),
      };
    });

    expect(desktopMeta.position).toBe('sticky');
    expect(Math.abs(desktopMeta.top - 88)).toBeLessThanOrEqual(2);
  });

  test('rail fill progresses and nodes light on scroll at desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Scroll the first Expedia entry into middle of viewport
    const firstEntry = page.locator('#journey .journey__entry--featured');
    await firstEntry.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      window.scrollBy(0, 150);
    });
    await page.waitForTimeout(500);

    const entryState = await page.evaluate(() => {
      const featured = document.querySelector(
        '#journey .journey__entry--featured'
      );
      const entries = featured.closest('.journey__entries');
      const allEntries = Array.from(entries.querySelectorAll('.journey__entry'));
      const featuredNode = featured.querySelector('.journey__node');
      const secondEntry = allEntries[1];
      const secondNode = secondEntry?.querySelector('.journey__node');

      return {
        featuredLit: featured.classList.contains('journey__entry--lit'),
        featuredNodeBg: window.getComputedStyle(featuredNode).backgroundColor,
        secondLit: secondEntry?.classList.contains('journey__entry--lit'),
        secondNodeBg: secondNode
          ? window.getComputedStyle(secondNode).backgroundColor
          : null,
        progress: parseFloat(
          entries.style.getPropertyValue('--journey-progress') || '0'
        ),
      };
    });

    expect(entryState.featuredLit).toBe(true);
    expect(entryState.featuredNodeBg).toBe('rgb(138, 100, 20)');
    expect(entryState.progress).toBeGreaterThan(0);
  });

  test('throughline spans wider than the rail content column', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const metrics = await page.evaluate(() => {
      const throughline = document.querySelector(
        '#journey .journey__throughline'
      );
      const entries = document.querySelector('#journey .journey__entries');
      const style = window.getComputedStyle(throughline);
      return {
        throughlineWidth: throughline.getBoundingClientRect().width,
        entriesWidth: entries.getBoundingClientRect().width,
        borderTopWidth: style.borderTopWidth,
      };
    });

    expect(metrics.throughlineWidth).toBeGreaterThan(metrics.entriesWidth);
    expect(metrics.borderTopWidth).toBe('2px');
  });

  test('no tabindex or focusable non-interactive elements in journey', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const journeyBadElements = await page.evaluate(() => {
      const forbidden = document.querySelectorAll(
        '#journey [tabindex], #journey .journey__entry[tabindex], #journey .journey__tag[tabindex], #journey .journey__node[tabindex], #journey a, #journey button'
      );
      return forbidden.length;
    });
    expect(journeyBadElements).toBe(0);

    // Scroll journey into view and tab through
    await page.locator('#journey').scrollIntoViewIfNeeded();

    const focusedElementsInJourney = [];
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const focusedClass = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        if (el.closest('#journey')) {
          return {
            tagName: el.tagName,
            className: el.className,
          };
        }
        return null;
      });
      if (focusedClass) {
        focusedElementsInJourney.push(focusedClass);
      }
    }

    expect(focusedElementsInJourney).toHaveLength(0);
  });

  test('journey section, container content, and throughline match measure at 1440px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const m = await page.evaluate(() => {
      const journey = document.querySelector('#journey');
      const container = document.querySelector('#journey .journey__container');
      const throughline = document.querySelector('#journey .journey__throughline');
      const act = document.querySelector('#journey .journey__act');
      const actCompany = act?.querySelector('.journey__company');
      const throughlineCompany = throughline?.querySelector('.journey__company');

      const jRect = journey.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      const cStyle = window.getComputedStyle(container);
      const tRect = throughline.getBoundingClientRect();

      const cLeft = cRect.left + parseFloat(cStyle.paddingLeft);
      const cRight = cRect.right - parseFloat(cStyle.paddingRight);

      return {
        journeyLeft: Math.round(jRect.left),
        journeyRight: Math.round(jRect.right),
        journeyWidth: Math.round(jRect.width),
        containerContentLeft: Math.round(cLeft),
        containerContentRight: Math.round(cRight),
        containerContentWidth: Math.round(cRight - cLeft),
        throughlineLeft: Math.round(tRect.left),
        throughlineRight: Math.round(tRect.right),
        throughlineWidth: Math.round(tRect.width),
        actCompanyLeft: actCompany ? Math.round(actCompany.getBoundingClientRect().left) : null,
        throughlineCompanyLeft: throughlineCompany ? Math.round(throughlineCompany.getBoundingClientRect().left) : null,
      };
    });

    expect(m.journeyLeft).toBe(144);
    expect(m.journeyRight).toBe(1296);
    expect(m.journeyWidth).toBe(1152);
    expect(m.containerContentLeft).toBe(176);
    expect(m.containerContentRight).toBe(1264);
    expect(m.containerContentWidth).toBe(1088);
    expect(m.throughlineLeft).toBe(144);
    expect(m.throughlineRight).toBe(1296);
    expect(m.throughlineWidth).toBe(1152);
    expect(m.throughlineCompanyLeft).toBe(m.actCompanyLeft);
    expect(m.throughlineCompanyLeft).toBe(m.containerContentLeft);
    expect(m.throughlineCompanyLeft).toBe(176);
  });
});
