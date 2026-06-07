# Implementation Plan: Website Creative Redesign

## Overview

Transform bynoor.io from a light-themed personal site into a bold, dark-mode-first experience with animated gradient meshes, custom cursor, particle effects, glassmorphism cards, and scroll-driven animations. Implementation uses vanilla HTML, CSS, and JavaScript (ES modules) served via Vite. Tasks are ordered foundation-first: design tokens and utilities, then CSS layers, then JS modules, then HTML wiring, and finally testing.

## Tasks

- [x] 1. Set up testing infrastructure and utility modules
  - [x] 1.1 Add fast-check dependency and configure Vitest for property-based testing
    - Add `fast-check` to devDependencies in `package.json`
    - Verify Vitest config supports the `tests/unit/` and `tests/property/` directories
    - Create `tests/property/` directory for property-based test files
    - _Requirements: 9.1, 9.2_

  - [x] 1.2 Create `src/scripts/utils/reduced-motion.js` utility module
    - Implement `prefersReducedMotion()` returning boolean from `matchMedia('(prefers-reduced-motion: reduce)')`
    - Implement `onMotionPreferenceChange(callback)` that listens for live changes via `addEventListener('change', ...)`
    - Export both functions as named exports
    - _Requirements: 1.6, 2.6, 4.6, 5.5, 7.5, 8.6, 9.6_

  - [x] 1.3 Create `src/scripts/utils/lerp.js` utility module
    - Implement `lerp(current, target, factor)` returning `current + (target - current) * factor`
    - Export as named export
    - _Requirements: 5.1_

  - [x] 1.4 Create `src/scripts/utils/breakpoints.js` utility module
    - Implement `onBreakpointChange(minWidth, callback)` wrapping `matchMedia` with `addEventListener('change', ...)`
    - Callback fires immediately with current state, then on every change
    - Implement `isAbove(minWidth)` for one-shot checks
    - Export both as named exports
    - _Requirements: 5.1, 5.3, 10.4_

  - [x] 1.5 Create `src/scripts/utils/random.js` utility module
    - Implement `randomBetween(min, max)` for float range
    - Implement `randomInt(min, max)` for integer range (inclusive)
    - Export both as named exports
    - _Requirements: 7.1_

  - [x]* 1.6 Write unit tests for utility modules
    - Test `lerp.js`: verify interpolation for factor 0, 0.5, 1, and edge cases
    - Test `reduced-motion.js`: mock matchMedia, verify boolean detection and callback firing
    - Test `random.js`: verify output bounds
    - Test `breakpoints.js`: mock matchMedia, verify callback behavior
    - _Requirements: 9.4_

