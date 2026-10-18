import { test, expect } from '@playwright/test';

test.describe('Skills Ledger E2E', () => {
  const viewports = [320, 375, 899, 900, 1200, 1440];

  for (const width of viewports) {
    test(`skills has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      const overflow = await page.evaluate(() => {
        const docOverflow =
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth;
        const section = document.querySelector('#skills');
        const rect = section.getBoundingClientRect();
        const sectionOverflow =
          rect.right > document.documentElement.clientWidth;
        return { docOverflow, sectionOverflow };
      });

      expect(overflow.docOverflow).toBe(false);
      expect(overflow.sectionOverflow).toBe(false);
    });
  }

  test('34 entries visible with identical typography across all entries', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const entryData = await page.evaluate(() => {
      const entries = Array.from(document.querySelectorAll('#skills .skills__entry'));
      const styles = entries.map((el) => {
        const cs = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const isVisible =
          rect.width > 0 &&
          rect.height > 0 &&
          cs.visibility !== 'hidden' &&
          cs.display !== 'none';
        return {
          isVisible,
          tuple: `${cs.fontFamily}|${cs.fontSize}|${cs.fontWeight}|${cs.color}`,
        };
      });

      const uniqueTuples = Array.from(new Set(styles.map((s) => s.tuple)));
      return {
        count: entries.length,
        allVisible: styles.every((s) => s.isVisible),
        uniqueTuples,
      };
    });

    expect(entryData.count).toBe(34);
    expect(entryData.allVisible).toBe(true);
    expect(entryData.uniqueTuples.length).toBe(1);
  });

  test('two columns at 900px and 1200px; one column at 899px and 375px', async ({ page }) => {
    // Two columns at 900px and 1200px
    for (const width of [900, 1200]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      const positions = await page.evaluate(() => {
        const entries = document.querySelectorAll('#skills .skills__entry');
        const r1 = entries[0].getBoundingClientRect();
        const r2 = entries[1].getBoundingClientRect();
        return {
          topDiff: Math.abs(r1.top - r2.top),
          leftDiff: Math.abs(r1.left - r2.left),
        };
      });

      expect(positions.topDiff, `At ${width}px, entries 1 and 2 should share top`).toBeLessThanOrEqual(2);
      expect(positions.leftDiff, `At ${width}px, entries 1 and 2 should differ in left`).toBeGreaterThan(50);
    }

    // One column at 899px and 375px
    for (const width of [899, 375]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      const positions = await page.evaluate(() => {
        const entries = document.querySelectorAll('#skills .skills__entry');
        const r1 = entries[0].getBoundingClientRect();
        const r2 = entries[1].getBoundingClientRect();
        return {
          topDiff: Math.abs(r1.top - r2.top),
          leftDiff: Math.abs(r1.left - r2.left),
        };
      });

      expect(positions.leftDiff, `At ${width}px, entries 1 and 2 should share left`).toBeLessThanOrEqual(2);
      expect(positions.topDiff, `At ${width}px, entries 1 and 2 should differ in top`).toBeGreaterThan(10);
    }
  });

  test('rules, brass segments, and zero box shadows in #skills', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const check = await page.evaluate(() => {
      const entries = Array.from(document.querySelectorAll('#skills .skills__entry'));
      const chapters = Array.from(document.querySelectorAll('#skills .skills__chapter'));

      const entryBorders = entries.map((el) => {
        const cs = window.getComputedStyle(el);
        return {
          topWidth: cs.borderTopWidth,
          topStyle: cs.borderTopStyle,
          topColor: cs.borderTopColor,
          bottomWidth: cs.borderBottomWidth,
          bottomStyle: cs.borderBottomStyle,
          bottomColor: cs.borderBottomColor,
          marginBottom: cs.marginBottom,
        };
      });

      const chapterBorders = chapters.map((el) => {
        const cs = window.getComputedStyle(el);
        return {
          width: cs.borderTopWidth,
          style: cs.borderTopStyle,
          color: cs.borderTopColor,
        };
      });

      const chapterBefores = chapters.map((el) => {
        const cs = window.getComputedStyle(el, '::before');
        return {
          width: cs.width,
          height: cs.height,
          backgroundColor: cs.backgroundColor,
        };
      });

      const allElements = Array.from(document.querySelectorAll('#skills, #skills *'));
      const elementsWithShadow = allElements.filter((el) => {
        const cs = window.getComputedStyle(el);
        return cs.boxShadow && cs.boxShadow !== 'none';
      }).length;

      return {
        entryBorders,
        chapterBorders,
        chapterBefores,
        elementsWithShadow,
      };
    });

    // Entry border-top and border-bottom are 1px solid rgb(221, 211, 191) with margin-bottom -1px
    for (const border of check.entryBorders) {
      expect(border.topWidth).toBe('1px');
      expect(border.topStyle).toBe('solid');
      expect(border.topColor).toBe('rgb(221, 211, 191)');
      expect(border.bottomWidth).toBe('1px');
      expect(border.bottomStyle).toBe('solid');
      expect(border.bottomColor).toBe('rgb(221, 211, 191)');
      expect(border.marginBottom).toBe('-1px');
    }

    // Chapter rule 1px solid rgb(27, 23, 18)
    for (const border of check.chapterBorders) {
      expect(border.width).toBe('1px');
      expect(border.style).toBe('solid');
      expect(border.color).toBe('rgb(27, 23, 18)');
    }

    // Chapter ::before is flush 48px × 1px brass rgb(185, 138, 31)
    for (const before of check.chapterBefores) {
      expect(before.width).toBe('48px');
      expect(before.height).toBe('1px');
      expect(before.backgroundColor).toBe('rgb(185, 138, 31)');
    }

    // No element in #skills has a box-shadow
    expect(check.elementsWithShadow).toBe(0);
  });

  test('long names do not overflow their column at 1200px or 320px', async ({ page }) => {
    const targetNames = ['Mentoring & Coaching', 'AI-native Architectures', 'gRPC'];

    for (const width of [1200, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      const overflowResults = await page.evaluate((names) => {
        const entries = Array.from(document.querySelectorAll('#skills .skills__entry'));
        return names.map((name) => {
          const el = entries.find((e) => e.textContent.trim() === name);
          if (!el) return { name, found: false };
          return {
            name,
            found: true,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
          };
        });
      }, targetNames);

      for (const res of overflowResults) {
        expect(res.found, `Entry "${res.name}" must exist`).toBe(true);
        expect(
          res.scrollWidth <= Math.ceil(res.clientWidth) + 1,
          `"${res.name}" at ${width}px: scrollWidth (${res.scrollWidth}) <= clientWidth (${res.clientWidth})`
        ).toBe(true);
      }
    }
  });

  test('nothing inside #skills is sticky', async ({ page }) => {
    for (const width of [375, 768, 1200]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      const stickyElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('#skills, #skills *'));
        return elements
          .filter((el) => window.getComputedStyle(el).position === 'sticky')
          .map((el) => el.className || el.tagName);
      });

      expect(stickyElements, `At ${width}px, no sticky elements should exist`).toHaveLength(0);
    }
  });

  test('no tabindex, focusable non-interactive elements, or data-animate in #skills', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const forbidden = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        '#skills [tabindex], #skills a, #skills button, #skills [data-animate]'
      );
      return elements.length;
    });
    expect(forbidden).toBe(0);
  });

  test('scroll-margin-top is set on #skills and chapter names to avoid header overlap', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const scrollMargins = await page.evaluate(() => {
      const section = document.querySelector('#skills');
      const chapterNames = Array.from(document.querySelectorAll('#skills .skills__chapter-name'));
      return {
        sectionScrollMargin: window.getComputedStyle(section).scrollMarginTop,
        chapterScrollMargins: chapterNames.map((el) => window.getComputedStyle(el).scrollMarginTop),
      };
    });

    expect(parseFloat(scrollMargins.sectionScrollMargin)).toBeGreaterThan(0);
    expect(scrollMargins.chapterScrollMargins.length).toBe(3);
    for (const sm of scrollMargins.chapterScrollMargins) {
      expect(parseFloat(sm)).toBeGreaterThan(0);
    }
  });
});
