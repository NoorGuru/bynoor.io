# Design Document: Website Creative Redesign

## Overview

This design transforms bynoor.io into a cinematic, scroll-driven personal brand experience. The architecture retains the current Vite + vanilla JS + CSS stack (no framework migration), but introduces a modular scene-based system, scroll-driven animation API, and layered visual effects pipeline. Every section becomes a "Scene" with entrance/exit choreography, parallax depth, and ambient atmospheric effects.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    index.html                            │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Scene: Cinematic Hero                              ││
│  │  Scene: Highlights (Career Impact)                  ││
│  │  Scene: Story Timeline (Career Journey)             ││
│  │  Scene: Skills Constellation                        ││
│  │  Scene: Spotlight Projects                          ││
│  │  Scene: Testimonial Theater                         ││
│  │  Scene: Connect (Links + CTA)                       ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  src/scripts/                            │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│  │ core/        │ │ scenes/      │ │ effects/        │ │
│  │ ├ app.js     │ │ ├ hero.js    │ │ ├ ambient.js    │ │
│  │ ├ scroll-    │ │ ├ highlights.│ │ ├ grain.js      │ │
│  │ │  engine.js │ │ │  js        │ │ ├ glow.js       │ │
│  │ ├ scene-     │ │ ├ timeline.js│ │ ├ cursor.js     │ │
│  │ │  manager.js│ │ ├ projects.js│ │ └ particles.js  │ │
│  │ └ nav.js     │ │ ├ theater.js │ │                 │ │
│  │              │ │ └ skills.js  │ │                 │ │
│  └──────────────┘ └──────────────┘ └─────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐                     │
│  │ ui/          │ │ utils/       │                     │
│  │ ├ command-   │ │ ├ lerp.js    │                     │
│  │ │  palette.js│ │ ├ raf.js     │                     │
│  │ ├ sound.js   │ │ ├ observer.js│                     │
│  │ └ easter-    │ │ └ motion.js  │                     │
│  │    eggs.js   │ │              │                     │
│  └──────────────┘ └──────────────┘                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  src/styles/                             │
│  tokens.css → reset.css → fonts.css                     │
│  layers/ (ambient, grain, glow, depth)                  │
│  scenes/ (hero, timeline, projects, theater, skills)    │
│  components/ (nav, cursor, command-palette, cards)       │
│  animations.css (keyframes + scroll-driven)             │
└─────────────────────────────────────────────────────────┘
```

### Technology Decisions

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Build tool | Vite 6 | Already in use, excellent DX, fast HMR |
| Language | Vanilla JS (ES modules) | No framework overhead, maximum performance control |
| Styling | CSS Custom Properties + `@property` | Animatable custom properties for gradient transitions |
| Scroll Animations | CSS Scroll-Driven Animations API + JS fallback | Native performance, progressive enhancement |
| 3D/Canvas | HTML5 Canvas 2D (particles) | Lightweight, no WebGL dependency |
| Audio | Web Audio API | Low-latency, precise volume control |
| Typography | Variable fonts (Inter, Space Grotesk) | Already loaded, support weight/width animation |
| Deployment | GitHub Pages (existing) | No change needed |

### Scroll Engine Design

The Scroll Engine is the central orchestrator. It uses the native CSS `animation-timeline: scroll()` and `view()` for browsers that support it, with an IntersectionObserver + requestAnimationFrame fallback.

```
ScrollEngine
├── Registers scenes via data-scene attributes
├── Computes normalized progress [0,1] per scene
├── Dispatches scene-enter / scene-active / scene-exit events
├── Controls Depth_System parallax multipliers
└── Respects prefers-reduced-motion
```

### Scene Lifecycle

Each scene module exports:
- `init(sceneEl)` — set up DOM references, bind events
- `enter(progress)` — entrance animation (0→1)
- `active(progress)` — while in viewport
- `exit(progress)` — exit animation (0→1)
- `destroy()` — cleanup

### Navigation State Machine

```
States: HERO_MODE → PILL_MODE → EXPANDED_MODE (mobile)

