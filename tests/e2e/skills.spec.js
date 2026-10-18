import { test, expect } from '@playwright/test';

test.describe('Skills Section E2E', () => {
  test('skills has no horizontal overflow at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

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

  test('longest core capability wraps instead of overflowing at 320px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const capMetrics = await page.evaluate(() => {
      const caps = Array.from(
        document.querySelectorAll('#skills .skills__cap')
      );
      const target = caps.find((el) =>
        el.textContent.includes('AI-native Architectures')
      );
      if (!target) return null;
      const computed = window.getComputedStyle(target);
      const fontSize = parseFloat(computed.fontSize);
      const lineHeight = parseFloat(computed.lineHeight) || fontSize * 1.2;
      const height = target.getBoundingClientRect().height;
      return {
        scrollWidth: target.scrollWidth,
        clientWidth: target.clientWidth,
        height,
        lineHeight,
      };
    });

    expect(capMetrics).not.toBeNull();
    expect(capMetrics.scrollWidth).toBeLessThanOrEqual(
      capMetrics.clientWidth
    );
    expect(capMetrics.height).toBeGreaterThanOrEqual(capMetrics.lineHeight * 0.9);
  });

  test('meta is sticky on desktop and static on mobile', async ({ page }) => {
    // Mobile check at 375px
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const mobilePosition = await page.evaluate(() => {
      const meta = document.querySelector('#skills .skills__meta');
      return window.getComputedStyle(meta).position;
    });
    expect(mobilePosition).toBe('static');

    // Tablet check at 768px
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const tabletPosition = await page.evaluate(() => {
      const meta = document.querySelector('#skills .skills__meta');
      return window.getComputedStyle(meta).position;
    });
    expect(tabletPosition).toBe('sticky');

    // Desktop check at 1200px
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Scroll the architect layer so its sticky meta activates
    await page.evaluate(() => {
      const layer = document.querySelector(
        '#skills [aria-labelledby="skills-layer-architect"]'
      );
      const top = window.scrollY + layer.getBoundingClientRect().top;
      window.scrollTo({ top: top + 150, behavior: 'instant' });
    });
    await page.waitForTimeout(300);

    const desktopMeta = await page.evaluate(() => {
      const architectMeta = document.querySelector(
        '#skills [aria-labelledby="skills-layer-architect"] .skills__meta'
      );
      const style = window.getComputedStyle(architectMeta);
      const rect = architectMeta.getBoundingClientRect();
      return {
        position: style.position,
        top: Math.round(rect.top),
      };
    });

    expect(desktopMeta.position).toBe('sticky');
    expect(Math.abs(desktopMeta.top - 88)).toBeLessThanOrEqual(2);
  });

  test('lead stratum carries the 2px brass cap and build/architect carry 1px ink rules', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const styles = await page.evaluate(() => {
      const build = document.querySelector('#skills .skills__layer--build');
      const architect = document.querySelector('#skills .skills__layer--architect');
      const lead = document.querySelector('#skills .skills__layer--lead');

      const buildStyle = window.getComputedStyle(build);
      const architectStyle = window.getComputedStyle(architect);
      const leadStyle = window.getComputedStyle(lead);

      return {
        buildWidth: buildStyle.borderTopWidth,
        architectWidth: architectStyle.borderTopWidth,
        leadWidth: leadStyle.borderTopWidth,
        leadColor: leadStyle.borderTopColor,
      };
    });

    expect(styles.buildWidth).toBe('1px');
    expect(styles.architectWidth).toBe('1px');
    expect(styles.leadWidth).toBe('2px');
    expect(styles.leadColor).toBe('rgb(138, 100, 20)');
  });

  test('no tabindex or focusable non-interactive elements in skills', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const skillsBadElements = await page.evaluate(() => {
      const forbidden = document.querySelectorAll(
        '#skills [tabindex], #skills a, #skills button'
      );
      return forbidden.length;
    });
    expect(skillsBadElements).toBe(0);

    // Scroll skills into view and tab through
    await page.locator('#skills').scrollIntoViewIfNeeded();

    const focusedElementsInSkills = [];
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const focusedClass = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        if (el.closest('#skills')) {
          return {
            tagName: el.tagName,
            className: el.className,
          };
        }
        return null;
      });
      if (focusedClass) {
        focusedElementsInSkills.push(focusedClass);
      }
    }

    expect(focusedElementsInSkills).toHaveLength(0);
  });

  test('skills section matches measure at 1440px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const m = await page.evaluate(() => {
      const skills = document.querySelector('#skills');
      const container = document.querySelector('#skills .skills__container');

      const sRect = skills.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      const cStyle = window.getComputedStyle(container);

      const cLeft = cRect.left + parseFloat(cStyle.paddingLeft);
      const cRight = cRect.right - parseFloat(cStyle.paddingRight);

      return {
        skillsLeft: Math.round(sRect.left),
        skillsRight: Math.round(sRect.right),
        skillsWidth: Math.round(sRect.width),
        containerContentLeft: Math.round(cLeft),
        containerContentRight: Math.round(cRight),
        containerContentWidth: Math.round(cRight - cLeft),
      };
    });

    expect(m.skillsLeft).toBe(144);
    expect(m.skillsRight).toBe(1296);
    expect(m.skillsWidth).toBe(1152);
    expect(m.containerContentLeft).toBe(176);
    expect(m.containerContentRight).toBe(1264);
    expect(m.containerContentWidth).toBe(1088);
  });

  test('no inline feeds spans exist in meta and gap connectors have high contrast pine styling', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const check = await page.evaluate(() => {
      const inlineFeeds = document.querySelectorAll('#skills .skills__feeds');
      const metas = Array.from(document.querySelectorAll('#skills .skills__meta'));
      const metaHasFeeds = metas.some((m) => m.textContent.toLowerCase().includes('feeds'));

      const connectors = Array.from(document.querySelectorAll('#skills .skills__connector'));
      const connectorLines = Array.from(document.querySelectorAll('#skills .skills__connector-line'));
      const lineStyles = connectorLines.map((line) => {
        const style = window.getComputedStyle(line);
        return {
          width: style.width,
          backgroundColor: style.backgroundColor,
        };
      });

      return {
        inlineFeedsCount: inlineFeeds.length,
        metaHasFeeds,
        connectorsCount: connectors.length,
        lineStyles,
      };
    });

    expect(check.inlineFeedsCount).toBe(0);
    expect(check.metaHasFeeds).toBe(false);
    expect(check.connectorsCount).toBe(2);
    for (const style of check.lineStyles) {
      expect(style.width).toBe('2px');
      expect(style.backgroundColor).toBe('rgb(38, 81, 56)');
    }
  });
});
