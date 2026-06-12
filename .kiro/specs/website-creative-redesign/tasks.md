# Implementation Plan: Website Creative Redesign

## Overview

Transform bynoor.io into an immersive, cinematic portfolio experience using the existing Vite + vanilla JS + CSS stack. Implementation follows a modular scene-based architecture with a scroll-driven animation engine, layered visual effects, and progressive enhancement. Tasks progress from foundational infrastructure through individual scene implementations to final integration, optimization, and accessibility audits.

## Tasks

- [x] 1. Foundation — Design Tokens, Reset, and File Structure
  - [x] 1.1 Create the new `src/styles/tokens.css` with expanded design tokens including `@property` registered custom properties for animatable hues, new spacing scale, and updated color palette (deep black/navy base, electric violet/cyan/magenta accents)
    - Define all colors as CSS custom properties for future theming
    - _Requirements: 14.1, 14.2, 14.6_
  - [x] 1.2 Create `src/styles/layers/ambient.css` with gradient mesh orbs (large border-radius divs, blur 80px, absolute positioned, keyframe-animated drift)
    - _Requirements: 8.1, 8.3_
  - [x] 1.3 Create `src/styles/layers/grain.css` with film grain overlay styles (fixed position, pointer-events none, low opacity, tiled background)
    - _Requirements: 8.2_
  - [x] 1.4 Create `src/styles/layers/glow.css` with radial glow utility classes and cursor-following glow card styles using `--glow-x` / `--glow-y` custom properties
    - _Requirements: 8.5, 5.3_
  - [x] 1.5 Create `src/styles/layers/depth.css` with parallax layer rules (foreground, midground, background transform speeds)
    - _Requirements: 2.7_
  - [x] 1.6 Update `src/styles/main.css` to import new layer and scene stylesheets in correct cascade order
    - _Requirements: 14.6_
  - [x] 1.7 Set up the new `src/scripts/` directory structure with `core/`, `scenes/`, `effects/`, `ui/`, and `utils/` folders
    - _Requirements: 2.1_

- [x] 2. Scroll Engine and Scene Manager
  - [x] 2.1 Create `src/scripts/utils/raf.js` — requestAnimationFrame scheduler with batched reads/writes
    - _Requirements: 2.1, 12.4_
  - [x] 2.2 Create `src/scripts/utils/observer.js` — IntersectionObserver factory with configurable thresholds
    - _Requirements: 2.3, 2.4_
  - [x] 2.3 Create `src/scripts/utils/motion.js` — reduced-motion detection utility exporting `prefersReducedMotion()` and media query listener
    - _Requirements: 12.6, 8.6_
  - [x] 2.4 Create `src/scripts/core/scroll-engine.js` — ScrollEngine class that registers scenes, computes per-scene progress [0,1], updates `--scene-progress` CSS variable, and dispatches lifecycle events (enter, active, exit)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 2.5 Create `src/scripts/core/scene-manager.js` — SceneManager that discovers `[data-scene]` elements, instantiates scene modules, and wires them to ScrollEngine lifecycle events
    - _Requirements: 2.1, 2.3, 2.4_
  - [x]* 2.6 Write property test: ScrollEngine progress invariant — for any simulated scroll position, total visible scene progress sums to ~1.0
    - **Property 1: Scene Progress Invariant**
    - **Validates: Requirements 2.1, 2.2**

- [x] 3. Cinematic Hero Scene
  - [x] 3.1 Create `src/styles/scenes/hero.css` — full-viewport hero with layered backgrounds (ambient, particles, grain), kinetic typography setup, luminous photo ring (conic-gradient border animation), staggered entrance keyframes
    - _Requirements: 1.1, 1.2, 1.6_
  - [x] 3.2 Create `src/scripts/effects/kinetic-type.js` — text splitting utility that wraps characters/words in spans with `--char-index` CSS variables, triggers visibility via IntersectionObserver
    - _Requirements: 9.1, 9.3, 9.5_
  - [x] 3.3 Create `src/scripts/scenes/hero.js` — hero scene module implementing init/enter/active/exit lifecycle, name reveal orchestration, parallax dissolve on scroll exit
    - _Requirements: 1.1, 1.2, 1.5_
  - [x] 3.4 Create `src/scripts/effects/particles.js` — Canvas 2D particle system (refactor existing) with configurable density, drift speed, and color matching ambient palette
    - _Requirements: 1.3, 13.1_
  - [x] 3.5 Update `index.html` hero section markup to use new `data-scene="hero"`, `data-kinetic="chars"` attributes, and restructured content layout
    - _Requirements: 1.1, 1.6, 1.7_
  - [ ]* 3.6 Write property test: Kinetic Typography completeness — after triggering visibility, all character spans have opacity 1 and transform identity
    - **Property 7: Kinetic Typography Completeness**
    - **Validates: Requirements 9.1, 9.5**

