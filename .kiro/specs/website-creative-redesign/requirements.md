# Requirements Document

## Introduction

A creative redesign of bynoor.io — Mohammad Noor Abu Khlaif's personal brand website. The goal is to transform the current clean-but-generic design into a bold, dynamic, and visually striking experience that reflects personality, creativity, and modern 2025/2026 web design trends. The site remains a static HTML/CSS/JS site deployed via GitHub Pages (using Vite for development).

## Glossary

- **Site**: The bynoor.io personal brand website
- **Visitor**: Any person viewing the website
- **Hero_Section**: The full-viewport introductory section with name, tagline, and profile photo
- **Highlights_Section**: The section displaying career achievements as cards
- **Skills_Section**: The section displaying technical skills as categorized pill badges
- **Connect_Section**: The section with social links and scheduling CTA
- **Projects_Section**: The section showcasing recent projects
- **Navigation**: The site header with logo and section links
- **Animation_Engine**: The JavaScript module responsible for scroll-triggered and interactive animations
- **Custom_Cursor**: A stylized cursor element that replaces or augments the default browser cursor on desktop
- **Gradient_Mesh**: An animated, multi-color gradient background using CSS or canvas
- **Glassmorphism**: A design pattern using frosted-glass-like translucent backgrounds with backdrop blur
- **Particle_System**: Lightweight animated floating elements (dots, shapes, or glowing orbs) in the background
- **Scroll_Progress**: A visual indicator showing the user's scroll position on the page
- **Magnetic_Element**: An interactive element that subtly follows the cursor when nearby

## Requirements

### Requirement 1: Bold Visual Identity and Color System

**User Story:** As a visitor, I want the site to have a vibrant, bold visual identity, so that it immediately feels creative, modern, and memorable.

#### Acceptance Criteria

1. THE Site SHALL use a dark-mode-first color scheme with a background lightness no greater than 10% HSL lightness and at least two vibrant accent colors with saturation of 70% or higher
2. THE Site SHALL use animated gradient mesh backgrounds in the Hero_Section that cycle through at least 3 color stops over a duration between 8 and 20 seconds per full cycle, with each color stop shifting no more than 30 degrees in hue per cycle
3. THE Site SHALL apply a defined set of no more than 4 neon-accent colors consistently across all interactive elements (buttons, links, card borders), where each accent color is used for the same element type site-wide
4. WHEN a section scrolls into view, THE Site SHALL reveal that section's assigned accent color through a border glow or gradient highlight that transitions in over a duration of 300ms to 600ms
5. THE Site SHALL maintain a minimum contrast ratio of 4.5:1 for body text and 3:1 for large text against all background colors
6. IF the user has enabled a prefers-reduced-motion setting, THEN THE Site SHALL pause the gradient mesh animation output and display a static gradient background instead, while keeping the animation system initialized in the background

### Requirement 2: Dynamic Hero Section

**User Story:** As a visitor, I want the hero section to be visually dramatic and engaging, so that I am immediately drawn in and want to explore further.

#### Acceptance Criteria

1. THE Hero_Section SHALL display a full-viewport (minimum 100vh height) animated background using a gradient mesh or particle system that renders at 30 frames per second or higher on the device's display
2. THE Hero_Section SHALL present the name using bold typography at a minimum computed font size of 28px (scaling up to 48px on viewports 768px or wider) with a gradient text fill or animated color-shifting effect
3. THE Hero_Section SHALL include a profile photo (minimum 150px diameter on mobile, 200px on viewports 768px or wider) displayed with a circular clip, a visible animated border or glowing ring effect, and a CSS transform that produces a floating or 3D-rotation appearance
4. WHEN the page loads and reduced-motion preferences are not active, THE Hero_Section SHALL animate at least 3 distinct elements (photo, heading, tagline) in with staggered entrance animations (using a combination of opacity fade, translate, or scale transforms) completing all entrances within 1500ms of page load
5. THE Hero_Section SHALL include a scroll-down indicator positioned at the bottom of the viewport area with a continuously looping vertical bounce or pulse animation (cycle duration between 1000ms and 2000ms)
6. WHILE the user has enabled reduced-motion preferences in their operating system, THE Hero_Section SHALL disable all transform-based animations and transitions, displaying all elements in their final state immediately without entrance delays or background animation

### Requirement 3: Creative Typography and Layout

**User Story:** As a visitor, I want the typography and layout to feel modern and expressive, so that the site stands out from generic templates.

#### Acceptance Criteria