HERO_MODE:
  - Minimal floating dots
  - Triggered: scroll position < hero height

PILL_MODE:
  - Compact bar with labels + sliding indicator
  - Triggered: scroll position >= hero height

EXPANDED_MODE:
  - Full-screen overlay (mobile hamburger)
  - Triggered: user tap on hamburger
```

## Components and Interfaces

### External Interfaces

| Interface | Type | Description |
|-----------|------|-------------|
| Google Analytics | Script (external) | GA4 measurement via gtag.js (ID: G-XHXB3G7XDR) |
| Cal.com | External link | Scheduling CTA opens in new tab |
| GitHub Pages | Deployment | Static hosting, no server-side logic |
| go.bynoor.io | Redirect service | Short-link redirects for social profiles |

### Internal Module Interfaces

| Module | Exports | Consumers |
|--------|---------|-----------|
| ScrollEngine | `registerScene()`, `getProgress()`, `onSceneChange()`, `destroy()` | SceneManager, Nav, Ambient |
| SceneManager | `init()`, `getActiveScene()` | App entry point |
| Nav | `initNav()`, `setActiveSection()` | App, ScrollEngine events |
| KineticType | `splitText(el, mode)`, `triggerReveal(el)` | Hero, Theater, Highlights |
| Ambient | `initAmbient()`, `setAccentHue(hue)` | SceneManager (on section change) |
| Grain | `initGrain()`, `destroy()` | App entry point |
| Glow | `initGlow(selector)` | Projects, Highlights, Connect |
| MagneticCursor | `init()`, `destroy()` | App entry point |
| CommandPalette | `open()`, `close()`, `registerCommand()` | App, Easter Eggs |
| SoundToggle | `init()`, `toggle()`, `getState()` | App entry point |
| Particles | `initParticles(canvas, config)`, `destroy()` | Hero scene |

### Scene Module Interface (shared contract)

```typescript
interface SceneModule {
  init(sceneEl: HTMLElement): void;
  enter(progress: number): void;   // 0→1
  active(progress: number): void;  // 0→1 within viewport
  exit(progress: number): void;    // 0→1
  destroy(): void;
}
```

## Data Models

### Command Registry Entry

```js
{
  id: string,          // unique identifier
  label: string,       // display name in palette
  action: () => void,  // execution callback
  shortcut?: string,   // keyboard shortcut display
  category: string,    // grouping: 'navigation' | 'action' | 'easter-egg'
  keywords: string[]   // search terms for fuzzy matching
}
```

### Scene Configuration

```js
{
  id: string,            // matches data-scene attribute
  element: HTMLElement,  // DOM reference
  accentHue: number,     // 0-360 hue for ambient layer
  parallaxLayers: {
    background: number,  // speed multiplier (0.1-0.3)
    midground: number,   // speed multiplier (0.3-0.6)
    foreground: number   // speed multiplier (0.6-1.0)
  }
}
```

### Timeline Milestone Data

```js
{
  year: string,        // e.g., "2025"
  title: string,       // role title
  company: string,     // company name
  side: 'left'|'right', // alternating position
  achievements: string[], // expanded details
  accentColor: string  // CSS color for node glow
}
```

### Sound State

```js
{
  enabled: boolean,    // current toggle state
  volume: number,      // 0.0-1.0 gain value
  context: AudioContext | null,
  source: AudioBufferSourceNode | null
}
```

## Components

### 1. Cinematic Hero Scene

**Structure:**
```html
<section data-scene="hero" class="scene scene--hero">
  <div class="hero__ambient-layer" aria-hidden="true"></div>
  <canvas class="hero__particles" aria-hidden="true"></canvas>
  <div class="hero__grain" aria-hidden="true"></div>
  <div class="hero__content">
    <picture class="hero__photo-wrap">...</picture>
    <h1 class="hero__name" data-kinetic="chars">Mohammad Noor</h1>
    <p class="hero__tagline" data-kinetic="words">I build tools that help engineers move faster.</p>
    <p class="hero__role">Software Engineer · AI Advocate · Tech Educator</p>
    <div class="hero__actions">...</div>
  </div>
  <div class="hero__scroll-cue" aria-hidden="true"></div>