- [x] 2. Redesign design tokens and create new CSS foundation layers
  - [x] 2.1 Rewrite `src/styles/tokens.css` with dark-mode-first color system
    - Replace light theme variables with dark backgrounds (hsl 240, 15%, 6%)
    - Add 4 neon accent colors (violet, cyan, magenta, amber) at 70%+ saturation
    - Add glassmorphism tokens (`--glass-bg`, `--glass-border`, `--glass-blur`)
    - Add gradient tokens (`--gradient-text`, `--gradient-progress`)
    - Add cursor tokens, particle tokens, scroll-progress custom property
    - Add font-weight tokens (300, 400, 600, 700)
    - Add `--duration-mesh`, `--ease-spring` animation tokens
    - Remove the old `prefers-color-scheme: dark` empty media query
    - _Requirements: 1.1, 1.3, 3.1_

  - [x] 2.2 Create `src/styles/gradients.css` with gradient utilities and mesh keyframes
    - Register CSS `@property` for `--mesh-hue-1`, `--mesh-hue-2`, `--mesh-hue-3`
    - Define `.hero__mesh` class with 3-stop radial gradient background
    - Define `@keyframes mesh-cycle` (12s, ease-in-out, infinite) cycling hues within 30° range
    - Add `.gradient-text` utility using `background-clip: text`
    - Add `@media (prefers-reduced-motion: reduce)` rule to pause mesh animation
    - _Requirements: 1.2, 1.6, 2.1, 3.3_

  - [x] 2.3 Create `src/styles/glass.css` with glassmorphism utility classes
    - Define `.glass-card` with background opacity 0.05–0.15, backdrop-filter blur ≥10px, 1px border at 0.1–0.3 opacity
    - Define `.glass-card:hover` increasing background and border opacity
    - Add `@supports not (backdrop-filter: blur(1px))` fallback
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 2.4 Create `src/styles/cursor.css` with custom cursor styles
    - Define `.custom-cursor` element styles (size, shape, color from tokens, position: fixed, pointer-events: none, z-index high)
    - Define `.custom-cursor--hover` state (scale 1.5x, ring expansion)
    - Define `.cursor-active` on `html` to hide native cursor
    - Add media query to hide cursor element below 1024px
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.5 Create `src/styles/progress.css` with scroll progress bar
    - Define `.scroll-progress` as fixed position top bar, height 3px
    - Use `width: calc(var(--scroll-progress) * 100%)` with gradient background from tokens
    - Set z-index above all content
    - _Requirements: 4.2_

  - [x] 2.6 Create `src/styles/dividers.css` for section gradient dividers
    - Define `.section-divider` with 1px height, gradient background (transparent → accent → transparent), opacity 0.3
    - _Requirements: 3.4_

  - [x] 2.7 Create `src/styles/decorative.css` for background blobs and radial glows
    - Define decorative pseudo-elements or classes for gradient blobs behind at least 2 content sections
    - Set `z-index` behind content, `pointer-events: none`
    - Add `@media (prefers-reduced-motion: reduce)` to pause/remove animations
    - _Requirements: 7.4, 7.5_

  - [x] 2.8 Update `src/styles/animations.css` for entrance animation classes
    - Define `.animate-hidden` (opacity: 0, translateY: 20px) — the pre-entrance state
    - Define `.animate-visible` (opacity: 1, translateY: 0) with transition using `--duration-entrance`
    - Add variants: `fade-up`, `fade-in`, `scale-in`
    - Add `@media (prefers-reduced-motion: reduce)` to disable transforms and show elements immediately
    - Ensure transitions use `will-change: transform, opacity` for compositor offloading
    - _Requirements: 4.1, 4.6, 9.4_

  - [x] 2.9 Update `src/styles/main.css` to import all new CSS modules
    - Add imports for `gradients.css`, `glass.css`, `cursor.css`, `progress.css`, `dividers.css`, `decorative.css`
    - Maintain correct import order (reset → tokens → fonts → gradients → glass → cursor → progress → dividers → decorative → component styles → animations)
    - _Requirements: 1.1_

- [x] 3. Checkpoint — Verify CSS foundation builds correctly
  - Ensure `npm run build` succeeds with no errors, ask the user if questions arise.

