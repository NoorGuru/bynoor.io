# Implementation Plan: LinkedIn Recommendations Section

## Overview

Add a "Recommendations" section to the bynoor.io portfolio site between the Skills and Connect sections. The implementation involves creating a new CSS file, inserting static HTML with two recommendation cards (blockquote semantics, LinkedIn badges, decorative blob), updating section accents on adjacent sections, and writing Playwright E2E tests for DOM structure verification.

## Tasks

- [x] 1. Create recommendations stylesheet and integrate with main.css
  - [x] 1.1 Create `src/styles/recommendations.css` with full component styles
    - Section container (`.recommendations`) with padding, background, relative positioning, overflow hidden
    - Container wrapper (`.recommendations__container`) with max-width and centering
    - Heading (`.recommendations__heading`) with gradient text fill matching highlights/skills pattern (Space Grotesk, clamp, bold, gradient-text)
    - Grid (`.recommendations__grid`) with CSS Grid — 1col mobile, 2col at 768px+ with `gap: var(--space-lg)`
    - Card (`.recommendations__card`) with glassmorphism: backdrop-filter, glass-bg, glass-border, border-radius 1rem, padding
    - Card hover state: translateY(-4px), enhanced box-shadow with tertiary neon glow, bg/border transitions
    - Quote (`.recommendations__quote`) with left-border accent (--accent-tertiary), quote styling, Inter font, 1.6 line-height
    - Attribution (`.recommendations__attribution`) as flex row with recommender info and LinkedIn badge
    - Name, title, relationship, date elements with appropriate text colors and sizing
    - LinkedIn badge (`.recommendations__linkedin-badge`) with SVG icon sizing, hover/focus states, visible focus indicator (2px outline offset)
    - `@supports not (backdrop-filter: blur(1px))` fallback with solid `--color-bg-elevated` background
    - Responsive media query at 768px for 2-column grid
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 6.4, 6.5, 7.6, 8.2_

  - [x] 1.2 Add `@import './recommendations.css'` to `src/styles/main.css`
    - Insert between the `skills.css` and `highlights.css` imports
    - _Requirements: 8.1_

- [x] 2. Add recommendations HTML section to index.html
  - [x] 2.1 Insert the recommendations section markup between Skills and Connect sections
    - Add `<hr class="section-divider" aria-hidden="true">` before the section
    - Add `<section id="recommendations" class="recommendations" aria-labelledby="recommendations-heading" data-section-accent="tertiary">`
    - Add decorative blob: `<div class="decorative-blob decorative-blob--tertiary" data-parallax="0.25" aria-hidden="true"></div>`
    - Add container with `data-animate-stagger="100"`
    - Add `<h2 id="recommendations-heading" class="recommendations__heading">Recommendations</h2>`
    - Add recommendations grid with two article cards
    - Card 1 (Aamer Abbas): blockquote with full quote text, footer with name/title/relationship/date, LinkedIn badge anchor with inline SVG icon and `aria-label="View Aamer Abbas's LinkedIn profile"`
    - Card 2 (Nagarajan Raju): blockquote with full quote text, footer with name/title/relationship/date, LinkedIn badge anchor with inline SVG icon and `aria-label="View Nagarajan Raju's LinkedIn profile"`
    - Both cards have `data-animate="fade-up"` attribute
    - Both LinkedIn badge anchors have `target="_blank"` and `rel="noopener"`
    - Add closing `<hr class="section-divider" aria-hidden="true">` after the section
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.3, 6.4, 7.1, 7.2, 7.3, 7.5, 8.1, 8.3_

  - [x] 2.2 Update the Connect section's `data-section-accent` from `"tertiary"` to `"quaternary"`
    - The recommendations section now takes the tertiary accent
    - _Requirements: 1.4_

- [x] 3. Checkpoint - Verify visual rendering
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Write E2E tests for the recommendations section
  - [ ]* 4.1 Create `tests/e2e/recommendations.spec.js` with DOM structure tests
    - Test: section exists with `id="recommendations"`, `aria-labelledby="recommendations-heading"`, and `data-section-accent="tertiary"`
    - Test: heading h2 with text "Recommendations" exists inside section
    - Test: exactly two recommendation cards (article elements) exist within the grid
    - Test: each card contains a blockquote with non-empty text content
    - Test: each card contains a footer with recommender name, title, relationship, and date
    - Test: both LinkedIn badge links have correct hrefs (`/in/abbasaamer/` and `/in/nagarajanraju/`), `target="_blank"`, `rel="noopener"`, and non-empty `aria-label`
    - Test: decorative blob has `aria-hidden="true"` and `data-parallax` attribute
    - Test: section appears after skills section and before connect section in DOM order
    - Test: animation attributes (`data-animate="fade-up"` on cards, `data-animate-stagger="100"` on container)
    - **Validates: Requirements 1.1, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 5.2, 5.3, 6.4, 7.1, 7.2, 7.3, 7.5**

  - [ ]* 4.2 Add responsive layout tests to `tests/e2e/recommendations.spec.js`
    - Test: at 375px viewport width, grid computed style shows single column
    - Test: at 768px viewport width, grid computed style shows two columns
    - **Validates: Requirements 2.6, 2.7, 4.1, 4.2**

  - [ ]* 4.3 Add accessibility test for the recommendations section
    - Test: axe-core audit passes on the recommendations section (integrate with existing accessibility.spec.js pattern)
    - Test: LinkedIn badges are keyboard-focusable
    - **Validates: Requirements 7.1, 7.3, 7.4, 7.5, 7.6**

- [ ] 5. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- No new JavaScript files are needed — the existing animation engine handles `data-animate` and `data-parallax` attributes automatically
- The LinkedIn SVG icon is inline (no external requests), matching the pattern used in the hero social links
- All content is hardcoded from `noor-data.md` — no dynamic data fetching
- The `@supports` CSS fallback ensures graceful degradation for browsers without `backdrop-filter`
- The Connect section accent shift from "tertiary" to "quaternary" ensures no accent collision with the new section

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3"] }
  ]
}
```