</section>
```

**Kinetic Name Reveal:** Each character wrapped in a `<span>` with staggered `animation-delay`. Characters slide up from below with rotation, then settle. Uses `@property` registered `--char-progress` for smooth interpolation.

**Photo Treatment:** Luminous double-ring with rotating gradient border using `conic-gradient` + animation.

### 2. Scroll Engine (core/scroll-engine.js)

**API:**
```js
class ScrollEngine {
  constructor(options = {}) {}
  registerScene(element, callbacks) {}
  getProgress(sceneId) {} // returns 0-1
  onSceneChange(callback) {}
  destroy() {}
}
```

**Implementation Strategy:**
- Uses `IntersectionObserver` with multiple thresholds (0, 0.1, 0.25, 0.5, 0.75, 1.0) for coarse lifecycle
- Uses `scroll` event with `requestAnimationFrame` throttle for smooth per-frame progress
- Exposes `--scene-progress` CSS variable on each scene element for CSS-only animations
- Progressive: if `CSS.supports('animation-timeline: scroll()')`, delegates to native CSS scroll animations

### 3. Morphing Navigation (core/nav.js)

**DOM Structure:**
```html
<nav class="nav" data-nav-state="hero">
  <div class="nav__dots"><!-- dot per scene --></div>
  <div class="nav__pill">
    <span class="nav__indicator"></span>
    <a href="#hero">Home</a>
    <a href="#timeline">Journey</a>
    ...
  </div>
  <button class="nav__trigger" aria-expanded="false">Menu</button>
</nav>
```

**Morph Animation:** Uses `clip-path` transitions and `transform` to smoothly reshape between dot layout and pill bar. The `--nav-morph-progress` variable (driven by scroll) interpolates between states.

### 4. Story Timeline (scenes/timeline.js)

**Layout:** CSS Grid with 2-column alternating pattern. Each milestone is a node on a vertical line:

```html
<section data-scene="timeline" class="scene scene--timeline">
  <div class="timeline__track" aria-hidden="true"></div>
  <article class="timeline__milestone" data-year="2025" data-side="right">
    <div class="timeline__node"></div>
    <div class="timeline__content">
      <h3>SDE III — Gateway Foundations</h3>
      <p>Expedia Group</p>
      <div class="timeline__expanded"><!-- details on hover/focus --></div>
    </div>
  </article>
  ...