- [-] 4. Implement JavaScript modules (animation engine, scroll progress, particles)
  - [x] 4.1 Create `src/scripts/animation-engine.js`
    - Implement `initAnimationEngine()` that creates a single IntersectionObserver with threshold 0.2
    - On intersection: add `animate-visible` class, apply `transition-delay` from `data-animate-delay`
    - Unobserve element immediately after first trigger (fire-once semantics)
    - Implement stagger logic: read `data-animate-stagger` on parent, auto-calculate child delays
    - If `prefersReducedMotion()`: skip adding `animate-hidden`, all elements visible immediately
    - Observe all `[data-animate]` elements
    - _Requirements: 4.1, 4.4, 9.4, 9.5_

  - [ ]* 4.2 Write property test for animation engine fire-once semantics
    - **Property 2: Entrance animations fire exactly once**
    - Generate random sequences of intersection events using fast-check
    - Mock IntersectionObserver; verify `animate-visible` added exactly once and `unobserve` called
    - **Validates: Requirements 4.1**

  - [x] 4.3 Create `src/scripts/scroll-progress.js`
    - Implement `initScrollProgress()` that listens to scroll event with `{ passive: true }`
    - Compute `progress = scrollTop / (scrollHeight - clientHeight)`
    - Set CSS custom property `--scroll-progress` on the progress bar element
    - Use `requestAnimationFrame` to batch DOM writes
    - _Requirements: 4.2_

  - [ ]* 4.4 Write property test for scroll progress linear mapping
    - **Property 3: Scroll progress maps linearly to scroll position**
    - Generate random `scrollTop` values (0 to scrollHeight-clientHeight) with fast-check
    - Verify computed progress matches `scrollTop / (scrollHeight - clientHeight)` bounded to [0, 100]
    - **Validates: Requirements 4.2**

  - [x] 4.5 Create `src/scripts/particle-system.js`
    - Implement `initParticleSystem(canvas)` and `destroyParticleSystem()`
    - Initialize `min(50, area/10000)` particles with random positions, velocities, radii (2–6), opacity (0.1–0.4), hues from accent palette
    - Run `requestAnimationFrame` render loop; particles wrap toroidally
    - Control container opacity based on scroll: `opacity = max(0, 1 - scrollPastHero / 200)`
    - Skip initialization on mobile (<768px) or reduced-motion
    - Canvas has `pointer-events: none`
    - Pause RAF when `document.hidden`
    - Use `ResizeObserver` on hero to resize canvas on viewport changes (cap devicePixelRatio at 2)
    - Auto-reduce particle count on `navigator.hardwareConcurrency < 4`
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 9.4_

  - [ ]* 4.6 Write property test for particle opacity fade
    - **Property 7: Particle system opacity fades linearly past hero**
    - Generate random scroll distances (0–400px) past hero bottom with fast-check
    - Verify opacity equals `max(0, 1 - distance / 200)`, reaching 0 at 200px
    - **Validates: Requirements 7.3**

  - [ ]* 4.7 Write unit tests for particle initialization bounds
    - Verify particle count ≤ 50
    - Verify each particle radius in [2, 6], velocity in bounds, opacity in [0.1, 0.4]
    - Verify wrap-around logic keeps particles within canvas bounds
    - _Requirements: 7.1, 7.2_

