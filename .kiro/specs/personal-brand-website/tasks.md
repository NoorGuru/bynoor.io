# Implementation Plan: Personal Brand Website

## Overview

Rebuild bynoor.io from a Hugo-based blog into a modern static personal brand website using Vite + vanilla HTML/CSS/JS. The site consists of two pages: a landing page with Hero, Highlights, Skills, Connect, and Projects sections, and a Resources page for the Technical Interview Preparation Kit. The build outputs static assets to `dist/` for GitHub Pages deployment at bynoor.io.

## Tasks

- [x] 1. Clean workspace and set up project structure
  - [x] 1.1 Remove old Hugo files and initialize new Vite project
    - Remove old Hugo directories and files: `config.yaml`, `content/` (EXCEPT preserve `content/technical-interview-preparation-kit/index.md` as reference), `layouts/`, `archetypes/`, `assets/`, `themes/`, `.gitmodules`
    - Keep: `static/CNAME`, `static/favicon*`, `static/android-chrome*`, `static/apple-touch-icon*`, `profile-pic.png`, `.github/`, `README.md`
    - Create `package.json` with Vite, Vitest as dev dependencies
    - Create `vite.config.js` with multi-page build configuration:
      - Input: `index.html` (root) + `technical-interview-preparation-kit/index.html`
      - Output: `dist/` with content-hashed asset filenames
    - Create `public/` folder and move static assets into it: `CNAME` (containing "bynoor.io"), favicon files, `profile-pic.png`
    - Add scripts: `dev`, `build`, `preview`, `test`
    - Run `npm install` to verify setup, `npm run build` to verify empty build works
    - _Requirements: 11.1, 11.4_

  - [x] 1.2 Set up CSS architecture with design tokens and font loading
    - Create `src/styles/tokens.css` with ALL CSS Custom Properties from design document:
      - Colors: `--color-primary` (#6366f1), `--color-primary-hover` (#4f46e5), `--color-secondary` (#06b6d4), `--color-accent` (#f59e0b), `--color-bg` (#fafafa), `--color-bg-section` (#ffffff), `--color-text` (#1e293b), `--color-text-secondary` (#475569), `--color-border` (#e2e8f0)
      - Skill pill colors: `--skill-languages-bg` (hsl(210,70%,42%)), `--skill-technologies-bg` (hsl(150,60%,35%)), `--skill-expertise-bg` (hsl(30,80%,40%)), `--skill-leadership-bg` (hsl(330,65%,42%)), `--skill-text` (#fff)
      - Typography: `--font-primary`, `--font-heading`, `--font-mono`
      - Spacing: xs through 2xl
      - Layout: `--max-width` (1200px), `--header-height` (64px)
      - Animation: `--duration-entrance` (500ms), `--duration-hover` (200ms), `--ease-out`
    - Create `src/styles/reset.css` with modern CSS reset (box-sizing, margins, font inheritance)
    - Create `src/styles/fonts.css` with @font-face declarations for Inter (variable weight), Space Grotesk, and JetBrains Mono (WOFF2)
    - Create `src/styles/main.css` as entry importing: reset → tokens → fonts → components
    - Download font files into `src/assets/fonts/`: inter-variable.woff2, space-grotesk-variable.woff2, jetbrains-mono-regular.woff2
    - Add empty `@media (prefers-color-scheme: dark) { :root {} }` rule to enforce light mode
    - _Requirements: 15.1, 15.2, 15.3_

  - [x] 1.3 Create base HTML boilerplate with SEO and analytics
    - Create `index.html` at project root with:
      - `<!DOCTYPE html>`, `<html lang="en">`, viewport meta tag
      - Title: "Mohammad Noor Abu Khlaif | Software Engineer & AI Advocate" (≤60 chars)
      - Meta description (50–160 chars)
      - Open Graph tags: og:title, og:description, og:image, og:url
      - Twitter Card tags: twitter:card (summary_large_image), twitter:title, twitter:description, twitter:image
      - JSON-LD Person schema: name, url, jobTitle, sameAs (LinkedIn, GitHub, YouTube, Twitter URLs)
      - Google Analytics gtag.js async script (G-XHXB3G7XDR)
      - Semantic structure: skip-nav link → header (nav) → main (sections) → footer
      - CSS link to `src/styles/main.css`
      - JS link to `src/scripts/main.js` (type="module", defer)
    - Create `technical-interview-preparation-kit/index.html` with same boilerplate but page-specific title/description
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 13.4, 13.6_

  - [x] 1.4 Optimize profile picture and create OG image
    - Convert `profile-pic.png` to WebP format using build-time or manual conversion (e.g., `cwebp`)
    - Ensure both `profile-pic.webp` and `profile-pic.png` are under 200KB each
    - Add explicit width/height dimensions to prevent CLS
    - Create an OG image (1200×630px) for social media previews: use a simple branded card with name, tagline, and profile photo on the vibrant background color
    - Place OG image in `public/` folder
    - _Requirements: 10.4, 10.5, 12.1_

- [x] 2. Build Hero section and navigation
  - [x] 2.1 Build Hero section with profile picture, name, tagline, and CTAs
    - Add `<section id="hero" class="hero" aria-label="Introduction">` as first section in main
    - Add `<picture>` element with `<source srcset="profile-pic.webp" type="image/webp">` and `<img src="profile-pic.png" alt="Mohammad Noor Abu Khlaif — Software Engineer, AI Advocate, and Tech Educator" class="hero__photo">`
    - Style photo: circular with `border-radius: 50%`, min 150px on mobile, 200px on desktop
    - Add `<h1>Mohammad Noor Abu Khlaif</h1>`
    - Add `<p class="hero__tagline">I build tools that help engineers move faster.</p>`
    - Add `<p class="hero__subtitle">Software Engineer · AI Advocate · Tech Educator</p>`
    - Add CTA group: "Let's Connect" primary button (https://cal.com/mohammad-noor) + inline SVG icon links for LinkedIn, GitHub, YouTube (aria-label="Code with Noor on YouTube"), Email
    - All external links: `target="_blank" rel="noopener"`
    - Style: `min-height: 100vh` (NOT fixed height — allows overflow on short viewports), flexbox centered, vibrant background (lightness > 50%)
    - Write responsive CSS inline with the component: mobile-first base styles + tablet/desktop enhancements
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 2.2 Build sticky navigation with section links and mobile hamburger menu
    - Create `<header>` with `<nav>` containing:
      - "Noor" home link (scrolls to #hero)
      - Section links: Highlights (#highlights), Skills (#skills), Connect (#links), Projects (#projects)
      - Page link: Resources (/technical-interview-preparation-kit/)
    - Style: sticky position, `--header-height: 64px`, z-index above content, subtle background blur or solid color
    - Implement hamburger menu toggle for < 768px:
      - Button with aria-expanded, aria-controls attributes
      - Hidden nav links revealed on toggle with CSS transition
      - Close menu when a link is clicked or Escape is pressed
    - Add smooth-scroll behavior on section link clicks with `scroll-margin-top` matching header height
    - All nav links keyboard-accessible (Tab, Enter)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 2.3, 13.3, 13.5_

  - [x] 2.3 Implement scroll-spy for active section highlighting
    - Create `src/scripts/main.js` with Intersection Observer watching all section elements
    - Observer config: threshold 0.2, rootMargin accounts for header height
    - On intersection: add/remove `.nav__link--active` class to corresponding nav link
    - Handle edge cases: when at very top → highlight "Noor"/home; when at bottom → highlight "Projects"
    - Ensure graceful degradation if IntersectionObserver is unsupported (no active states, but nav still functions)
    - _Requirements: 9.5_

- [x] 3. Build remaining landing page sections
  - [x] 3.1 Build Highlights section with 5 achievement cards
    - Add `<section id="highlights" aria-labelledby="highlights-heading">`
    - Add h2 heading (e.g., "Highlights" or "What I Do")
    - Create 5 card elements, each containing:
      - Emoji icon span (🤖, 🏆, 🎬, ⚙️, 👥)
      - Bold title in h3
      - One-line description paragraph
    - Add `data-animate="fade-up"` and `data-animate-delay="N"` attributes for staggered animation (0, 100, 200, 300, 400ms)
    - Style: card grid (1 col mobile, 2 col tablet, 3 col desktop), rounded corners, subtle shadow, spacing
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 3.2 Build Skills section with 4 color-coded categories
    - Add `<section id="skills" aria-labelledby="skills-heading">`
    - Add h2 heading
    - Create 4 category groups, each with:
      - h3 category name
      - Flex-wrap container of pill badges
    - Each pill: `<span class="skill-pill skill-pill--{category}">Kotlin</span>`
    - CSS for pills: rounded (border-radius: 9999px), padding, white text on category-colored background using design tokens:
      - Languages → hsl(210, 70%, 42%)
      - Technologies → hsl(150, 60%, 35%)
      - Areas of Expertise → hsl(30, 80%, 40%)
      - Leadership → hsl(330, 65%, 42%)
    - Verify contrast: white (#fff) on all backgrounds must pass WCAG AA 4.5:1
    - Responsive: pills wrap naturally, no overflow
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 3.3 Build Connect section (social links and CTAs)
    - Add `<section id="links" aria-labelledby="connect-heading">`
    - Add h2 "Connect" heading
    - Add prominent "Let's Connect" button: large, primary color, links to https://cal.com/mohammad-noor
    - Add 7 social link cards in a grid:
      - LinkedIn (https://go.bynoor.io/linkedin)
      - GitHub (https://go.bynoor.io/github)
      - YouTube — labeled "Code with Noor" (https://go.bynoor.io/youtube)
      - Twitter/X (https://go.bynoor.io/twitter)
      - StackOverflow (https://go.bynoor.io/sof)
      - HackerRank (https://go.bynoor.io/hr)
      - Email (https://go.bynoor.io/email)
    - Each link: inline SVG brand icon + visible text label + `aria-label` + `target="_blank" rel="noopener"`
    - Style: icon + label layout, hover effect (scale/shadow), grid responsive
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 3.4 Build Projects section with 2 project cards
    - Add `<section id="projects" aria-labelledby="projects-heading">`
    - Add h2 heading (e.g., "Built by Noor" or "Projects")
    - Create 2 project cards:
      - **areej.io** — "Personal brand site for a Platform & Observability Lead." (https://areej.io/) — accent color: #06b6d4
      - **HireFound** — "Recruitment brand and job portal for consultant Yasmin Blasi." (https://mohnoor94.github.io/hire-found/) — accent color: #6366f1
    - Each card: h3 project name, description paragraph, colored left border or top accent
    - Cards link to external URLs: `target="_blank" rel="noopener"`
    - Style: card layout (1 col mobile, 2 col desktop), hover effect
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 3.5 Build Footer component
    - Add `<footer class="footer">` with `<p>© <span id="year"></span> Noor 🤍</p>`
    - JS: `document.getElementById('year').textContent = new Date().getFullYear();`
    - Style: centered text, small font, muted color, generous top margin
    - Duplicate footer markup in Resources page HTML
    - _Requirements: 14.1, 14.2, 14.3_

- [ ] 4. Implement animations and responsive polish
  - [x] 4.1 Implement scroll-triggered entrance animations
    - Create `src/scripts/animations.js` (imported by main.js)
    - Query all `[data-animate]` elements
    - Set initial state via CSS: `opacity: 0; transform: translateY(20px)` (for fade-up) — class `.animate-hidden`
    - Create IntersectionObserver with threshold 0.2
    - On intersect: add `.animate-visible` class which applies `opacity: 1; transform: none; transition: all var(--duration-entrance) var(--ease-out)`
    - Apply stagger: read `data-animate-delay` and set `transition-delay` accordingly
    - Ensure elements start visible if JS is disabled: add `.animate-hidden` class via JS on load (progressive enhancement — no JS = no hidden state)
    - _Requirements: 3.1, 3.2, 3.5, 4.2_

  - [ ] 4.2 Implement hover effects and prefers-reduced-motion support
    - Add hover transitions to all interactive elements:
      - Buttons: slight scale (1.02) + shadow lift
      - Social link cards: scale (1.05) + color shift
      - Project cards: shadow elevation + slight translate-y
      - Skill pills: brightness increase
    - All hovers use `transition: transform 200ms var(--ease-out), box-shadow 200ms ease`
    - Add `@media (prefers-reduced-motion: reduce)`:
      - Remove all `transform` transitions
      - Remove entrance animations (`.animate-hidden` → immediately visible)
      - Keep only `color` and `opacity` transitions
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

  - [ ] 4.3 Responsive polish and final mobile-first adjustments
    - Review all sections at breakpoints: 320px, 375px, 768px, 1024px, 1200px, 1920px
    - Verify: no horizontal overflow, no text truncation, no element overlap
    - Verify: all tap targets ≥ 44x44px on mobile
    - Verify: content constrained to 1200px max-width on large screens
    - Verify: hamburger menu works on mobile, hidden on desktop
    - Fix any issues found during review
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_

- [ ] 5. Build the Resources page (Technical Interview Preparation Kit)
  - [ ] 5.1 Convert markdown content to semantic HTML
    - Read `content/technical-interview-preparation-kit/index.md` as source
    - Create full HTML content in `technical-interview-preparation-kit/index.html`:
      - h1: "Technical Interview Preparation Kit"
      - "Updated on Sep 7th, 2023" indicator below h1
      - Preserve ALL sections and subsections with proper h2/h3/h4 hierarchy
      - Convert markdown tables to HTML `<table>` with `<thead>`, `<tbody>`, visible borders
      - Convert code snippets to `<code>` / `<pre><code>` with monospace font
      - Convert blockquotes to `<blockquote>` elements
      - Convert all links to `<a>` with appropriate target/rel
      - Convert nested lists maintaining indentation levels
    - Add styles in `src/styles/resources.css`:
      - Tables: border-collapse, visible borders, alternating row backgrounds, responsive (horizontal scroll on mobile)
      - Code: monospace font (JetBrains Mono), subtle background, rounded corners
      - Blockquotes: left border accent, italic, indented
      - Lists: proper nesting indentation
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [ ] 5.2 Add table of contents with anchor navigation
    - Add id attributes to all h2 and h3 elements (slug format: lowercase, hyphenated)
    - Create TOC at the top of the page as an ordered list of anchor links grouped by h2 sections
    - Style TOC: outlined box, clear visual hierarchy (h2 = bold, h3 = indented)
    - Add `scroll-margin-top: calc(var(--header-height) + 1rem)` to all heading elements
    - _Requirements: 8.6_

  - [ ] 5.3 Add shared navigation and footer to Resources page
    - Copy the same nav markup from index.html (or extract as common pattern)
    - Set "Resources" nav link as active (`.nav__link--active` class)
    - "Noor" home link points to `/` (not `#hero`)
    - Section links point to `/#highlights`, `/#skills`, etc.
    - Include footer with dynamic copyright year
    - _Requirements: 8.1, 9.6, 14.3_

- [ ] 6. Checkpoint - Verify both pages complete
  - Open dev server, visually inspect both pages at multiple viewports
  - Verify all links work (no 404s, correct targets)
  - Verify animations trigger on scroll and respect reduced-motion
  - Verify navigation scroll-spy, hamburger menu, smooth scroll all function
  - Ask user for visual review if needed

- [ ] 7. Performance optimization and deployment
  - [ ] 7.1 Configure Vite build optimization
    - Verify CSS and JS minification is enabled (Vite defaults)
    - Verify asset hashing in filenames
    - Ensure `public/CNAME` (containing "bynoor.io") is copied to `dist/` root
    - Ensure all favicon files are copied to `dist/`
    - Run `npm run build` and verify:
      - `dist/index.html` exists
      - `dist/technical-interview-preparation-kit/index.html` exists
      - `dist/CNAME` contains "bynoor.io"
      - Total build size < 1.5MB
      - No individual image > 200KB
    - _Requirements: 10.6, 11.2, 11.4_

  - [ ] 7.2 Create GitHub Actions workflow for automated deployment
    - Replace existing `.github/workflows/gh-pages.yml` with new `deploy.yml`:
      - Trigger: push to `main` branch only
      - Steps: checkout → setup Node → install deps → build → validate (CNAME exists, index.html exists) → deploy
      - Use `actions/deploy-pages@v4` or `peaceiris/actions-gh-pages@v4` to publish `dist/`
      - Ensure failed builds don't deploy (conditional step)
    - Verify workflow YAML is valid
    - _Requirements: 11.1, 11.2, 11.3, 11.5_

  - [ ] 7.3 Add lazy loading and final performance checks
    - Add `loading="lazy"` to any images below the fold (Resources page images, if any)
    - Profile picture in hero is LCP — must NOT be lazy-loaded (it's above the fold)
    - Verify images have explicit width/height to prevent CLS
    - Run Lighthouse audit (local or CI) — target: Performance ≥ 90, Accessibility ≥ 95
    - Fix any performance issues found (render-blocking resources, large assets, layout shifts)
    - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [ ] 8. Final verification
  - Run full build: `npm run build`
  - Serve `dist/` locally and verify both pages render correctly
  - Test on real mobile device or emulator if possible
  - Verify OG meta tags render correct previews (use opengraph.xyz or similar)
  - Confirm all social links, project links, and CTA links work
  - Ask user for final review

- [ ] 9. Write tests
  - [ ] 9.1 Write build output validation tests (REQUIRED)
    - Set up Vitest
    - Test: `dist/index.html` exists after build
    - Test: `dist/technical-interview-preparation-kit/index.html` exists after build
    - Test: `dist/CNAME` contains "bynoor.io"
    - Test: No image file in dist exceeds 200KB
    - Test: Total dist size under 1.5MB
    - _Requirements: 10.4, 10.6, 11.2, 11.4_

  - [ ]* 9.2 Write DOM content assertion tests (optional)
    - Test Hero: profile image with alt text, h1 with correct name, tagline, subtitle, CTA links with correct hrefs
    - Test Highlights: all 5 cards with correct titles
    - Test Skills: all 4 categories with all skills present
    - Test Links: all 7 social links + Let's Connect with correct hrefs, target="_blank", rel="noopener", "Code with Noor" label on YouTube
    - Test Projects: all 2 cards with correct URLs
    - Test Navigation: all section links present, Resources link present
    - Test Footer: copyright text with current year
    - Test SEO: OG tags present, JSON-LD valid schema, title ≤ 60 chars, description 50-160 chars
    - Test Accessibility: skip-nav link is first focusable, semantic landmarks present, ARIA labels on icon links
    - _Requirements: 1.1–1.7, 4.1, 5.1, 6.1–6.5, 7.1–7.3, 9.1, 12.1–12.4, 13.4–13.6, 14.1_

  - [ ]* 9.3 Write responsive and accessibility E2E tests (optional)
    - Set up Playwright
    - Test: no horizontal overflow at 320px, 375px, 768px, 1024px, 1200px, 2560px
    - Test: hamburger menu visible below 768px, hidden above
    - Test: tap targets ≥ 44x44px on 375px viewport
    - Test: animations not applied when prefers-reduced-motion is set
    - Run axe-core accessibility audit for WCAG 2.1 AA
    - _Requirements: 2.1, 2.3, 2.4, 3.4, 13.1, 13.3_

## Notes

- Tasks marked with `*` are optional for faster MVP delivery
- Task 9.1 (build validation) is NOT optional — it guards deployment correctness
- The existing Hugo workflow `.github/workflows/gh-pages.yml` will be REPLACED in task 7.2
- Font files (Inter, Space Grotesk, JetBrains Mono) must be downloaded as WOFF2 and self-hosted
- The profile picture (`profile-pic.png`) at project root needs WebP conversion (task 1.4)
- Source markdown for Resources page is at `content/technical-interview-preparation-kit/index.md` — preserve this file as reference until task 5.1 is complete, then it can be removed
- All inline SVGs for social icons can be sourced from Simple Icons (https://simpleicons.org/)
- The OG image should be created as a simple branded card (name + tagline on the primary color background)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "2.2"] },
    { "id": 3, "tasks": ["2.3", "3.1", "3.2", "3.3", "3.4", "3.5"] },
    { "id": 4, "tasks": ["4.1", "4.2", "4.3"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 6, "tasks": ["7.1", "7.2", "7.3"] },
    { "id": 7, "tasks": ["9.1", "9.2", "9.3"] }
  ]
}
```
