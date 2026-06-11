import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// --- DOM Structure Tests ---
// Validates: Requirements 1.1, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 5.2, 5.3, 6.4, 7.1, 7.2, 7.3, 7.5

test.describe('Recommendations - DOM Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('section exists with correct id, aria-labelledby, and data-section-accent', async ({ page }) => {
    const section = page.locator('section#recommendations');
    await expect(section).toHaveAttribute('aria-labelledby', 'recommendations-heading');
    await expect(section).toHaveAttribute('data-section-accent', 'tertiary');
  });

  test('heading h2 with text "Recommendations" exists inside section', async ({ page }) => {
    const heading = page.locator('#recommendations h2#recommendations-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Recommendations');
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

  test('each card contains a footer with recommender name, title, relationship, and date', async ({ page }) => {
    const footers = page.locator('#recommendations .recommendations__card footer.recommendations__attribution');
    await expect(footers).toHaveCount(2);

    for (let i = 0; i < 2; i++) {
      const footer = footers.nth(i);
      const name = footer.locator('.recommendations__name');
      const title = footer.locator('.recommendations__title');
      const relationship = footer.locator('.recommendations__relationship');
      const date = footer.locator('.recommendations__date');

      await expect(name).toBeVisible();
      await expect(title).toBeVisible();
      await expect(relationship).toBeVisible();
      await expect(date).toBeVisible();

      expect((await name.textContent()).trim().length).toBeGreaterThan(0);
      expect((await title.textContent()).trim().length).toBeGreaterThan(0);
      expect((await relationship.textContent()).trim().length).toBeGreaterThan(0);
      expect((await date.textContent()).trim().length).toBeGreaterThan(0);
    }
  });

  test('LinkedIn badge links have correct hrefs, target, rel, and aria-label', async ({ page }) => {
    const badges = page.locator('#recommendations .recommendations__linkedin-badge');
    await expect(badges).toHaveCount(2);

    // Card 1: Aamer Abbas
    const badge1 = badges.nth(0);
    await expect(badge1).toHaveAttribute('href', 'https://www.linkedin.com/in/abbasaamer/');
    await expect(badge1).toHaveAttribute('target', '_blank');
    await expect(badge1).toHaveAttribute('rel', 'noopener');
    const ariaLabel1 = await badge1.getAttribute('aria-label');
    expect(ariaLabel1).toBeTruthy();
    expect(ariaLabel1.length).toBeGreaterThan(0);

    // Card 2: Nagarajan Raju
    const badge2 = badges.nth(1);
    await expect(badge2).toHaveAttribute('href', 'https://www.linkedin.com/in/nagarajanraju/');
    await expect(badge2).toHaveAttribute('target', '_blank');
    await expect(badge2).toHaveAttribute('rel', 'noopener');
    const ariaLabel2 = await badge2.getAttribute('aria-label');
    expect(ariaLabel2).toBeTruthy();
    expect(ariaLabel2.length).toBeGreaterThan(0);
  });

  test('decorative blob has aria-hidden="true" and data-parallax attribute', async ({ page }) => {
    const blob = page.locator('#recommendations .decorative-blob');
    await expect(blob).toHaveAttribute('aria-hidden', 'true');
    const parallax = await blob.getAttribute('data-parallax');
    expect(parallax).not.toBeNull();
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

  test('animation attributes: data-animate on cards, data-animate-stagger on container', async ({ page }) => {
    const cards = page.locator('#recommendations .recommendations__card');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toHaveAttribute('data-animate', 'fade-up');
    }

    const container = page.locator('#recommendations .recommendations__container');
    await expect(container).toHaveAttribute('data-animate-stagger', '100');
  });
});

// --- Accessibility Tests ---
// Validates: Requirements 7.1, 7.3, 7.4, 7.5, 7.6

test.describe('Recommendations - Accessibility', () => {
  test('axe-core WCAG 2.1 AA audit passes on recommendations section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

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
    await page.waitForLoadState('networkidle');

    const badges = page.locator('#recommendations .recommendations__linkedin-badge');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const badge = badges.nth(i);
      await badge.focus();
      await expect(badge).toBeFocused();
    }
  });
});
