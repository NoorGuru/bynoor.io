import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Skills Ledger Source Text Verification', () => {
  const homeCssPath = resolve(__dirname, '../../src/styles/home.css');
  const indexAstroPath = resolve(__dirname, '../../src/pages/index.astro');

  const homeCss = readFileSync(homeCssPath, 'utf-8');
  const indexAstro = readFileSync(indexAstroPath, 'utf-8');

  const skillsBlockStart = homeCss.indexOf('/* === Skills:');
  const skillsBlockEnd = homeCss.indexOf('/* === Recommendations:');
  const skillsBlock = homeCss.slice(skillsBlockStart, skillsBlockEnd);

  const deletedSelectors = [
    'skills__entry',
    'skills__entry--token',
    'skills__entry--linked',
    'skills__entry--phrase',
    'skills__entry--code',
    'skills__stack',
    'skills__layer',
    'skills__layer-content',
    'skills__layer-label',
    'skills__layer-num',
    'skills__layer-title',
    'skills__layer-proof',
    'skills__meta',
    'skills__core',
    'skills__core-item',
    'skills__cap',
    'skills__tag',
    'skills__index',
    'skills__index-label',
    'skills__index-list',
    'skills__index-item',
    'skills__connector',
    'skills__connector-line',
    'skills__connector-label',
    'skills__feeds',
    'skills__token',
    'skills__layer-tokens',
    'skills__layer-accent',
    'skills__chapter-head',
  ];

  it('none of the deleted selectors appear in home.css or index.astro', () => {
    deletedSelectors.forEach((selector) => {
      expect(homeCss, `home.css should not contain ${selector}`).not.toContain(selector);
      expect(indexAstro, `index.astro should not contain ${selector}`).not.toContain(selector);
    });
  });

  it('asserts vertical writing mode and rotate transform on .skills__chapter-name at desktop (>=900px)', () => {
    expect(skillsBlock).toMatch(/@media\s*\(min-width:\s*900px\)\s*\{[\s\S]*\.skills__chapter-name\s*\{[^}]*writing-mode:\s*vertical-rl;/);
    expect(skillsBlock).toMatch(/@media\s*\(min-width:\s*900px\)\s*\{[\s\S]*\.skills__chapter-name\s*\{[^}]*transform:\s*rotate\(180deg\);/);
    expect(skillsBlock).toMatch(/\.skills__chapter-name\s*\{[^}]*white-space:\s*nowrap;/);
  });

  it('asserts chapter name font-size clamp', () => {
    expect(skillsBlock).toMatch(/clamp\(2\.4rem,\s*3\.2vw,\s*3rem\)/);
  });

  it('asserts border-top: 1px solid var(--ink) on .skills__chapter', () => {
    expect(skillsBlock).toMatch(/\.skills__chapter\s*\{[^}]*border-top:\s*1px solid var\(--ink\);/);
  });

  it('asserts 48px x 3px brass segment on the chapter rule', () => {
    expect(skillsBlock).toMatch(/\.skills__chapter::before\s*\{[^}]*width:\s*48px;/);
    expect(skillsBlock).toMatch(/\.skills__chapter::before\s*\{[^}]*height:\s*3px;/);
    expect(skillsBlock).toMatch(/\.skills__chapter::before\s*\{[^}]*background:\s*var\(--brass\);/);
  });

  it('asserts ledger and row borders with no right inset tricks', () => {
    expect(skillsBlock).toMatch(/\.skills__ledger\s*\{[^}]*border-bottom:\s*1px solid var\(--line\);/);
    expect(skillsBlock).toMatch(/\.skills__row\s*\{[^}]*border-top:\s*1px solid var\(--line\);/);
    expect(skillsBlock).not.toContain('right: 2rem');
    expect(skillsBlock).not.toContain('right: 1.25rem');
    expect(skillsBlock).not.toContain('.skills__row::before');
    expect(skillsBlock).not.toContain('.skills__row::after');
  });

  it('asserts pine middot separator on .skills__item:not(:last-child)::after', () => {
    expect(skillsBlock).toMatch(/\.skills__item:not\(:last-child\)::after\s*\{[^}]*content:\s*["']\\00B7["'];/);
    expect(skillsBlock).toMatch(/\.skills__item:not\(:last-child\)::after\s*\{[^}]*color:\s*var\(--pine\);/);
    expect(skillsBlock).toMatch(/\.skills__item:not\(:last-child\)::after\s*\{[^}]*font-weight:\s*700;/);
    expect(skillsBlock).toMatch(/\.skills__item:not\(:last-child\)::after\s*\{[^}]*margin-inline:\s*0\.55rem;/);
  });

  it('has exactly one min-width media query and it is 900px', () => {
    const minWidthMatches = skillsBlock.match(/@media\s*\(\s*min-width:\s*[^)]+\)/g) || [];
    expect(minWidthMatches).toEqual(['@media (min-width: 900px)']);
    expect(skillsBlock).toContain('repeat(2, minmax(0, 1fr))');
  });

  it('has no position: sticky, columns:, or column-count in the skills block', () => {
    expect(skillsBlock).not.toContain('position: sticky');
    expect(skillsBlock).not.toContain('sticky');
    expect(skillsBlock).not.toMatch(/(?<![\w-])columns\s*:/);
    expect(skillsBlock).not.toContain('column-count');
  });

  it('has scroll-margin-top on #skills', () => {
    expect(skillsBlock).toMatch(/#skills\s*\{[^}]*scroll-margin-top:\s*calc\(var\(--header-h\)\s*\+\s*1\.5rem\);/);
  });

  it('index.astro contains exactly 3 spines, 3 bodies, 12 skills rows, and 34 skills items', () => {
    const spineMatches = indexAstro.match(/class="skills__spine"/g) || [];
    expect(spineMatches.length).toBe(3);

    const bodyMatches = indexAstro.match(/class="skills__body"/g) || [];
    expect(bodyMatches.length).toBe(3);

    const rowMatches = indexAstro.match(/class="skills__row"/g) || [];
    expect(rowMatches.length).toBe(12);

    const itemMatches = indexAstro.match(/class="skills__item"/g) || [];
    expect(itemMatches.length).toBe(34);
  });
});