</section>
```

**Scroll Behavior:** As the timeline scrolls, a "progress line" fills the track. Milestones animate in with scale + opacity when they cross a threshold. The active (centered) milestone gets `scale(1.05)` and full opacity; others dim to 60%.

### 5. Spotlight Cards (scenes/projects.js)

**Layout:** CSS Grid with `grid-template-rows: masonry` (with fallback to staggered heights via nth-child rules).

**Glow Effect:** A `<div class="card__glow">` is positioned absolute within each card. On `mousemove`, its `background: radial-gradient(...)` position updates to follow the cursor via CSS variables `--glow-x` and `--glow-y`.

```css
.card__glow {
  background: radial-gradient(
    300px circle at var(--glow-x) var(--glow-y),
    rgba(139, 92, 246, 0.15),
    transparent 70%
  );
}
```

### 6. Testimonial Theater (scenes/theater.js)

**Structure:** A scroll-snapped container where each testimonial occupies ~80vh. As the testimonial enters center viewport, words animate in sequentially. Key phrases (marked with `<mark>`) get a gradient sweep.

**Crossfade:** Uses `scroll-snap-type: y mandatory` with CSS `view-timeline` for each testimonial card. Opacity and translateY are animated via scroll progress.

### 7. Magnetic Cursor (effects/cursor.js)

**Approach:** Two elements — an outer ring and inner dot. Position updated via `requestAnimationFrame` with lerp-based smoothing (factor 0.15 for ring, 0.3 for dot). 

**Magnetic Pull:** Elements with `data-magnetic` attribute. On `mousemove`, calculate distance; if within 80px threshold, offset the cursor toward element center using exponential decay.

**Shape Morphing:** CSS classes toggled via JS: `.cursor--text` (vertical bar), `.cursor--action` (expanded with label), `.cursor--click` (compressed).

### 8. Ambient Layer (effects/ambient.js)

**Implementation:** Multiple `<div>` elements with large `border-radius: 50%`, blurred (`filter: blur(80px)`), positioned absolute, animated with CSS keyframes at different speeds/directions. Colors driven by `--ambient-hue-1`, `--ambient-hue-2` custom properties that transition when sections change.

### 9. Grain Overlay (effects/grain.js)

**Implementation:** A small (256×256) canvas with procedural noise, rendered to a data URL, applied as `background-image` with `background-size: 128px` and `opacity: 0.04`. Re-rendered every 100ms (10fps) for subtle animation. Uses `pointer-events: none` and `position: fixed`.

### 10. Kinetic Typography (shared utility)

**Approach:** On `DOMContentLoaded`, elements with `data-kinetic="chars"` or `data-kinetic="words"` are split into spans. Each span gets `animation-delay` based on index. Actual animation triggers via IntersectionObserver (adds `.is-visible` class).

```css
[data-kinetic="chars"] .char {
  opacity: 0;
  transform: translateY(100%) rotateX(-80deg);
  transition: opacity 0.4s, transform 0.6s;
  transition-delay: calc(var(--char-index) * 30ms);
}

[data-kinetic="chars"].is-visible .char {
  opacity: 1;
  transform: translateY(0) rotateX(0);
}
```

### 11. Command Palette (ui/command-palette.js)

**Implementation:** A `<dialog>` element with a search input. Commands are a static array of `{ label, action, shortcut, category }`. Filter uses simple substring match. Arrow keys navigate, Enter selects.

### 12. Sound Toggle (ui/sound.js)

**Implementation:** Web Audio API with `AudioContext`. A single ambient audio file (looping, ~30s). Gain node controls volume (fade in/out over 500ms). State persisted to `localStorage('bynoor-sound')`.

### 13. Easter Egg Engine (ui/easter-eggs.js)

**Implementation:** Konami code listener (`↑↑↓↓←→←→BA`). On trigger, a brief confetti burst using canvas particles (reuses particle system). Additional easter egg: clicking the logo 7 times triggers a "Matrix rain" effect for 3 seconds.

### 14. Highlights Scene (scenes/highlights.js)

**Structure:**
```html
<section data-scene="highlights" class="scene scene--highlights">
  <div class="highlights__container">
    <h2 data-kinetic="words">Highlights</h2>
    <div class="highlights__grid">
      <article class="highlights__card" data-glow data-animate-dir="left">
        <span class="highlights__icon" aria-hidden="true">🤖</span>
        <h3>AI Platform Builder</h3>
        <p>Built an AI-powered migration platform that turned weeks of work into hours</p>
      </article>
      <!-- ... more cards -->
    </div>
  </div>
</section>
```

**Layout:** Asymmetric CSS Grid — first card spans 2 columns on desktop (3-col grid), falls to single column below 768px.

**Scroll Behavior:** Cards animate in with staggered delays from alternating directions (odd from left, even from right) using `translateX` + opacity. The Glow system attaches to each card for cursor-following radial highlight.

**Accent:** Section uses warm amber/gold (`--accent-quaternary`) as its ambient hue shift.

### 15. Footer Scene

**Structure:**
```html
<footer class="footer scene scene--footer" data-scene="footer">
  <a href="#hero" class="footer__logo">
    <span class="footer__logo-by">by</span>
    <span class="footer__logo-noor">noor</span>
    <span class="footer__logo-io">.io</span>
  </a>
  <div class="footer__beta">
    <span class="footer__beta-badge">✨ fresh out of localhost</span>
    <p class="footer__beta-note">Brand new site. Still tweaking, still shipping.</p>
  </div>
  <p class="footer__copyright">2012 – <span id="year"></span> · Built with 🤍</p>
  <button class="footer__back-to-top" aria-label="Back to top">↑</button>