1. THE Site SHALL use at least three distinct font-weight values (ranging from 300 to 700) and heading font sizes that are at minimum 2× the body text size (body: 1rem, headings: 2rem or larger) to create scale contrast between headings and body text
2. THE Site SHALL use grid layouts for the Highlights_Section and Projects_Section where at least one grid item spans a different number of columns than the others at viewport widths of 768px and above
3. THE Site SHALL apply a CSS gradient fill (using background-clip: text) or an animated underline (with transition duration no longer than 300ms) on each section heading
4. WHEN the user scrolls past the hero section, THE Navigation SHALL display a frosted-glass background using backdrop-filter: blur with a semi-transparent background color
5. WHEN the viewport width is below 768px, THE Site SHALL reflow creative layouts to a single-column grid while preserving gradient fills or animated underlines on headings, card border treatments, and hover/focus interaction styles

### Requirement 4: Scroll-Driven Animations and Interactions

**User Story:** As a visitor, I want the page to feel alive and responsive as I scroll, so that exploring the site is an engaging experience.

#### Acceptance Criteria

1. WHEN a content block (any element with a `data-animate` attribute) becomes at least 20% visible in the viewport, THE Animation_Engine SHALL trigger its entrance animation (fade-in with upward translation) exactly once and not re-trigger on subsequent scrolls
2. THE Site SHALL display a Scroll_Progress indicator as a fixed gradient line at the top of the page, with its width representing the percentage of the page scrolled (0% width at the top, 100% width at the bottom)
3. WHEN a Highlights_Section card or link-card is hovered, THE Site SHALL apply a vertical lift transform (translateY of -4px) combined with an elevated box-shadow within 200ms, even when reduced-motion preferences are active since these are user-initiated interactions
4. WHEN the Highlights_Section enters the viewport, THE Animation_Engine SHALL animate its cards in with staggered timing, each card delayed by 100ms after the previous one
5. WHILE the Visitor is scrolling, THE Site SHALL apply parallax movement to background decorative elements by translating them at a rate no greater than 50% of the scroll speed relative to the foreground content
6. IF the prefers-reduced-motion media query is active, THEN THE Animation_Engine SHALL disable all transform-based animations, remove transition delays, and render all content blocks in their final visible state without entrance transitions

### Requirement 5: Interactive Cursor and Magnetic Elements

**User Story:** As a visitor on desktop, I want playful cursor interactions, so that the site feels uniquely crafted and interactive.

#### Acceptance Criteria

1. WHEN the viewport width is at least 1024px, THE Site SHALL display a Custom_Cursor element that follows the mouse position with a trailing delay between 50ms and 150ms, and SHALL hide the native browser cursor
2. WHEN the Custom_Cursor hovers over a button or link, THE Custom_Cursor SHALL scale to 1.5× its default size and change its visual style to a distinct hover state (e.g., ring expansion or fill change) within 200ms
3. WHEN the viewport width is below 1024px, THE Site SHALL hide the Custom_Cursor element and use the default browser cursor
4. WHEN the Visitor moves the cursor within 80px of a CTA button's center, THE button SHALL translate toward the cursor position by a maximum of 8px in any direction
5. IF the prefers-reduced-motion media query is active, THEN THE Site SHALL disable the Custom_Cursor element, restore the default browser cursor, and disable all Magnetic_Element translation effects
6. WHEN the Custom_Cursor is active and the cursor leaves the browser viewport, THE Site SHALL hide the Custom_Cursor element until the cursor re-enters the viewport

### Requirement 6: Glassmorphism Cards and UI Elements

**User Story:** As a visitor, I want UI cards and containers to feel modern and layered, so that the design has depth and visual sophistication.

#### Acceptance Criteria

1. THE Highlights_Section cards SHALL use Glassmorphism styling with a background opacity between 0.05 and 0.15, backdrop-filter blur of at least 10px, and a 1px border with opacity between 0.1 and 0.3
2. THE Connect_Section link cards SHALL use Glassmorphism styling with a border gradient that activates on hover, transitioning over no more than 200ms
3. THE Projects_Section cards SHALL use Glassmorphism styling with a 4px left-border accent glow using the project's assigned accent color at 80% opacity
4. WHEN a Glassmorphism card is hovered, THE card SHALL increase its background opacity by at least 0.05 and its border opacity by at least 0.1 within 200ms
5. THE Site SHALL ensure all card text (headings and body) maintains a minimum contrast ratio of 4.5:1 against the card's computed background, including the translucent layer and any underlying section background

### Requirement 7: Particle and Decorative Background Effects

**User Story:** As a visitor, I want subtle animated background elements, so that the site feels dynamic without being distracting.

#### Acceptance Criteria