- [-] 5. Implement JavaScript modules (cursor, magnetic elements, tilt cards)
  - [x] 5.1 Create `src/scripts/custom-cursor.js`
    - Implement `initCustomCursor()` that creates a cursor DOM element
    - Only active at viewport ≥ 1024px (use `onBreakpointChange`)
    - Use `requestAnimationFrame` loop with lerp (factor 0.08–0.15) for smooth trailing
    - On `mouseenter`/`mouseleave` on document: toggle visibility
    - On `pointerover` on `a, button, [role="button"]`: set hover state (scale 1.5x)
    - Add `.cursor-active` to `<html>` to hide native cursor
    - Destroy/pause when reduced-motion active or viewport < 1024px
    - On viewport crossing 1024px: destroy/re-create cursor dynamically
    - Hide cursor when mouse leaves browser viewport
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_

  - [ ]* 5.2 Write property test for cursor lerp convergence
    - **Property 5: Custom cursor converges toward target via lerp**
    - Generate random mouse position sequences with fast-check
    - Simulate lerp loop frames, verify cursor position converges toward target
    - Verify `lerpFactor` between 0.08 and 0.15 per frame
    - **Validates: Requirements 5.1**

  - [x] 5.3 Create `src/scripts/magnetic-elements.js`
    - Implement `initMagneticElements()` selecting all `[data-magnetic]` elements
    - On `mousemove` (throttled via RAF): compute distance from cursor to element center
    - If distance < 80px: translate element toward cursor with `offset = (cursorPos - centerPos) * (1 - distance/80) * maxOffset/80`
    - Maximum translation: 8px in any direction, applied via CSS transform
    - On `mouseleave`: animate back to `translate(0, 0)` over 300ms
    - Disabled when reduced-motion active or viewport < 1024px
    - _Requirements: 5.4, 5.5_

  - [ ]* 5.4 Write property test for magnetic element translation bounds
    - **Property 6: Magnetic element translation bounded to 8px**
    - Generate random cursor positions (within and outside 80px threshold) with fast-check
    - Verify translation magnitude ≤ 8px when inside threshold, equals 0 when outside
    - **Validates: Requirements 5.4**

  - [x] 5.5 Create `src/scripts/tilt-cards.js`
    - Implement 3D perspective tilt on hover for `.tilt-card` elements
    - On `pointermove`: calculate rotation from pointer position relative to card center
    - Map to `rotateX` / `rotateY` via CSS custom properties `--tilt-x`, `--tilt-y` (max 5deg)
    - On `pointerleave`: reset to 0deg with transition
    - Disabled when reduced-motion active (falls back to translateY lift)
    - _Requirements: 4.3, 6.4_

  - [x] 5.6 Add parallax scroll logic to `src/scripts/animation-engine.js`
    - On scroll (passive listener): translate elements with `[data-parallax]` attribute at ≤50% of scroll speed
    - Apply via CSS `transform: translateY(offset)` where offset = scrollDelta × parallaxFactor (factor ≤ 0.5)
    - Use `requestAnimationFrame` to batch DOM writes
    - Disabled on mobile (<768px) via `onBreakpointChange`
    - Disabled when reduced-motion active
    - On breakpoint crossing below 768px: reset all parallax transforms to 0
    - _Requirements: 4.5, 10.6_

  - [x] 5.7 Add section accent color reveal to `src/scripts/animation-engine.js`
    - Use a separate IntersectionObserver (threshold: 0.1) for `[data-section-accent]` elements
    - On intersection: add `.section--revealed` class which triggers CSS border-glow or gradient-highlight transition (300–600ms, defined in CSS)
    - Each section has a `data-section-accent` attribute mapping to its assigned accent token
    - The CSS transition is defined in the relevant section CSS files
    - _Requirements: 1.4_

- [~] 6. Checkpoint — Verify all JS modules load without errors
  - Ensure `npm run build` succeeds and `npm run test` passes, ask the user if questions arise.

