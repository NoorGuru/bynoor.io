# Requirements Document

## Introduction

A premium "LinkedIn Recommendations" section for the bynoor.io personal brand website that showcases professional endorsements from former managers at Amazon. The section serves as social proof, reinforcing credibility through real testimonials presented in a visually impressive, glassmorphism-styled card layout that matches the site's dark-mode aesthetic. The section is placed between the existing "Skills" and "Connect" sections to build trust before the CTA.

## Glossary

- **Recommendations_Section**: The HTML section element containing all recommendation cards, heading, and decorative elements
- **Recommendation_Card**: A glassmorphism-styled card displaying one LinkedIn recommendation with quote, recommender details, and link
- **Recommender_Info**: The metadata block within a card showing the recommender's name, title, relationship context, and date
- **LinkedIn_Badge**: A visual indicator (LinkedIn SVG icon) linking to the recommender's LinkedIn profile
- **Animation_Engine**: The existing JavaScript module that applies scroll-triggered entrance animations using IntersectionObserver
- **Section_Divider**: The horizontal rule element used between major page sections for visual separation

## Requirements

### Requirement 1: Section Structure and Placement

**User Story:** As a site visitor, I want to see professional recommendations in a dedicated section, so that I can assess Noor's credibility through third-party endorsements.

#### Acceptance Criteria

1. THE Recommendations_Section SHALL render as an immediate sibling after the Skills section's trailing `<hr class="section-divider">` and before the Connect section in the DOM order
2. THE Recommendations_Section SHALL include a section heading using an `<h2>` element with the CSS class pattern `recommendations__heading` and the `--gradient-text` background-clip styling consistent with other section headings (highlights__heading, skills__heading, links__heading)
3. THE Recommendations_Section SHALL be preceded and followed by an `<hr class="section-divider" aria-hidden="true">` element, matching existing divider patterns
4. THE Recommendations_Section SHALL use the `data-section-accent` attribute set to `"tertiary"` for scroll-spy integration (shifting the Connect section to a different accent)
5. WHEN the page loads, THE Recommendations_Section SHALL be present in the DOM as a `<section>` element with an `id` attribute of `"recommendations"` and an `aria-labelledby` attribute referencing its heading element

### Requirement 2: Recommendation Card Display

**User Story:** As a site visitor, I want to read each recommendation in a well-formatted card, so that I can easily digest the endorsement content.

#### Acceptance Criteria

1. THE Recommendation_Card SHALL display the full recommendation quote text in a block styled with a minimum font size of 1rem, a line-height of at least 1.6, and the site's secondary text color (--color-text-secondary)
2. THE Recommendation_Card SHALL display the Recommender_Info including the recommender's full name, professional title, and relationship context (e.g., "Former Manager at Amazon"), each as a distinct visible text element
3. THE Recommendation_Card SHALL display the date the recommendation was given in "Month YYYY" format (e.g., "December 2021")
4. THE Recommendation_Card SHALL use glassmorphism styling with backdrop-filter blur (--glass-blur), semi-transparent background (--glass-bg), and border (--glass-border) consistent with the site's glass-card pattern
5. WHEN a user hovers over a Recommendation_Card, THE Recommendation_Card SHALL apply a vertical lift transform of translateY(-4px), an enhanced box-shadow including a spread shadow of at least 8px vertical offset, and transition the background to --glass-bg-hover and border-color to --glass-border-hover
6. WHEN the viewport width is 768px or greater, THE Recommendations_Section SHALL display the two recommendation cards in a multi-column grid layout with equal-width columns
7. WHEN the viewport width is below 768px, THE Recommendations_Section SHALL stack the two recommendation cards in a single-column layout

### Requirement 3: LinkedIn Profile Integration

**User Story:** As a site visitor, I want to verify the recommender's identity, so that I can trust the authenticity of the endorsement.

#### Acceptance Criteria

1. THE Recommendation_Card SHALL include a LinkedIn_Badge rendered as a LinkedIn SVG icon wrapped in an anchor element that links to the recommender's LinkedIn profile URL
2. WHEN a visitor clicks the LinkedIn_Badge, THE anchor element SHALL open the recommender's LinkedIn profile in a new browser tab using `target="_blank"`
3. THE LinkedIn_Badge anchor element SHALL include `rel="noopener"` attribute for security
4. THE LinkedIn_Badge anchor element SHALL include an `aria-label` attribute that contains the recommender's name and identifies the link destination (e.g., "View Aamer Abbas's LinkedIn profile")

### Requirement 4: Responsive Layout

**User Story:** As a mobile visitor, I want the recommendations section to adapt to my screen size, so that I can read endorsements comfortably on any device.

#### Acceptance Criteria

