# Bugfix Requirements Document

## Introduction

The technical-interview-preparation-kit page has broken styling that renders content unreadable. The `resources.css` stylesheet uses undefined CSS variables (`--color-border`, `--color-primary`, `--color-primary-hover`) and hardcoded light-theme background colors (`#f8fafc`, `#f1f5f9`, `#e2e8f0`) that clash with the site's dark-mode-first design system. This causes tables, blockquotes, code blocks, and highlighted sections to appear as white/light boxes on the dark background, making dark text invisible.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the page renders elements styled with `--color-border` (h2 borders, table borders, TOC border, hr) THEN the system falls back to browser defaults because the variable is undefined, resulting in missing or invisible borders

1.2 WHEN the page renders elements styled with `--color-primary` and `--color-primary-hover` (links, TOC links, blockquote left border) THEN the system falls back to browser default blue, which is inconsistent with the site's neon accent design system

1.3 WHEN the page renders blockquotes THEN the system displays them with a hardcoded `#f8fafc` (nearly white) background, making the italic text invisible against the dark page background

1.4 WHEN the page renders inline code elements THEN the system displays them with a hardcoded `#f1f5f9` (light gray) background, creating illegible light-on-light contrast

1.5 WHEN the page renders code blocks (pre elements) THEN the system displays them with a hardcoded `#f1f5f9` (light gray) background, making code content unreadable

1.6 WHEN the page renders table headers (thead) THEN the system displays them with a hardcoded `#f1f5f9` (light gray) background, making header text invisible

1.7 WHEN the page renders alternating table rows THEN the system displays even rows with a hardcoded `#f8fafc` (nearly white) background, making cell text unreadable

1.8 WHEN the page renders table row hover states THEN the system displays them with a hardcoded `#f1f5f9` (light gray) background, breaking visual continuity

1.9 WHEN the page renders table group header rows THEN the system displays them with a hardcoded `#e2e8f0` (light slate) background, making the group labels unreadable

### Expected Behavior (Correct)

2.1 WHEN the page renders elements using border colors THEN the system SHALL use a defined dark-theme-compatible border color (e.g., glassmorphism border token `rgba(255, 255, 255, 0.10)` or a new `--color-border` variable) that is visible against dark backgrounds

2.2 WHEN the page renders links and accent-colored elements THEN the system SHALL use the existing neon accent tokens (`--accent-primary`, `--accent-secondary`) for link colors and interactive states, consistent with the site's design system

2.3 WHEN the page renders blockquotes THEN the system SHALL display them with a dark-theme-compatible background (using glassmorphism or semi-transparent dark surfaces) with visible text and a neon accent left border

2.4 WHEN the page renders inline code elements THEN the system SHALL display them with a dark semi-transparent background that provides sufficient contrast for code text on dark pages

2.5 WHEN the page renders code blocks (pre elements) THEN the system SHALL display them with a dark elevated background consistent with the design system tokens, ensuring code is readable

2.6 WHEN the page renders table headers (thead) THEN the system SHALL display them with a dark elevated or glassmorphism background that makes header text clearly legible

2.7 WHEN the page renders alternating table rows THEN the system SHALL use subtle dark-theme-compatible alternating backgrounds (e.g., slight transparency variations) for visual separation without breaking readability

2.8 WHEN the page renders table row hover states THEN the system SHALL use a dark-theme-compatible hover effect (e.g., glassmorphism hover token) that provides visual feedback without obscuring text

2.9 WHEN the page renders table group header rows THEN the system SHALL display them with a distinguishable dark background using accent tints or elevated surfaces, keeping group labels readable

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the page is viewed on mobile devices (max-width: 768px) THEN the system SHALL CONTINUE TO apply responsive padding and font-size adjustments as currently defined

3.2 WHEN the user navigates to heading anchors THEN the system SHALL CONTINUE TO apply the scroll-margin-top offset accounting for the fixed header height

3.3 WHEN the page renders general text content (paragraphs, lists, headings) THEN the system SHALL CONTINUE TO use the existing `--color-text` and `--color-text-secondary` tokens for readable light text on dark backgrounds

3.4 WHEN the page renders the table of contents navigation THEN the system SHALL CONTINUE TO display it as a bordered, rounded container with proper list formatting and link styling

3.5 WHEN tables overflow on narrow viewports THEN the system SHALL CONTINUE TO provide horizontal scrolling via the `.resources__table-wrapper` overflow mechanism

3.6 WHEN the page layout renders THEN the system SHALL CONTINUE TO respect `--max-width`, `--header-height`, and spacing tokens for consistent layout with the rest of the site