- [x] 4. Morphing Navigation
  - [x] 4.1 Create `src/styles/components/nav.css` — styles for dot mode (small circles), pill mode (compact bar with sliding indicator), and expanded mobile overlay with transitions using `clip-path` and `transform`
    - _Requirements: 3.1, 3.2, 3.5_
  - [x] 4.2 Create `src/scripts/core/nav.js` — navigation module implementing state machine (HERO_MODE → PILL_MODE → EXPANDED_MODE), morph transitions driven by scroll position, active section indicator
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 4.3 Update `index.html` navigation markup to support dot/pill dual structure with `data-nav-state` attribute, including "Resources" link to /technical-interview-preparation-kit/
    - _Requirements: 3.6, 18.1, 18.4_
  - [ ]* 4.4 Write property test: Navigation state consistency — if scrollY > heroHeight then nav state is always PILL_MODE
    - **Property 2: Navigation State Consistency**
    - **Validates: Requirements 3.1, 3.2**

- [x] 5. Ambient Atmosphere Effects
  - [x] 5.1 Create `src/scripts/effects/ambient.js` — ambient layer controller that manages gradient orb elements, updates `--ambient-hue-*` CSS variables on section transitions (800ms ease), responds to scroll velocity for position shifts
    - _Requirements: 8.1, 8.3, 8.4_
  - [x] 5.2 Create `src/scripts/effects/grain.js` — procedural grain generator using 256×256 canvas noise rendered to data URL, re-rendered at 10fps, applied as fixed background
    - _Requirements: 8.2_
  - [x] 5.3 Create `src/scripts/effects/glow.js` — glow system that attaches `mousemove` listeners to `[data-glow]` elements and updates `--glow-x`/`--glow-y` CSS variables for radial gradient positioning
    - _Requirements: 8.5, 5.3_
  - [x] 5.4 Add ambient layer, grain overlay, and glow containers to `index.html` with `aria-hidden="true"`
    - _Requirements: 8.1, 8.2, 8.5_

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Magnetic Cursor
  - [x] 7.1 Create `src/styles/components/cursor.css` — custom cursor styles with outer ring + inner dot, shape morphing states (default, text bar, action expanded with label, click compressed), smooth transitions
    - _Requirements: 7.1, 7.3, 7.4, 7.5_
  - [x] 7.2 Create `src/scripts/effects/cursor.js` — MagneticCursor class with lerp-smoothed position (0.15 ring, 0.3 dot), proximity detection for `[data-magnetic]` elements (80px threshold), shape state management, touch device detection and auto-disable
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [x] 7.3 Add cursor DOM elements to `index.html` and mark interactive elements with `data-magnetic` attribute
    - _Requirements: 7.1, 7.2_
  - [ ]* 7.4 Write property test: Cursor cleanup — after destroy(), zero event listeners remain on document/window
    - **Property 4: Cursor Cleanup**
    - **Validates: Requirements 7.6**