1. WHILE the viewport width is below 768px, THE Recommendations_Section SHALL display recommendation cards in a single-column stacked layout with a gap of var(--space-lg) between cards
2. WHILE the viewport width is 768px or above, THE Recommendations_Section SHALL display recommendation cards side-by-side in a two-column grid layout with a gap of var(--space-lg) between cards
3. THE Recommendation_Card SHALL render body text at a minimum computed font size of 0.875rem (14px) and apply a minimum padding of var(--space-md) on all sides at all viewport widths from 320px to 1440px
4. THE Recommendations_Section SHALL use CSS custom properties from the existing design token system for spacing and sizing, specifically using tokens from the --space-* scale for all margin, padding, and gap values

### Requirement 5: Scroll-Triggered Entrance Animations

**User Story:** As a site visitor, I want the recommendations to animate in as I scroll, so that the section feels dynamic and engaging, consistent with the rest of the site.

#### Acceptance Criteria

1. WHEN the Recommendations_Section becomes at least 10% visible in the viewport, THE Animation_Engine SHALL trigger fade-up entrance animations on each Recommendation_Card with a duration of 500ms
2. THE Recommendation_Card elements SHALL include `data-animate="fade-up"` attributes for the Animation_Engine to detect
3. WHEN multiple cards are present, THE Recommendations_Section container SHALL include a `data-animate-stagger` attribute with an increment of 100ms, so that the Animation_Engine applies sequential delays of 0ms, 100ms to successive cards
4. WHEN a Recommendation_Card entrance animation has been triggered once, THE Animation_Engine SHALL unobserve that card and not re-trigger its animation on subsequent scroll events
5. WHILE the user has enabled reduced-motion preferences, THE Animation_Engine SHALL skip entrance animations and display cards with full opacity and no transform, with no transition applied

### Requirement 6: Visual Design Consistency

**User Story:** As a site visitor, I want the recommendations section to feel cohesive with the rest of the site, so that my browsing experience is seamless.

#### Acceptance Criteria

1. THE Recommendations_Section SHALL use the `var(--font-heading)` (Space Grotesk) font family for the section heading with font-weight `var(--fw-bold)` and a font-size using `clamp()` matching other section headings
2. THE Recommendations_Section SHALL use the `var(--font-primary)` (Inter) font family for recommendation body text
3. THE Recommendation_Card SHALL use a large opening quotation mark or a left-border accent (using --accent-primary or --accent-tertiary) to visually distinguish the testimonial text from the recommender metadata below it
4. THE Recommendations_Section SHALL include a `<div class="decorative-blob decorative-blob--tertiary">` element with a `data-parallax` attribute and `aria-hidden="true"` for parallax movement, consistent with other sections
5. THE Recommendation_Card SHALL apply a subtle neon glow on hover using box-shadow with a color derived from `var(--accent-tertiary)` at low opacity (e.g., `rgba(var(--accent-tertiary), 0.1)`)

### Requirement 7: Accessibility Compliance

**User Story:** As a visitor using assistive technology, I want the recommendations section to be fully accessible, so that I can consume the content with a screen reader.

#### Acceptance Criteria

1. THE Recommendations_Section SHALL include an `aria-labelledby` attribute referencing the section heading element's `id`
2. THE Recommendation_Card SHALL use semantic HTML with a `blockquote` element for the recommendation text and a `footer` element for attribution
3. THE LinkedIn_Badge SHALL include an `aria-label` attribute that contains the recommender's name and identifies the link destination (e.g., "View Aamer Abbas's LinkedIn profile")
4. THE Recommendations_Section SHALL maintain a minimum color contrast ratio of 4.5:1 for body text and a minimum of 3:1 for secondary text (attribution/cite text) against the card background
5. IF decorative elements are present, THEN THE Recommendations_Section SHALL mark them with `aria-hidden="true"`
6. THE LinkedIn_Badge SHALL be keyboard-focusable and display a visible focus indicator with a minimum 2px outline offset when focused

### Requirement 8: Performance

**User Story:** As a site visitor on a slow connection, I want the recommendations section to load without impacting page performance, so that my browsing experience remains fast.

#### Acceptance Criteria

1. THE Recommendations_Section SHALL render using only static HTML, CSS, and the JavaScript modules already loaded by `src/scripts/main.js` with no additional network requests (no fetch calls, no additional `<script>` tags, no lazy-loaded assets)
2. THE Recommendation_Card SHALL provide a CSS fallback using the `@supports not (backdrop-filter: blur(1px))` rule that applies `background: var(--color-bg-elevated)` as a solid opaque background for browsers that do not support `backdrop-filter`
3. THE Recommendations_Section SHALL not introduce any JavaScript files beyond those already imported in `src/scripts/main.js`
4. THE Recommendations_Section SHALL not cause a cumulative layout shift greater than 0 by reserving explicit dimensions for all elements within the section
5. THE Recommendations_Section SHALL add no more than 2 KB (uncompressed) of combined HTML and CSS to the page
