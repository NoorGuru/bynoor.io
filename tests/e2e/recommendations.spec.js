import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// --- DOM Structure Tests ---
// Current design: pull-quote cards with expandable quotes and attribution.

test.describe('Recommendations - DOM Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500); // settle entrance animations (YouTube embeds keep network alive, so networkidle never settles)
  });

  test('section exists with correct id, aria-labelledby, and data-section-accent', async ({ page }) => {
    const section = page.locator('section#recommendations');
    await expect(section).toHaveAttribute('aria-labelledby', 'recommendations-heading');
    await expect(section).toHaveAttribute('data-section-accent', 'tertiary');
  });

  test('heading h2 with text "What People Say" exists inside section', async ({ page }) => {
    const heading = page.locator('#recommendations h2#recommendations-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('What People Say');
  });

  test('exactly two recommendation cards (article elements) exist within the grid', async ({ page }) => {
    const cards = page.locator('#recommendations .recommendations__grid article.recommendations__card');
    await expect(cards).toHaveCount(2);
  });

  test('each card contains a blockquote with non-empty text content', async ({ page }) => {
    const blockquotes = page.locator('#recommendations .recommendations__card blockquote.recommendations__quote');
    await expect(blockquotes).toHaveCount(2);

    for (let i = 0; i < 2; i++) {
      const text = await blockquotes.nth(i).textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('each card contains attribution with name, title, and context', async ({ page }) => {
    const footers = page.locator('#recommendations .recommendations__card footer.recommendations__attribution');
    await expect(footers).toHaveCount(2);

    for (let i = 0; i < 2; i++) {
      const footer = footers.nth(i);
      const name = footer.locator('.recommendations__name');
      const title = footer.locator('.recommendations__title');
      const context = footer.locator('.recommendations__context');

      await expect(name).toBeVisible();
      await expect(title).toBeVisible();
      await expect(context).toBeVisible();

      expect((await name.textContent()).trim().length).toBeGreaterThan(0);
      expect((await title.textContent()).trim().length).toBeGreaterThan(0);
      expect((await context.textContent()).trim().length).toBeGreaterThan(0);
    }
  });

  test('each card has an expand toggle with aria-expanded and label', async ({ page }) => {
    const toggles = page.locator('#recommendations .recommendations__toggle');
    await expect(toggles).toHaveCount(2);

    for (let i = 0; i < 2; i++) {
      const toggle = toggles.nth(i);
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      const label = await toggle.getAttribute('aria-label');
      expect(label).toBeTruthy();
      expect(label.length).toBeGreaterThan(0);
    }
  });

  test('LinkedIn badge links have correct hrefs, target, rel, and aria-label', async ({ page }) => {
    const badges = page.locator('#recommendations .recommendations__linkedin-badge');
    await expect(badges).toHaveCount(2);

    for (let i = 0; i < 2; i++) {
      const badge = badges.nth(i);
      await expect(badge).toHaveAttribute('href', 'https://www.linkedin.com/in/mohnoor94/details/recommendations');
      await expect(badge).toHaveAttribute('target', '_blank');
      await expect(badge).toHaveAttribute('rel', 'noopener');
      const ariaLabel = await badge.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel.length).toBeGreaterThan(0);
    }
  });

  test('section appears after skills section and before connect section in DOM order', async ({ page }) => {
    const sections = page.locator('main section, body section');
    const allSections = await sections.all();
    const ids = await Promise.all(allSections.map((s) => s.getAttribute('id')));

    const skillsIndex = ids.indexOf('skills');
    const recommendationsIndex = ids.indexOf('recommendations');
    const connectIndex = ids.indexOf('links');

    expect(skillsIndex).toBeGreaterThanOrEqual(0);
    expect(recommendationsIndex).toBeGreaterThanOrEqual(0);
    expect(connectIndex).toBeGreaterThanOrEqual(0);
    expect(recommendationsIndex).toBeGreaterThan(skillsIndex);
    expect(recommendationsIndex).toBeLessThan(connectIndex);
  });

  test('animation attributes: data-animate on cards', async ({ page }) => {
    const cards = page.locator('#recommendations .recommendations__card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toHaveAttribute('data-animate', 'fade-up');
    }
  });
});

// --- Accessibility Tests ---

test.describe('Recommendations - Accessibility', () => {
  test('axe-core WCAG 2.1 AA audit passes on recommendations section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500); // settle entrance animations (YouTube embeds keep network alive, so networkidle never settles)

    const results = await new AxeBuilder({ page })
      .include('#recommendations')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const violations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.length,
    }));

    expect(violations, `Accessibility violations in recommendations section: ${JSON.stringify(violations, null, 2)}`).toHaveLength(0);
  });

  test('LinkedIn badges are keyboard-focusable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500); // settle entrance animations (YouTube embeds keep network alive, so networkidle never settles)

    const badges = page.locator('#recommendations .recommendations__linkedin-badge');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const badge = badges.nth(i);
      await badge.focus();
      await expect(badge).toBeFocused();
    }
  });

  test('expand toggles are keyboard-focusable and labelled', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500); // settle entrance animations (YouTube embeds keep network alive, so networkidle never settles)

    const toggles = page.locator('#recommendations .recommendations__toggle');
    const count = await toggles.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const toggle = toggles.nth(i);
      await toggle.focus();
      await expect(toggle).toBeFocused();
    }
  });
});