- [ ] 7. Update HTML structure and section styles
  - [~] 7.1 Update `index.html` hero section for creative redesign
    - Add `.hero__mesh` background div inside hero section
    - Add `<canvas>` element for particle system with `aria-hidden="true"`
    - Add scroll-down indicator chevron SVG after CTA group
    - Update hero layout classes for dark-theme styling
    - Add `data-animate` attributes to hero child elements (photo, heading, tagline) with staggered delays
    - Ensure hero retains `min-height: 100vh`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [~] 7.2 Update `src/styles/hero.css` for creative hero redesign
    - Style `.hero` with dark background, full viewport height, relative positioning
    - Style `.hero__mesh` as absolute-positioned gradient background layer
    - Style profile photo with circular clip, animated border/glow ring, floating transform
    - Style name heading with gradient text fill (background-clip: text) at 28px–48px responsive sizing
    - Style scroll-down indicator with bounce animation (1.5s cycle)
    - Add staggered entrance animation styles completing within 1500ms
    - Add `prefers-reduced-motion` overrides
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [~] 7.3 Update `index.html` navigation and add scroll progress bar
    - Add `.scroll-progress` div before the header element
    - Update nav to support glassmorphism when scrolled (`.nav--scrolled` class toggled by JS)
    - Add logo glow styles integration
    - _Requirements: 3.4, 4.2_

  - [~] 7.4 Update `src/styles/nav.css` for glassmorphism navigation
    - Add `.nav--scrolled` state with `backdrop-filter: blur`, semi-transparent background
    - Add logo text-shadow glow effect on `.nav__logo-noor`
    - Update mobile menu overlay with glassmorphism backdrop blur ≥10px
    - _Requirements: 3.4, 10.2, 10.3_

  - [~] 7.5 Update `index.html` highlights section with creative markup
    - Add `data-animate-stagger="100"` to highlights grid container
    - Add `data-animate="fade-up"` to each card
    - Add `.tilt-card` class to highlight cards
    - Add glassmorphism classes to cards
    - Adjust grid to feature asymmetric spans (at least one card spans differently) at ≥768px
    - _Requirements: 3.2, 4.4, 6.1_

  - [~] 7.6 Update `src/styles/highlights.css` for glassmorphism and creative layout
    - Apply glass-card styling (translucent background, border, blur)
    - Create asymmetric grid layout at ≥768px (first card spans 2 columns)
    - Add hover states (vertical lift + elevated box-shadow within 200ms)
    - Style card icons with accent glow
    - _Requirements: 3.2, 4.3, 6.1, 6.4_

  - [~] 7.7 Update `index.html` skills section with creative markup
    - Add `data-animate-stagger="200"` to skills container
    - Add `data-animate="fade-up"` to each category
    - _Requirements: 8.3_

  - [~] 7.8 Update `src/styles/skills.css` for creative skills redesign
    - Style skill pills with gradient backgrounds (2+ color stops) and box-shadow glow on hover
    - Scale pills 1.05–1.1x on hover with shadow spread increase
    - Style category labels as accent-colored tags (border-radius ≥4px, distinct bg per category, font-weight ≥600)
    - Ensure flex-wrap layout without horizontal scroll on mobile
    - Add `prefers-reduced-motion` overrides (no scale, preserve visual effects)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [~] 7.9 Update `index.html` connect section with creative markup
    - Add `data-animate-stagger="80"` to link cards grid
    - Add `data-animate="fade-up"` to cards
    - Add `.tilt-card` class to link cards
    - Add glassmorphism classes
    - Add `data-magnetic` to CTA button
    - _Requirements: 6.2, 5.4_

  - [~] 7.10 Update `src/styles/links.css` for glassmorphism connect section
    - Apply glass-card styling to link cards
    - Add border gradient activation on hover (transition ≤200ms)
    - Style CTA banner with glassmorphism
    - _Requirements: 6.2, 6.4_

  - [~] 7.11 Update `index.html` projects section with creative markup
    - Add `data-animate-stagger="120"` to projects grid
    - Add `data-animate="fade-up"` to project cards
    - Add `.tilt-card` class to project cards
    - Add glassmorphism classes
    - Create asymmetric grid at ≥768px
    - _Requirements: 3.2, 6.3_

  - [~] 7.12 Update `src/styles/projects.css` for glassmorphism projects
    - Apply glass-card styling
    - Replace solid left-border with accent glow (80% opacity)
    - Add asymmetric grid layout at ≥768px
    - _Requirements: 3.2, 6.3, 6.4_

  - [~] 7.13 Update `src/styles/footer.css` for dark theme footer redesign
    - Apply dark theme background with gradient border-top (border-image)
    - Add logo text-shadow glow
    - Style beta badge with glassmorphism (glass-bg, glass-border, backdrop-filter)
    - _Requirements: 1.1_

  - [~] 7.14 Add section dividers to `index.html`
    - Insert `<hr class="section-divider" aria-hidden="true">` between each main section
    - _Requirements: 3.4_

  - [~] 7.15 Add `src/styles/reset.css` update for dark-mode body defaults
    - Set `body` background to `var(--color-bg)`, color to `var(--color-text)`
    - Ensure smooth scrolling behavior
    - _Requirements: 1.1_