</footer>
```

**Behavior:** Fade-up entrance on scroll. Back-to-top button smooth-scrolls to hero. Logo click also returns to top. Ambient layer and grain overlay remain active through footer.

## Error Handling

| Scenario | Fallback | Implementation |
|----------|----------|----------------|
| Canvas 2D not supported | Hide particle canvas, show static gradient | Feature-detect `canvas.getContext('2d')` in particles.js |
| Web Audio API blocked | Keep Sound_Toggle muted, disable interaction feedback | Catch `AudioContext` creation error in sound.js |
| IntersectionObserver unsupported | Load all scenes immediately, skip entrance animations | Check `window.IntersectionObserver` in observer.js factory |
| CSS Scroll-Driven Animations unsupported | Fall back to JS-based scroll progress via rAF | `CSS.supports('animation-timeline: scroll()')` check in scroll-engine.js |
| `@property` not supported | Gradients animate as step transitions (no smooth interpolation) | No JS fallback needed — visual degradation only |
| Reduced motion active | All animations disabled, content visible immediately | `motion.js` utility sets class on `<html>`, CSS does the rest |
| Font load failure | System font stack (`-apple-system, sans-serif`) takes over | Already defined in font stack fallbacks |
| Audio file fetch failure | Sound_Toggle shows muted state, no error UI | Catch in `fetch()` promise, log silently |
| LocalStorage unavailable (private browsing) | Sound preference not persisted, defaults to muted each visit | Try/catch around `localStorage` access |

## Testing Strategy

### Frameworks

| Type | Tool | Location |
|------|------|----------|
| Unit tests | Vitest | `tests/unit/` |
| Property tests | Vitest + fast-check | `tests/property/` |
| E2E tests | Playwright | `tests/e2e/` |
| Integration | Vitest | `tests/integration/` |

### Property-Based Tests (Correctness Properties)

| Property | Test File | Approach |
|----------|-----------|----------|
| Scene Progress Invariant | `tests/property/scroll-engine.test.js` | Generate random scroll positions, assert sum ≈ 1.0 |
| Navigation State Consistency | `tests/property/nav-state.test.js` | Generate scrollY values, assert state matches threshold |
| Reduced Motion Idempotence | `tests/property/reduced-motion.test.js` | With flag set, assert all elements have identity transforms |
| Cursor Cleanup | `tests/property/cursor-cleanup.test.js` | Init + destroy, count remaining listeners via spy |
| Command Palette Focus Trap | `tests/property/command-palette.test.js` | Open palette, simulate Tab cycles, assert focus stays within |
| Sound State Round-Trip | `tests/property/sound-state.test.js` | Generate random toggle sequences, assert localStorage consistency |
| Kinetic Typography Completeness | `tests/property/kinetic-type.test.js` | Trigger reveal, assert all spans opacity=1, transform=none |
| Timeline Milestone Ordering | `tests/property/timeline-order.test.js` | Resize viewport randomly, assert DOM order unchanged |

### E2E Tests

| Test | Coverage |
|------|----------|
| Navigation morphing | Scroll past hero → verify pill mode renders |
| Timeline interaction | Hover/tap milestones → verify expand behavior |
| Command Palette | Cmd+K → type → select → verify navigation |
| Sound Toggle | Click → verify audio plays → click again → verify silent |
| Responsive adaptation | Resize viewport → verify parallax disabled below 768px |
| Accessibility | axe-core audit on all scenes |
| Performance | Lighthouse CI assertions (LCP ≤ 2.5s, CLS < 0.1) |

## Data Flow

```
User Scroll Input
       │
       ▼
