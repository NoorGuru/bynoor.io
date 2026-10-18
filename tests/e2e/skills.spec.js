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

  test("at 1200px each chapter name's right edge is left of the proof's left edge (the hang), and chapter name and ledger share a left edge", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const positions = await page.evaluate(() => {
      const chapters = Array.from(document.querySelectorAll('#skills .skills__chapter'));
      return chapters.map((ch) => {
        const name = ch.querySelector('.skills__chapter-name').getBoundingClientRect();
        const proof = ch.querySelector('.skills__chapter-proof').getBoundingClientRect();
        const ledger = ch.querySelector('.skills__ledger').getBoundingClientRect();
        return {
          hang: name.right < proof.left,
          nameRight: name.right,
          proofLeft: proof.left,
          nameLeft: name.left,
          ledgerLeft: ledger.left,
        };
      });
    });

    expect(positions.length).toBe(3);
    for (const p of positions) {
      expect(p.hang, `Chapter name right edge (${p.nameRight}) should be left of proof left edge (${p.proofLeft})`).toBe(true);
      expect(Math.abs(p.nameLeft - p.ledgerLeft), 'Chapter name and ledger should share a left edge').toBeLessThanOrEqual(2);
    }
  });

  test('at 899px and below the chapter name sits above the proof and both share a left edge', async ({ page }) => {
    for (const width of [899, 375]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      const positions = await page.evaluate(() => {
        const chapters = Array.from(document.querySelectorAll('#skills .skills__chapter'));
        return chapters.map((ch) => {
          const name = ch.querySelector('.skills__chapter-name').getBoundingClientRect();
          const proof = ch.querySelector('.skills__chapter-proof').getBoundingClientRect();
          return {
            above: name.bottom <= proof.top + 2,
            nameBottom: name.bottom,
            proofTop: proof.top,
            leftDiff: Math.abs(name.left - proof.left),
          };
        });
      });

      expect(positions.length).toBe(3);
      for (const p of positions) {
        expect(p.above, `At ${width}px, chapter name bottom (${p.nameBottom}) should sit above proof top (${p.proofTop})`).toBe(true);
        expect(p.leftDiff, `At ${width}px, chapter name and proof should share a left edge`).toBeLessThanOrEqual(2);
      }
    }
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

  test('every item except the last in its row has an ::after with content middot and color rgb(38, 81, 56); last item has none', async ({ page }) => {
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

  test('no box-shadow inside #skills; nothing sticky; no [tabindex], no data-animate, no focusable elements', async ({ page }) => {
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

  test('#skills anchor navigation leaves the heading visible below the fixed header', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/#skills');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const check = await page.evaluate(() => {
      const heading = document.querySelector('#skills-heading');
      const header = document.querySelector('header');
      const headingRect = heading.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      return {
        headingTop: headingRect.top,
        headerBottom: headerRect.bottom,
        visibleBelowHeader: headingRect.top >= headerRect.bottom,
      };
    });

    expect(check.visibleBelowHeader).toBe(true);
    expect(check.headingTop).toBeGreaterThanOrEqual(check.headerBottom);
  });
});