1. THE Hero_Section SHALL include a canvas-based or DOM-based Particle_System that renders floating semi-transparent orbs or geometric shapes with individual particle sizes between 4px and 12px in diameter
2. THE Particle_System SHALL render a maximum of 50 particles and maintain a frame rate of at least 60fps on devices with a hardware concurrency of 4 or more cores
3. WHILE the Visitor scrolls past the Hero_Section, THE Particle_System SHALL fade out by reducing its container opacity from 1 to 0 over a scroll distance equal to 200px beyond the Hero_Section bottom edge
4. THE Site SHALL include CSS-based decorative elements (gradient blobs, radial glows) positioned behind at least 2 content sections using z-index layering and pointer-events set to none
5. WHEN the prefers-reduced-motion media query is active, THE Particle_System SHALL be hidden entirely and all CSS-based decorative element animations SHALL be paused or removed
6. THE Particle_System container SHALL have pointer-events set to none so that particles do not intercept click or hover interactions intended for underlying content

### Requirement 8: Skills Section Visual Redesign

**User Story:** As a visitor, I want the skills section to be visually interesting and interactive, so that it communicates expertise in a memorable way.

#### Acceptance Criteria

1. THE Skills_Section SHALL display skill pills with gradient backgrounds (using at least 2 color stops) and a box-shadow glow effect (spread radius between 2px and 6px) that activates on hover
2. WHEN a skill pill is hovered, THE skill pill SHALL scale to between 1.05× and 1.1× its default size and increase its box-shadow spread by at least 2px within 200ms
3. WHEN the Skills_Section enters the viewport, THE Animation_Engine SHALL animate each skill category in sequentially with a delay of 150ms to 250ms between categories
4. THE Skills_Section SHALL display category labels as accent-colored tags with a border-radius of at least 4px, a distinct background color per category, and a font weight of at least 600
5. WHEN the viewport width is at or below 768px, THE Skills_Section SHALL display pills in a flex-wrap layout that flows naturally without horizontal scrolling
6. IF the prefers-reduced-motion media query is active, THEN THE Skills_Section SHALL display all categories and pills immediately without staggered entrance animations or scale transforms on hover, while preserving gradient backgrounds and glow visual effects

### Requirement 9: Performance and Accessibility

**User Story:** As a visitor, I want the site to load quickly and be accessible, so that all users have a good experience regardless of device or ability.

#### Acceptance Criteria

1. THE Site SHALL achieve a Lighthouse Performance score of at least 90 on mobile using Lighthouse default mobile throttling (simulated slow 4G with 4x CPU slowdown)
2. THE Site SHALL achieve a Lighthouse Accessibility score of at least 95
3. THE Site SHALL render the Largest Contentful Paint (LCP) element within 2 seconds on a simulated 4G connection (1.6 Mbps download, 750ms RTT) with an empty cache
4. THE Site SHALL implement all scroll-triggered entrance animations using CSS transitions and the IntersectionObserver API so that animation rendering is offloaded to the compositor thread
5. THE Site SHALL defer initialization of scroll-triggered entrance animations until after First Contentful Paint, loading animation logic only when the document has completed initial rendering
6. IF the user has enabled reduced motion at the operating system level (prefers-reduced-motion: reduce), THEN THE Site SHALL disable all entrance animations and display content in its final visible state without transition
7. THE Site SHALL remain fully navigable and readable with JavaScript disabled: all text content shall be visible, all navigation links shall be functional, and all images shall render with visible alt text

### Requirement 10: Responsive and Mobile Experience

**User Story:** As a visitor on mobile, I want the site to be beautiful and functional, so that the creative design translates well to smaller screens.

#### Acceptance Criteria

1. THE Site SHALL render without horizontal overflow or content truncation across viewport widths from 320px to 2560px
2. WHEN the viewport width is below 768px, THE Navigation SHALL collapse into a hamburger menu button, and WHEN the button is activated, THE Navigation SHALL reveal an animated overlay menu covering the full viewport below the header
3. WHILE the mobile menu overlay is visible, THE Navigation overlay SHALL apply a backdrop blur of at least 10px and a semi-transparent background to create a Glassmorphism effect
4. WHEN the viewport width is below 768px, THE Hero_Section background SHALL use a simplified gradient without particle animations
5. WHILE the viewport width is below 768px, THE Site SHALL ensure all interactive elements (buttons, links, menu items) have a minimum touch target size of 44x44px
6. WHEN the viewport width is below 768px, THE Site SHALL disable parallax scroll effects and remove transform-based entrance animations, limiting transitions to opacity and color changes only