┌─────────────────┐
│  ScrollEngine   │ ── updates --scene-progress CSS vars
│  (core)         │ ── dispatches scene lifecycle events
└────────┬────────┘
         │
    ┌────┴────┬──────────┬─────────────┐
    ▼         ▼          ▼             ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│ Scene  │ │ Nav    │ │Ambient │ │ Depth    │
│Modules │ │ State  │ │ Layer  │ │ System   │
└────────┘ └────────┘ └────────┘ └──────────┘
```

**Cursor data flow:**
```
Mouse Move Event
       │
       ▼
┌─────────────────┐
│ Magnetic Cursor │ ── lerp position to target
│                 │ ── check proximity to [data-magnetic]
│                 │ ── morph shape based on hovered element
└─────────────────┘
```

## Key Decisions

### Why Vanilla JS over a Framework?

The site is a single-page portfolio with no dynamic data fetching, no complex state, and no user-generated content. A framework would add bundle weight (50-100KB+) with zero benefit. The modular ES module approach gives us tree-shaking, code splitting (dynamic imports for below-fold scenes), and full control over animation timing.

### Why CSS Scroll-Driven Animations?

Chrome 115+ supports `animation-timeline: scroll()` natively on the compositor thread — zero JS, zero jank. For Safari/Firefox fallback, we use IntersectionObserver + rAF which is already proven in the current site. Progressive enhancement means the experience upgrades automatically as browser support grows.

### Why Not Three.js / WebGL?

The dreamy atmosphere doesn't require 3D geometry. Canvas 2D particles + CSS blur/gradient layers achieve the desired visual with 10x less code and no heavy library. The site must hit 90+ Lighthouse — a 200KB WebGL library would be counterproductive.

### Why `@property` Registered Custom Properties?

Animating `hsl()` colors within gradients requires the browser to understand the property type. `@property --hue` with `syntax: "<number>"` enables smooth gradient mesh animations that are impossible with regular custom properties.

## File Structure

```
src/
├── scripts/
│   ├── core/
│   │   ├── app.js              (entry point, module init)
│   │   ├── scroll-engine.js    (scroll orchestrator)
│   │   ├── scene-manager.js    (scene lifecycle)
│   │   └── nav.js              (morphing navigation)
│   ├── scenes/
│   │   ├── hero.js             (cinematic hero animations)
│   │   ├── highlights.js       (career impact cards scene)
│   │   ├── timeline.js         (career timeline interactions)
│   │   ├── projects.js         (spotlight cards)
│   │   ├── theater.js          (testimonial theater)
│   │   └── skills.js           (skills constellation)
│   ├── effects/
│   │   ├── ambient.js          (gradient orbs, color shifts)
│   │   ├── grain.js            (film grain overlay)
│   │   ├── glow.js             (cursor-following glows)
│   │   ├── cursor.js           (magnetic cursor)
│   │   ├── particles.js        (canvas particle system)
│   │   └── kinetic-type.js     (text splitting + animation triggers)
│   ├── ui/
│   │   ├── command-palette.js  (Cmd+K overlay)
│   │   ├── sound.js            (ambient audio toggle)
│   │   └── easter-eggs.js      (hidden interactions)
│   └── utils/
│       ├── lerp.js             (linear interpolation)
│       ├── raf.js              (rAF scheduler / throttle)
│       ├── observer.js         (IntersectionObserver factory)
│       └── motion.js           (reduced-motion detection)
├── styles/
│   ├── tokens.css              (design tokens + @property)
│   ├── reset.css               (CSS reset)
│   ├── fonts.css               (font-face declarations)
│   ├── layers/
│   │   ├── ambient.css         (gradient mesh, orbs)
│   │   ├── grain.css           (noise overlay)
│   │   ├── glow.css            (radial glow effects)
│   │   └── depth.css           (parallax layer rules)
│   ├── scenes/
│   │   ├── hero.css            (cinematic hero)
│   │   ├── highlights.css      (career impact cards)
│   │   ├── timeline.css        (story timeline)
│   │   ├── projects.css        (spotlight cards)
│   │   ├── theater.css         (testimonial theater)
│   │   ├── skills.css          (skills section)
│   │   └── connect.css         (links/CTA section)
│   ├── components/
│   │   ├── nav.css             (morphing navigation)
│   │   ├── cursor.css          (magnetic cursor styles)
│   │   ├── command-palette.css (overlay styles)
│   │   ├── cards.css           (shared card styles)
│   │   └── buttons.css         (CTA buttons)
│   ├── animations.css          (keyframes + scroll-driven)
│   └── main.css                (import orchestrator)
└── assets/
    ├── fonts/                   (existing variable fonts)
    └── audio/
        └── ambient-loop.mp3    (subtle ambient soundscape, ~30s loop)