- [x] 8. Story Timeline Scene
  - [x] 8.1 Create `src/styles/scenes/timeline.css` — 2-column alternating grid layout with vertical track line, milestone nodes, expanded state styles, responsive single-column below 768px, dimming effect for non-active milestones
    - _Requirements: 4.1, 4.4, 4.5_
  - [x] 8.2 Create `src/scripts/scenes/timeline.js` — timeline scene module with scroll-driven progress line fill, staggered milestone entrance, hover/tap expand interaction, viewport-center emphasis (scale + opacity)
    - _Requirements: 4.2, 4.3, 4.4, 4.6_
  - [x] 8.3 Add Story Timeline section to `index.html` with career milestone data from noor-data.md, using `data-scene="timeline"` and `data-year` attributes
    - _Requirements: 4.1, 4.2_
  - [ ]* 8.4 Write property test: Timeline milestone ordering — milestones in DOM maintain chronological order regardless of viewport width
    - **Property 8: Timeline Milestone Ordering**
    - **Validates: Requirements 4.1, 4.5**

- [x] 9. Spotlight Project Cards
  - [x] 9.1 Create `src/styles/scenes/projects.css` — staggered grid layout with varying card sizes, hover elevation with increased shadow, slide-up description reveal, cursor-following glow integration
    - _Requirements: 5.1, 5.2, 5.6_
  - [x] 9.2 Create `src/scripts/scenes/projects.js` — project scene module with scroll entrance animations (opacity + rotation from alternating directions), glow effect initialization per card
    - _Requirements: 5.3, 5.5_
  - [x] 9.3 Update project section in `index.html` with `data-scene="projects"` and `data-glow` attributes on cards, add project descriptions for hover reveal
    - _Requirements: 5.1, 5.4, 5.6_

- [-] 10. Testimonial Theater Scene
  - [x] 10.1 Create `src/styles/scenes/theater.css` — full-width testimonial layout with large typography, scroll-snap, word-by-word kinetic reveal, gradient sweep on `<mark>` elements, crossfade transitions between quotes
    - _Requirements: 6.1, 6.2, 6.5_
  - [x] 10.2 Create `src/scripts/scenes/theater.js` — theater scene module implementing scroll-snapped testimonial navigation, word-by-word reveal via kinetic-type utility, ambient color shift dispatch on active testimonial change, swipe gesture support on touch
    - _Requirements: 6.2, 6.3, 6.5, 6.6_
  - [x] 10.3 Update testimonials section in `index.html` with `data-scene="theater"` and kinetic typography attributes on quote text
    - _Requirements: 6.1, 6.4_

- [x] 11. Skills Section Redesign
  - [x] 11.1 Create `src/styles/scenes/skills.css` — redesigned skills section with category grouping, animated pill entrance on scroll, subtle glow on hover, visual hierarchy through size/color variation
    - _Requirements: 13.1, 14.3_
  - [x] 11.2 Create `src/scripts/scenes/skills.js` — skills scene module with staggered entrance animation and scroll-triggered reveals
    - _Requirements: 2.3_

- [x] 12. Highlights Impact Scene
  - [x] 12.1 Create `src/styles/scenes/highlights.css` — asymmetric CSS grid layout (3-col desktop, 2-col tablet, 1-col mobile), glassmorphism cards with glow-on-hover, staggered entrance from alternating directions, accent color category system
    - _Requirements: 15.1, 15.3, 15.4, 15.7_
  - [x] 12.2 Create `src/scripts/scenes/highlights.js` — highlights scene module implementing staggered card entrance animations (odd from left, even from right), glow system integration per card, scroll-triggered reveals
    - _Requirements: 15.2, 15.4, 15.6_
  - [x] 12.3 Update `index.html` highlights section markup with `data-scene="highlights"`, `data-glow` attributes on cards, and `data-animate-dir` attributes for alternating entrance direction
    - _Requirements: 15.1, 15.5_

- [x] 13. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Command Palette and Easter Eggs
  - [x] 14.1 Create `src/styles/components/command-palette.css` — centered overlay using `<dialog>`, backdrop blur, search input, command list with keyboard highlight, enter/exit animations
    - _Requirements: 10.1_
  - [x] 14.2 Create `src/scripts/ui/command-palette.js` — CommandPalette class with Cmd+K/Ctrl+K trigger, command registry, substring filtering, arrow key navigation, Enter to execute, Escape to close, focus trap management
    - _Requirements: 10.1, 10.2, 10.3, 10.6_
  - [x] 14.3 Create `src/scripts/ui/easter-eggs.js` — Konami code listener (confetti burst) and logo multi-click handler (Matrix rain effect for 3 seconds)
    - _Requirements: 10.4, 10.5_
  - [x] 14.4 Add `<dialog>` element for Command Palette to `index.html`
    - _Requirements: 10.1_
  - [x] 14.5 Register "Resources" command in Command Palette that navigates to /technical-interview-preparation-kit/
    - _Requirements: 18.2_
  - [ ]* 14.6 Write property test: Command Palette focus trap — while open, Tab/Shift+Tab cycles only within dialog
    - **Property 5: Command Palette Focus Trap**
    - **Validates: Requirements 10.1, 10.6**