- [ ] 8. Wire JavaScript modules into main.js and add navigation glassmorphism toggle
  - [~] 8.1 Update `src/scripts/main.js` to import and initialize all new modules
    - Import and call: `initAnimationEngine`, `initCustomCursor`, `initParticleSystem`, `initScrollProgress`, `initMagneticElements`, `initTiltCards`
    - Pass hero canvas element to `initParticleSystem`
    - Defer animation initialization after first paint (use `requestAnimationFrame` or `requestIdleCallback`)
    - Retain existing `initNavigation`, `initScrollSpy`, year-setting logic
    - _Requirements: 9.4, 9.5_

  - [~] 8.2 Update `src/scripts/navigation.js` to add glassmorphism scroll toggle
    - On scroll (passive listener): add/remove `.nav--scrolled` class based on scroll position (e.g., > 100px)
    - Ensure mobile menu overlay applies glassmorphism backdrop
    - _Requirements: 3.4, 10.2, 10.3_

- [ ] 9. Responsive and reduced-motion final pass
  - [~] 9.1 Add responsive overrides for mobile (<768px)
    - Disable parallax in CSS/JS for mobile
    - Simplify hero background (gradient only, no particles)
    - Ensure single-column grid reflow preserving creative styles (gradients, glows, borders)
    - Remove transform-based entrance animations; limit to opacity and color transitions
    - Verify all touch targets ≥44x44px
    - _Requirements: 10.1, 10.4, 10.5, 10.6, 3.5_

  - [~] 9.2 Verify and finalize reduced-motion behavior across all modules
    - Confirm `prefers-reduced-motion: reduce` disables: gradient mesh animation, entrance animations, parallax, cursor, magnetic, particle system, tilt, scroll indicator bounce
    - Confirm hover interactions (translateY lift, box-shadow) remain active (user-initiated)
    - Confirm all elements render in final visible state without delays
    - _Requirements: 1.6, 2.6, 4.6, 5.5, 7.5, 8.6, 9.6_

  - [~] 9.3 Ensure no-JS graceful degradation
    - Verify all text content visible without JavaScript
    - Verify navigation links functional without JS
    - Verify images render with alt text
    - Add CSS-only defaults: no `.animate-hidden` applied without JS, native cursor preserved
    - _Requirements: 9.7_

  - [~] 9.4 Update OG image for dark theme
    - Regenerate or replace `public/og-image.png` to match the new dark theme with neon accents
    - Ensure the image dimensions stay at recommended OG size (1200×630)
    - Verify meta tags in `index.html` still reference the correct path
    - _Requirements: 1.1_

  - [~] 9.5 Add `data-section-accent` and `data-parallax` attributes to HTML sections
    - Add `data-section-accent="primary|secondary|tertiary|quaternary"` to each section
    - Add `data-parallax="0.3"` (or similar factor) to decorative background elements
    - Add `.section--revealed` CSS transition rules (border-glow, 300–600ms) to section CSS files
    - _Requirements: 1.4, 4.5_

- [~] 10. Checkpoint — Full build and visual verification
  - Ensure `npm run build` succeeds, `npm run test` passes, ask the user if questions arise.