```

## Performance Strategy

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.5s | Preload hero image + critical CSS inline |
| CLS | < 0.1 | Reserve space for all animated elements |
| FPS | 60fps | CSS animations on compositor, rAF batching |
| Bundle | < 50KB gzipped JS | Dynamic imports for below-fold scenes |
| Fonts | < 100KB | Already using variable fonts (subset) |
| Audio | Lazy-loaded | Only fetched on Sound_Toggle activation |

**Code Splitting Strategy:**
```js
// core/app.js — critical path
import { ScrollEngine } from './scroll-engine.js';
import { initNav } from './nav.js';

// Lazy load scenes after first paint
const loadScenes = () => Promise.all([
  import('../scenes/hero.js'),
  import('../scenes/timeline.js'),
  import('../scenes/projects.js'),
  import('../scenes/theater.js'),
]);
```

## Accessibility Strategy

- All animations respect `prefers-reduced-motion: reduce`
- Grain overlay and ambient layers use `aria-hidden="true"`
- Skip navigation link preserved
- Logical heading hierarchy (h1 → h2 → h3)
- All interactive elements have 44×44px minimum touch targets
- Keyboard navigation works without cursor effects
- Command palette is fully keyboard-navigable (dialog element handles focus trapping)
- Sound toggle has explicit aria-label and aria-pressed state
- Color contrast meets WCAG AA (4.5:1 minimum for text)

## Correctness Properties

### Property 1: Scene Progress Invariant
For any scroll position, the sum of all visible scene progress values equals exactly 1.0 (±0.01 tolerance for transition overlap).

**Validates: Requirements 2.1, 2.2**

### Property 2: Navigation State Consistency
The Morphing_Navigation state always reflects the current scroll position — if scrollY > heroHeight, nav state is PILL_MODE.

**Validates: Requirements 3.1, 3.2**

### Property 3: Reduced Motion Idempotence
With `prefers-reduced-motion: reduce`, calling any animation init function produces the same visual result as not calling it (all elements visible, no transforms).

**Validates: Requirements 12.6, 8.6**

### Property 4: Cursor Cleanup
When the cursor module destroys (e.g., on touch device detection), zero event listeners remain attached to document or window.

**Validates: Requirements 7.6**

### Property 5: Command Palette Focus Trap
While the Command_Palette is open, Tab/Shift+Tab cycles focus only within the palette dialog.

**Validates: Requirements 10.1, 10.6**

### Property 6: Sound State Round-Trip
`localStorage.setItem('bynoor-sound', state)` → page reload → `localStorage.getItem('bynoor-sound')` returns the same state.

**Validates: Requirements 11.5**

### Property 7: Kinetic Typography Completeness
After a kinetic element's animation completes, 100% of its text content is visible with opacity 1 and transform identity.

**Validates: Requirements 9.1, 9.5**

### Property 8: Timeline Milestone Ordering
Milestones in the DOM maintain chronological order (most recent first) regardless of viewport width or animation state.

**Validates: Requirements 4.1, 4.5**

**Validates: Requirement 4.1, 4.5**
