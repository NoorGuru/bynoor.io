import { test, expect } from '@playwright/test';

test.describe('Skills Ledger E2E', () => {
  const viewports = [320, 375, 899, 900, 1200, 1440];

  for (const width of viewports) {
    test(`skills has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

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

  test('34 items visible, all sharing one computed font signature', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const result = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('#skills .skills__item'));
      const signatures = items.map((el) => {
        const cs = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const isVisible =
          rect.width > 0 &&
          rect.height > 0 &&
          cs.visibility !== 'hidden' &&
          cs.display !== 'none';
        return {
          isVisible,
          signature: `${cs.fontFamily}|${cs.fontSize}|${cs.fontWeight}|${cs.fontStyle}`,
        };
      });

      return {
        count: items.length,
        allVisible: signatures.every((s) => s.isVisible),
        uniqueSignatures: Array.from(new Set(signatures.map((s) => s.signature))),
      };
    });

    expect(result.count).toBe(34);
    expect(result.allVisible).toBe(true);
    expect(result.uniqueSignatures.length).toBe(1);
  });

  test('two columns at 900px and 1200px; one column at 899px and 375px', async ({ page }) => {
    for (const width of [900, 1200]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      const positions = await page.evaluate(() => {
        const rows = document.querySelectorAll('#skills .skills__row');
        const r1 = rows[0].getBoundingClientRect();
        const r2 = rows[1].getBoundingClientRect();
        return {
          topDiff: Math.abs(r1.top - r2.top),
          leftDiff: Math.abs(r1.left - r2.left),
        };
      });

      expect(positions.topDiff, `At ${width}px, rows 1 and 2 should share top`).toBeLessThanOrEqual(2);
      expect(positions.leftDiff, `At ${width}px, rows 1 and 2 should differ in left`).toBeGreaterThan(50);
    }

    for (const width of [899, 375]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      const positions = await page.evaluate(() => {
        const rows = document.querySelectorAll('#skills .skills__row');
        const r1 = rows[0].getBoundingClientRect();
        const r2 = rows[1].getBoundingClientRect();
        return {
          topDiff: Math.abs(r1.top - r2.top),
          leftDiff: Math.abs(r1.left - r2.left),
        };
      });

      expect(positions.leftDiff, `At ${width}px, rows 1 and 2 should share left`).toBeLessThanOrEqual(2);
      expect(positions.topDiff, `At ${width}px, rows 1 and 2 should differ in top`).toBeGreaterThan(10);
    }
  });

  test('every item except the last in its row has a ::after with content middot and color rgb(38, 81, 56); last item has no ::after', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const check = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#skills .skills__row'));
      const results = [];

      for (const row of rows) {
        const items = Array.from(row.querySelectorAll('.skills__item'));
        items.forEach((item, index) => {
          const isLast = index === items.length - 1;
          const cs = window.getComputedStyle(item, '::after');
          results.push({
            text: item.textContent.trim(),
            isLast,
            content: cs.content,
            color: cs.color,
          });
        });
      }

      return results;
    });

    expect(check.length).toBe(34);
    for (const item of check) {
      if (item.isLast) {
        expect(item.content === 'none' || item.content === '""' || !item.content).toBe(true);
      } else {
        expect(item.content.includes('·')).toBe(true);
        expect(item.color).toBe('rgb(38, 81, 56)');
      }
    }
  });

  test('separator never opens a line at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const check = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#skills .skills__row'));
      const results = [];

      for (const row of rows) {
        const items = Array.from(row.querySelectorAll('.skills__item'));
        const itemInfo = items.map((item, idx) => {
          const rects = Array.from(item.getClientRects());
          const isLast = idx === items.length - 1;

          const range = document.createRange();
          range.selectNodeContents(item.firstChild || item);
          const textRects = Array.from(range.getClientRects());

          return {
            text: item.textContent.trim(),
            isLast,
            rects: rects.map((r) => ({ left: r.left, top: r.top, width: r.width, height: r.height })),
            textRects: textRects.map((r) => ({ left: r.left, top: r.top, width: r.width, height: r.height })),
          };
        });

        const lines = [];
        for (const info of itemInfo) {
          const top = info.rects[0]?.top ?? 0;
          let line = lines.find((l) => Math.abs(l.top - top) <= 4);
          if (!line) {
            line = { top, items: [] };
            lines.push(line);
          }
          line.items.push(info);
        }

        for (const line of lines) {
          line.items.sort((a, b) => a.rects[0].left - b.rects[0].left);
        }

        results.push({
          lines,
          itemInfo,
        });
      }

      return results;
    });

    for (const r of check) {
      for (const item of r.itemInfo) {
        expect(item.rects.length).toBeGreaterThan(0);
        expect(item.textRects.length).toBeGreaterThan(0);
        expect(Math.abs(item.rects[0].left - item.textRects[0].left)).toBeLessThanOrEqual(1);
      }

      for (const line of r.lines) {
        expect(line.items.length).toBeGreaterThan(0);
        const first = line.items[0];
        expect(first.text.startsWith('·')).toBe(false);
      }
    }
  });

  test('row rule stops short: ::before width is clientWidth - 32 at >=900px, and clientWidth - 20 at 320px', async ({ page }) => {
    for (const width of [1200, 900]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      const check = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#skills .skills__row'));
        return rows.map((row) => {
          const beforeStyle = window.getComputedStyle(row, '::before');
          const beforeWidth = parseFloat(beforeStyle.width);
          const expectedWidth = row.clientWidth - 32;
          return {
            clientWidth: row.clientWidth,
            beforeWidth,
            expectedWidth,
            diff: Math.abs(beforeWidth - expectedWidth),
          };
        });
      });

      for (const r of check) {
        expect(r.diff, `At ${width}px, ::before width should equal clientWidth - 32`).toBeLessThanOrEqual(1);
      }
    }

    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const check320 = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#skills .skills__row'));
      return rows.map((row) => {
        const beforeStyle = window.getComputedStyle(row, '::before');
        const beforeWidth = parseFloat(beforeStyle.width);
        const expectedWidth = row.clientWidth - 20;
        return {
          clientWidth: row.clientWidth,
          beforeWidth,
          expectedWidth,
          diff: Math.abs(beforeWidth - expectedWidth),
        };
      });
    });

    for (const r of check320) {
      expect(r.diff, 'At 320px, ::before width should equal clientWidth - 20').toBeLessThanOrEqual(1);
    }
  });

  test('gutter fold exists only at >=900px', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const desktopCheck = await page.evaluate(() => {
      const ledgers = Array.from(document.querySelectorAll('#skills .skills__ledger'));
      return ledgers.map((ledger) => {
        const cs = window.getComputedStyle(ledger, '::before');
        return {
          width: cs.width,
          height: parseFloat(cs.height),
          content: cs.content,
        };
      });
    });

    expect(desktopCheck.length).toBe(3);
    for (const check of desktopCheck) {
      expect(check.width).toBe('1px');
      expect(check.height).toBeGreaterThan(0);
    }

    for (const width of [899, 375]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      const mobileCheck = await page.evaluate(() => {
        const ledgers = Array.from(document.querySelectorAll('#skills .skills__ledger'));
        return ledgers.map((ledger) => {
          const cs = window.getComputedStyle(ledger, '::before');
          return {
            content: cs.content,
          };
        });
      });

      expect(mobileCheck.length).toBe(3);
      for (const check of mobileCheck) {
        expect(check.content === 'none' || check.content === '""' || !check.content).toBe(true);
      }
    }
  });

  test('no box-shadow in #skills, nothing sticky, no tabindex, no data-animate, no focusable elements', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const check = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('#skills, #skills *'));

      const elementsWithShadow = allElements.filter((el) => {
        const cs = window.getComputedStyle(el);
        return cs.boxShadow && cs.boxShadow !== 'none';
      }).length;

      const stickyElements = allElements.filter((el) => {
        return window.getComputedStyle(el).position === 'sticky';
      }).length;

      const forbiddenInteractive = document.querySelectorAll(
        '#skills [tabindex], #skills a, #skills button, #skills input, #skills select, #skills textarea, #skills [data-animate]'
      ).length;

      return {
        elementsWithShadow,
        stickyElements,
        forbiddenInteractive,
      };
    });

    expect(check.elementsWithShadow).toBe(0);
    expect(check.stickyElements).toBe(0);
    expect(check.forbiddenInteractive).toBe(0);
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
