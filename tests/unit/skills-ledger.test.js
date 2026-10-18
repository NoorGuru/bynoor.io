import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Skills Ledger Source Text Verification', () => {
  const homeCssPath = resolve(__dirname, '../../src/styles/home.css');
  const indexAstroPath = resolve(__dirname, '../../src/pages/index.astro');

  const homeCss = readFileSync(homeCssPath, 'utf-8');
  const indexAstro = readFileSync(indexAstroPath, 'utf-8');

  const skillsBlockStart = homeCss.indexOf('/* === Skills: THE LEDGER === */');
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
  ];

  it('none of the deleted selectors appear in home.css or index.astro', () => {
    deletedSelectors.forEach((selector) => {
      expect(homeCss, `home.css should not contain ${selector}`).not.toContain(selector);
      expect(indexAstro, `index.astro should not contain ${selector}`).not.toContain(selector);
    });
  });

  it('.skills__row::after has width: 1.5rem, height: 3px, and background: var(--brass)', () => {
    expect(skillsBlock).toMatch(/\.skills__row::after\s*\{[^}]*width:\s*1\.5rem;/);
    expect(skillsBlock).toMatch(/\.skills__row::after\s*\{[^}]*height:\s*3px;/);
    expect(skillsBlock).toMatch(/\.skills__row::after\s*\{[^}]*background:\s*var\(--brass\);/);
  });

  it('.skills__row::before has right: 2rem inset stop and 1px line background', () => {
    expect(skillsBlock).toMatch(/\.skills__row::before\s*\{[^}]*right:\s*2rem;/);
    expect(skillsBlock).toMatch(/\.skills__row::before\s*\{[^}]*height:\s*1px;/);
    expect(skillsBlock).toMatch(/\.skills__row::before\s*\{[^}]*background:\s*var\(--line\);/);
  });

  it('has gutter rule and brass cap at min-width: 900px', () => {
    expect(skillsBlock).toMatch(/@media\s*\(min-width:\s*900px\)\s*\{[\s\S]*\.skills__ledger::before\s*\{[^}]*left:\s*50%;[^}]*width:\s*1px;[^}]*background:\s*var\(--line\);/);
    expect(skillsBlock).toMatch(/@media\s*\(min-width:\s*900px\)\s*\{[\s\S]*\.skills__ledger::after\s*\{[^}]*left:\s*calc\(50%\s*-\s*1px\);[^}]*width:\s*3px;[^}]*height:\s*1\.5rem;[^}]*background:\s*var\(--brass\);/);
  });

  it('has pine separator on .skills__item:not(:last-child)::after', () => {
    expect(skillsBlock).toMatch(/\.skills__item:not\(:last-child\)::after\s*\{[^}]*content:\s*["']\\00B7["'];/);
    expect(skillsBlock).toMatch(/\.skills__item:not\(:last-child\)::after\s*\{[^}]*color:\s*var\(--pine\);/);
    expect(skillsBlock).toMatch(/\.skills__item:not\(:last-child\)::after\s*\{[^}]*font-weight:\s*700;/);
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

  it('has scroll-margin-top on #skills and .skills__chapter-name', () => {
    expect(skillsBlock).toMatch(/#skills\s*\{[^}]*scroll-margin-top:\s*calc\(var\(--header-h\)\s*\+\s*1\.5rem\);/);
    expect(skillsBlock).toMatch(/\.skills__chapter-name\s*\{[^}]*scroll-margin-top:\s*calc\(var\(--header-h\)\s*\+\s*1\.5rem\);/);
  });

  it('index.astro contains exactly 14 skills rows and 34 skills items', () => {
    const rowMatches = indexAstro.match(/class="skills__row"/g) || [];
    expect(rowMatches.length).toBe(14);

    const itemMatches = indexAstro.match(/class="skills__item"/g) || [];
    expect(itemMatches.length).toBe(34);
  });
});