- [x] 15. Sound Design Toggle
  - [x] 15.1 Create `src/scripts/ui/sound.js` — SoundToggle class using Web Audio API, AudioContext + GainNode for volume control, 500ms fade in/out, localStorage persistence, autoplay-block detection
    - _Requirements: 11.3, 11.4, 11.5, 11.6_
  - [x] 15.2 Add sound toggle button to `index.html` with `aria-label` and `aria-pressed` attributes, fixed positioning
    - _Requirements: 11.1, 11.2_
  - [x] 15.3 Create or source a subtle ambient audio loop file (~30s) and place in `src/assets/audio/`
    - _Requirements: 11.3_
  - [ ]* 15.4 Write property test: Sound state round-trip — localStorage persistence matches toggled state after simulated reload
    - **Property 6: Sound State Round-Trip**
    - **Validates: Requirements 11.5**

- [-] 16. Connect Section and Cinematic Footer
  - [x] 16.1 Create `src/styles/scenes/connect.css` — connect/links section with bold CTA banner, social link cards with glow effects, cinematic ambient background matching overall system
    - _Requirements: 14.3, 8.5_
  - [x] 16.2 Update connect section in `index.html` with `data-scene="connect"` and glow/magnetic attributes, preserving ALL existing social links (GitHub, Twitter/X, StackOverflow, HackerRank, YouTube, Email, Resume)
    - _Requirements: 16.3_
  - [x] 16.3 Create footer styles with fade-up entrance animation, back-to-top button, logo treatment, "fresh out of localhost" badge, and dynamic year display
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_
  - [x] 16.4 Update footer in `index.html` with `data-scene="footer"` attribute, back-to-top button with smooth scroll to hero
    - _Requirements: 17.4, 17.5, 17.6_

- [ ] 17. SEO, Metadata, and Analytics
  - [ ] 17.1 Preserve all Open Graph meta tags (og:title, og:description, og:image, og:url) in the redesigned `index.html`
    - _Requirements: 16.1_
  - [ ] 17.2 Preserve Twitter Card meta tags (summary_large_image) in the redesigned `index.html`
    - _Requirements: 16.2_
  - [ ] 17.3 Preserve JSON-LD Person schema markup with name, URL, jobTitle, and sameAs social links
    - _Requirements: 16.3_
  - [ ] 17.4 Preserve Google Analytics tracking script (gtag.js with measurement ID G-XHXB3G7XDR)
    - _Requirements: 16.4_
  - [ ] 17.5 Maintain asset preload links for LCP image and critical fonts
    - _Requirements: 16.5, 12.8_

- [ ] 18. App Entry Point and Integration
  - [ ] 18.1 Create `src/scripts/core/app.js` — new main entry point that initializes ScrollEngine, SceneManager, navigation, ambient effects, cursor, and lazy-loads below-fold scene modules via dynamic import
    - _Requirements: 12.8, 2.1_
  - [ ] 18.2 Update `index.html` script entry to point to new `src/scripts/core/app.js`
    - _Requirements: 2.1_
  - [ ] 18.3 Remove old script files that are fully replaced by new modules (animation-engine.js, animations.js, custom-cursor.js, etc.) after confirming feature parity
    - _Requirements: 2.1_

