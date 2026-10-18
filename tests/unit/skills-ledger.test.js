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

  it('.skills__entry has font-size: 1rem, border-top/bottom 1px solid var(--line), and margin-bottom: -1px', () => {
    expect(skillsBlock).toMatch(/\.skills__entry\s*\{[^}]*font-size:\s*1rem;/);
    expect(skillsBlock).toMatch(/\.skills__entry\s*\{[^}]*border-top:\s*1px solid var\(--line\);/);
    expect(skillsBlock).toMatch(/\.skills__entry\s*\{[^}]*border-bottom:\s*1px solid var\(--line\);/);
    expect(skillsBlock).toMatch(/\.skills__entry\s*\{[^}]*margin-bottom:\s*-1px;/);
  });

  it('.skills__ledger has no border-bottom', () => {
    expect(skillsBlock).not.toMatch(/\.skills__ledger\s*\{[^}]*border-bottom:/);
  });

  it('has exactly one ledger breakpoint at @media (min-width: 900px) containing repeat(2, minmax(0, 1fr)) and column-gap: 4.5rem', () => {
    const minWidthMatches = skillsBlock.match(/@media\s*\(\s*min-width:\s*[^)]+\)/g) || [];
    expect(minWidthMatches).toEqual(['@media (min-width: 900px)']);
    expect(skillsBlock).toContain('repeat(2, minmax(0, 1fr))');
    expect(skillsBlock).toContain('column-gap: 4.5rem');
  });

  it('has scroll-margin-top on #skills and .skills__chapter-name', () => {
    expect(skillsBlock).toMatch(/#skills\s*\{[^}]*scroll-margin-top:\s*calc\(var\(--header-h\)\s*\+\s*1\.5rem\);/);
    expect(skillsBlock).toMatch(/\.skills__chapter-name\s*\{[^}]*scroll-margin-top:\s*calc\(var\(--header-h\)\s*\+\s*1\.5rem\);/);
  });

  it('has no position: sticky, columns:, or column-count in the skills block', () => {
    expect(skillsBlock).not.toContain('position: sticky');
    expect(skillsBlock).not.toContain('sticky');
    expect(skillsBlock).not.toMatch(/(?<![\w-])columns\s*:/);
    expect(skillsBlock).not.toContain('column-count');
  });

  it('index.astro contains exactly 34 occurrences of class="skills__entry"', () => {
    const entryMatches = indexAstro.match(/class="skills__entry"/g) || [];
    expect(entryMatches.length).toBe(34);
  });
});