- [ ] 11. Write E2E and integration tests
  - [~] 11.0 Update existing Playwright tests for dark theme redesign
    - Update `tests/e2e/accessibility.spec.js` — adjust expected colors and contrast for dark theme
    - Update `tests/e2e/animations.spec.js` — update selectors and expected animation behavior for new animation engine
    - Update `tests/e2e/navigation.spec.js` — add glassmorphism scroll state checks, update menu overlay expectations
    - Update `tests/e2e/responsive.spec.js` — update expected layouts for asymmetric grids, dark backgrounds
    - Update `tests/unit/dom-content.test.js` — update expected DOM structure for new elements (canvas, scroll-progress, dividers)
    - _Requirements: 9.1, 9.2_

  - [ ]* 11.1 Write E2E test for responsive no-overflow (Playwright)
    - **Property 8: No horizontal overflow across viewport range**
    - Test at viewports 320px, 375px, 768px, 1024px, 1440px, 2560px
    - Verify `document.body.scrollWidth <= viewport.clientWidth` at each size
    - **Validates: Requirements 10.1**

  - [ ]* 11.2 Write E2E test for touch target sizes on mobile (Playwright)
    - **Property 9: Touch targets meet minimum size on mobile**
    - Set viewport to 375px
    - Query all `a, button, [role="button"]` elements
    - Verify each has `offsetWidth ≥ 44` and `offsetHeight ≥ 44`
    - **Validates: Requirements 10.5**

  - [ ]* 11.3 Write E2E test for reduced-motion behavior (Playwright)
    - Emulate `prefers-reduced-motion: reduce`
    - Verify no CSS animations running (animation-play-state: paused or none)
    - Verify all `data-animate` elements are visible without `.animate-hidden`
    - Verify cursor element not present
    - _Requirements: 1.6, 2.6, 4.6, 5.5, 9.6_

  - [ ]* 11.4 Write E2E test for scroll progress bar (Playwright)
    - Scroll to various positions (0%, 25%, 50%, 75%, 100%)
    - Verify progress bar width matches expected percentage (±2% tolerance)
    - _Requirements: 4.2_

  - [ ]* 11.5 Write E2E test for navigation glassmorphism and hamburger menu (Playwright)
    - Scroll past hero; verify `.nav--scrolled` class and backdrop-filter applied
    - At mobile viewport: verify hamburger reveals full-viewport overlay with glassmorphism
    - _Requirements: 3.4, 10.2, 10.3_

  - [ ]* 11.6 Update existing accessibility E2E test to verify contrast and scores
    - Run axe-core accessibility audit
    - Verify no critical or serious violations
    - Verify color contrast ratios meet WCAG 4.5:1 for body text, 3:1 for large text
    - _Requirements: 1.5, 6.5, 9.2_

  - [ ]* 11.7 Write property test for parallax bound
    - **Property 4: Parallax translation bounded to 50% of scroll speed**
    - Generate random scroll deltas with fast-check
    - Verify parallax offset ≤ 0.5 × delta
    - **Validates: Requirements 4.5**

  - [ ]* 11.8 Write property test for WCAG contrast
    - **Property 1: Text contrast meets WCAG thresholds**
    - Generate random foreground/background color pairs from token palette with fast-check
    - Compute relative luminance and contrast ratio
    - Verify ≥ 4.5:1 for normal text, ≥ 3:1 for large text
    - **Validates: Requirements 1.5, 6.5**

- [~] 12. Final checkpoint — All tests green and build verified
  - Ensure all tests pass (`npm run test` and `npm run test:e2e`), ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses vanilla JavaScript (ES modules) with Vite for bundling — no framework
- Existing BEM naming convention is preserved throughout
- All scroll listeners must use `{ passive: true }` for performance
- Animation rendering must be offloaded to compositor thread (transforms + opacity only)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "1.5"] },
    { "id": 1, "tasks": ["1.6", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"] },
    { "id": 3, "tasks": ["2.9", "7.15"] },
    { "id": 4, "tasks": ["3"] },
    { "id": 5, "tasks": ["4.1", "4.3", "4.5"] },
    { "id": 6, "tasks": ["4.2", "4.4", "4.6", "4.7", "5.1", "5.3", "5.5", "5.6", "5.7"] },
    { "id": 7, "tasks": ["5.2", "5.4"] },
    { "id": 8, "tasks": ["6"] },
    { "id": 9, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10", "7.11", "7.12", "7.13", "7.14"] },
    { "id": 10, "tasks": ["8.1", "8.2"] },
    { "id": 11, "tasks": ["9.1", "9.2", "9.3", "9.4", "9.5"] },
    { "id": 12, "tasks": ["10"] },
    { "id": 13, "tasks": ["11.0", "11.1", "11.2", "11.3", "11.4", "11.5", "11.6", "11.7", "11.8"] },
    { "id": 14, "tasks": ["12"] }
  ]
}
```