- [ ] 19. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Responsive Adaptation
  - [ ] 20.1 Add responsive breakpoint rules to all scene CSS files — full effects at 1024px+, 50% parallax reduction at 768-1023px, no parallax + touch equivalents below 768px
    - _Requirements: 13.1, 13.2, 13.3_
  - [ ] 20.2 Add fluid typography via CSS `clamp()` for all headings and body text (320px–1440px range)
    - _Requirements: 13.4_
  - [ ] 20.3 Test and fix mobile navigation expanded overlay, touch swipe in theater, timeline single-column collapse
    - _Requirements: 13.5, 13.6, 3.5_

- [ ] 21. Performance Optimization
  - [ ] 21.1 Implement critical CSS inlining for above-fold hero styles in `index.html`
    - _Requirements: 12.1, 12.2_
  - [ ] 21.2 Add `will-change` properties to animated elements and ensure compositor-only animations (transform, opacity)
    - _Requirements: 12.4, 9.3_
  - [ ] 21.3 Implement dynamic imports for non-critical modules (easter-eggs, command-palette, sound) — load on idle or user interaction
    - _Requirements: 12.8_
  - [ ] 21.4 Audit and verify Lighthouse Performance score ≥ 90, LCP ≤ 2.5s, CLS < 0.1
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 22. Final Accessibility Audit
  - [ ] 22.1 Verify skip-navigation link, logical heading hierarchy, and landmark regions
    - _Requirements: 12.7_
  - [ ] 22.2 Verify all interactive elements have 44×44px touch targets and visible focus indicators
    - _Requirements: 12.5, 3.6_
  - [ ] 22.3 Verify `prefers-reduced-motion` completely disables all continuous animations while preserving content visibility
    - _Requirements: 12.6, 8.6, 9.4_
  - [ ] 22.4 Verify color contrast meets WCAG AA (4.5:1) for all text against dark backgrounds
    - _Requirements: 12.5, 14.4_
  - [ ] 22.5 Run axe-core audit and fix any remaining violations
    - _Requirements: 12.5_

- [ ] 23. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based test tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical breakpoints
- Property tests validate universal correctness properties defined in the design document
- The implementation uses vanilla JS ES modules with Vite — no framework migration
- All ambient/decorative elements must include `aria-hidden="true"`
- Reduced-motion support must be verified for every animation-related module
- Old script files should only be removed after confirming feature parity in Task 18.3

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.7"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5", "1.6"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "2.5"] },
    { "id": 4, "tasks": ["2.6", "3.1", "3.2"] },
    { "id": 5, "tasks": ["3.3", "3.4", "4.1"] },
    { "id": 6, "tasks": ["3.5", "3.6", "4.2"] },
    { "id": 7, "tasks": ["4.3", "4.4", "5.1", "5.2", "5.3"] },
    { "id": 8, "tasks": ["5.4", "5.5"] },
    { "id": 9, "tasks": ["7.1", "7.2"] },
    { "id": 10, "tasks": ["7.3", "7.4", "8.1"] },
    { "id": 11, "tasks": ["8.2", "8.3", "9.1"] },
    { "id": 12, "tasks": ["8.4", "9.2", "9.3", "10.1"] },
    { "id": 13, "tasks": ["10.2", "10.3", "11.1"] },
    { "id": 14, "tasks": ["11.2", "12.1"] },
    { "id": 15, "tasks": ["12.2", "12.3"] },
    { "id": 16, "tasks": ["14.1", "14.2", "14.3"] },
    { "id": 17, "tasks": ["14.4", "14.5", "14.6", "15.1"] },
    { "id": 18, "tasks": ["15.2", "15.3", "15.4"] },
    { "id": 19, "tasks": ["16.1", "16.2", "16.3"] },
    { "id": 20, "tasks": ["16.4", "17.1", "17.2", "17.3", "17.4", "17.5"] },
    { "id": 21, "tasks": ["18.1"] },
    { "id": 22, "tasks": ["18.2", "18.3"] },
    { "id": 23, "tasks": ["20.1", "20.2"] },
    { "id": 24, "tasks": ["20.3"] },
    { "id": 25, "tasks": ["21.1", "21.2", "21.3"] },
    { "id": 26, "tasks": ["21.4"] },
    { "id": 27, "tasks": ["22.1", "22.2", "22.3", "22.4"] },
    { "id": 28, "tasks": ["22.5"] }
  ]
}
```
