# Requirements Document

## Introduction

A modern, creative personal brand website for Mohammad Noor Abu Khlaif (Noor) — a software engineer, AI advocate, and tech educator. The site replaces an existing Hugo-based blog with a bold, animated, mobile-first single-page application (with one additional resources page). It focuses on personal brand identity rather than blog content or employer-specific achievements, showcasing impact, skills, social links, and a way to connect. The site will be deployed to GitHub Pages at bynoor.io. Light mode only, no theme toggles.

## Glossary

- **Website**: The personal brand web application at bynoor.io
- **Hero_Section**: The primary above-the-fold section featuring the profile picture, name, tagline, subtitle, and call-to-action links
- **Highlights_Section**: The section showcasing key professional achievements and recognition
- **Skills_Section**: The section displaying technical skills and expertise areas
- **Links_Section**: The section containing social media links, contact options, and the "Let's Connect" booking button
- **Projects_Section**: The section featuring personal projects and apps
- **Resources_Page**: A secondary page hosting the archived Technical Interview Preparation Kit content
- **Navigation**: The site navigation component allowing access to page sections and the Resources page
- **Animation_System**: The collection of CSS/JS animations used for visual effects throughout the site
- **Footer**: The bottom section of the page containing copyright and minimal branding
- **Visitor**: Any person viewing the website on a mobile device or desktop browser

## Requirements

### Requirement 1: Hero Section Display

**User Story:** As a visitor, I want to see Noor's profile picture, name, and tagline immediately upon landing, so that I know whose site I'm on and what they do.

#### Acceptance Criteria

1. WHEN the Website loads, THE Hero_Section SHALL display the profile picture (profile-pic.png) as a circular or rounded image with a minimum rendered size of 150px on mobile and 200px on desktop
2. WHEN the Website loads, THE Hero_Section SHALL display the full name "Mohammad Noor Abu Khlaif" as the largest heading on the page using an h1 element
3. WHEN the Website loads, THE Hero_Section SHALL display the primary tagline "I build tools that help engineers move faster" directly below the name in a prominent font size
4. WHEN the Website loads, THE Hero_Section SHALL display the subtitle "Software Engineer · AI Advocate · Tech Educator" below the primary tagline in a smaller, secondary font size
5. WHEN the Website loads, THE Hero_Section SHALL display call-to-action links including a prominent "Let's Connect" button linking to https://cal.com/mohammad-noor, plus icon links to LinkedIn, GitHub, YouTube, and Email, each visually distinguishable as clickable elements
6. THE Hero_Section SHALL use a bold, vibrant color palette with a background lightness value above 50% (non-dark) and occupy the full viewport height on initial load
7. THE Hero_Section SHALL be fully visible without scrolling on the initial page load (above the fold)

#### Correctness Properties

- The profile picture, name, tagline, and subtitle must be rendered and visible within the viewport on page load without requiring user interaction
- All call-to-action links must navigate to valid external URLs when clicked
- The "Let's Connect" button must link to https://cal.com/mohammad-noor

### Requirement 2: Responsive Mobile-First Layout

**User Story:** As a visitor, I want the website to look great on my phone and desktop, so that I can browse comfortably on any device.

#### Acceptance Criteria

1. THE Website SHALL render without content overflow, element overlap, or text truncation on viewport widths from 320px to 2560px
2. THE Website SHALL use a mobile-first CSS approach where base styles target mobile and media queries enhance for larger screens
3. WHEN the viewport width is less than 768px, THE Navigation SHALL collapse into a toggleable hamburger menu that expands to show navigation links when activated
4. WHILE the viewport width is less than 768px, THE Website SHALL maintain a minimum body font size of 16px and minimum tap target size of 44x44px for all interactive elements
5. WHEN the viewport width changes, THE Website SHALL reflow content without horizontal scrolling
6. WHILE the viewport width is greater than 1200px, THE Website SHALL constrain main content to a maximum width of 1200px centered horizontally to maintain readable line lengths

#### Correctness Properties

- No horizontal scrollbar shall appear at any viewport width between 320px and 2560px
- All interactive elements must meet the 44x44px minimum tap target on mobile viewports

### Requirement 3: Animations and Visual Effects

**User Story:** As a visitor, I want to see smooth, modern animations as I interact with the site, so that the experience feels polished and memorable.

#### Acceptance Criteria

1. WHEN at least 20% of a section scrolls into the viewport, THE Animation_System SHALL trigger a fade-in or slide-in entrance animation lasting between 300ms and 600ms
2. WHEN a visitor hovers over buttons, links, or cards, THE Animation_System SHALL apply a transition effect (such as scale, shadow, or color shift) that completes within 200ms
3. THE Animation_System SHALL maintain a frame rate of 60fps during animations on devices with hardware equivalent to or better than a 2020 mid-range smartphone (4GB RAM, quad-core processor)
4. WHILE the visitor has enabled "prefers-reduced-motion" in their OS settings, THE Animation_System SHALL disable all entrance animations and hover transform effects, retaining only simple color transitions and opacity changes
5. THE Animation_System SHALL use CSS transforms and opacity for animations to leverage GPU acceleration

#### Correctness Properties

- When prefers-reduced-motion is active, no element shall undergo transform-based animations
- All animations must use only transform and opacity properties (no layout-triggering properties like width, height, top, left)

### Requirement 4: Professional Highlights Display

**User Story:** As a visitor, I want to see Noor's key achievements at a glance, so that I understand his professional impact.

#### Acceptance Criteria

1. THE Highlights_Section SHALL display the following achievements as individual cards: (a) AI Platform Builder — "Built an AI-powered migration platform that turned weeks of work into hours", (b) AI Pioneer & Champion — "Recognized for pioneering AI adoption and training hundreds of engineers", (c) Teaching Since 2012 — "YouTube educator with 18.6K subscribers and 750K+ views", (d) 9+ Years in Production — "Designed and maintained systems handling millions of daily requests", (e) Engineering Leader — "Mentored and developed engineers across distributed global teams"
2. WHEN a highlight card scrolls into view, THE Animation_System SHALL animate the card entrance with a staggered delay of 100ms to 200ms relative to the previous sibling card
3. THE Highlights_Section SHALL present each achievement as a visually distinct card containing an icon or emoji, a bold title, and a one-line description

#### Correctness Properties

- All 5 highlight cards must be rendered in the DOM and visible when the section is scrolled into view
- Staggered animation delay between consecutive cards must be consistent and non-zero

### Requirement 5: Skills and Expertise Display

**User Story:** As a visitor, I want to see what technologies Noor works with, so that I can understand his technical breadth.

#### Acceptance Criteria

1. THE Skills_Section SHALL display skills grouped into four categories with visible headings: "Languages" (Kotlin, Java, Python, TypeScript, JavaScript, Scala), "Technologies" (Spring Boot, GraphQL, gRPC, AWS, React, NodeJS, OpenAPI), "Areas of Expertise" (SDKs, Platform Engineering, AI-native Architectures, MCP, Agent Frameworks, Microservices, Backend, Full-Stack), and "Leadership" (Engineering Leadership, Mentoring, Hiring, Coaching, Training, AI Advocacy)
2. WHEN a skill tag is rendered, THE Skills_Section SHALL apply a color-coded badge style where each category uses a distinct hue distinguishable from other categories
3. THE Skills_Section SHALL render each skill as a rounded pill or badge with padding and spacing to prevent overlap or truncation on all supported viewport widths

#### Correctness Properties

- All skills listed in the acceptance criteria must be present in the rendered DOM
- Each category must use a visually distinct color that differs from other categories by at least 30° in hue

### Requirement 6: Social Links and Contact

**User Story:** As a visitor, I want to find all of Noor's social profiles and contact options in one place, so that I can connect with him on my preferred platform.

#### Acceptance Criteria

1. THE Links_Section SHALL display a prominent "Let's Connect" button linking to https://cal.com/mohammad-noor, visually distinguished from other links as the primary call-to-action in this section
2. THE Links_Section SHALL display links to: LinkedIn (https://go.bynoor.io/linkedin), GitHub (https://go.bynoor.io/github), YouTube (https://go.bynoor.io/youtube) labeled "Code with Noor", Twitter/X (https://go.bynoor.io/twitter), StackOverflow (https://go.bynoor.io/sof), HackerRank (https://go.bynoor.io/hr), and Email (https://go.bynoor.io/email)
3. THE Links_Section SHALL display a platform-specific SVG icon for each social link that visually represents the corresponding brand
4. WHEN a visitor clicks a social link or the "Let's Connect" button, THE Website SHALL open the link in a new browser tab with rel="noopener" to prevent reverse tabnapping
5. THE Links_Section SHALL provide an accessible name for each social link so that screen readers announce the platform name

#### Correctness Properties

- All 7 social links plus the "Let's Connect" button must be present in the rendered DOM with correct href values
- All links must have target="_blank" and rel="noopener" attributes
- The YouTube link must display "Code with Noor" as its label

### Requirement 7: Projects and Apps Showcase

**User Story:** As a visitor, I want to see sites Noor has built, so that I can explore his craft and side work.

#### Acceptance Criteria

1. THE Projects_Section SHALL display project cards for: areej.io (https://areej.io/) and HireFound (https://mohnoor94.github.io/hire-found/)
2. THE Projects_Section SHALL render each project as a card containing: a project name as a heading, a one-sentence description (maximum 120 characters) explaining the project, and a visual element (icon, screenshot thumbnail, or colored accent)
3. WHEN a visitor clicks a project card or its link, THE Website SHALL open the project URL in a new browser tab with rel="noopener"

#### Correctness Properties

- All 2 project cards must be rendered with valid external URLs
- Each project card must contain a heading element and descriptive text

### Requirement 8: Technical Interview Preparation Kit (Resources Page)

**User Story:** As a visitor, I want to access the Technical Interview Preparation Kit, so that I can use it as a reference for interview prep.

#### Acceptance Criteria

1. THE Navigation SHALL include a visible link labeled "Resources" that navigates to the Resources_Page at the "/technical-interview-preparation-kit" route
2. WHEN a visitor navigates to the Resources_Page, THE Website SHALL display the full Technical Interview Preparation Kit content using the same layout and visual styling as the main site
3. THE Resources_Page SHALL preserve all existing sections: Introduction, Long-Term Preparation Kit, Learn by Practice, Short-Term Preparation Kit, and all subsections (data structures, algorithms, trees, graphs, SOLID principles, bit manipulation, linked lists vs arrays, sort algorithms, search algorithms)
4. THE Resources_Page SHALL render HTML tables with visible borders and aligned columns, code snippets with syntax highlighting, and nested lists with correct indentation levels
5. THE Resources_Page SHALL include a "last updated" indicator displaying the text "Updated on Sep 7th, 2023"
6. THE Resources_Page SHALL display a table of contents listing all top-level and second-level section headings as navigable anchor links

#### Correctness Properties

- The Resources page must be accessible via the /technical-interview-preparation-kit route
- All tables, code blocks, and nested lists from the original content must render without layout breakage

### Requirement 9: Navigation

**User Story:** As a visitor, I want to easily navigate between sections and pages, so that I can find the content I'm looking for.

#### Acceptance Criteria

1. THE Navigation SHALL provide links to all main sections of the landing page (Highlights, Skills, Links, Projects) and a "Home" or logo link that scrolls to the top (Hero_Section)
2. THE Navigation SHALL provide a link to the Resources_Page
3. WHEN a visitor clicks a section link on the landing page, THE Navigation SHALL smooth-scroll to that section with a scroll offset that accounts for the sticky header height so the section heading is not obscured
4. WHILE the visitor scrolls the landing page, THE Navigation SHALL remain visible at the top of the viewport using sticky or fixed positioning
5. THE Navigation SHALL visually indicate the currently active section by applying a distinct style (color, underline, or weight change) to the corresponding navigation link based on the scroll position
6. WHEN a visitor navigates from the Resources_Page back to the landing page, THE Navigation SHALL restore the landing page at the top or at the previously visited section

#### Correctness Properties

- Clicking any section navigation link must scroll the page such that the target section's heading is visible and not hidden behind the sticky header
- The active section indicator must update as the user scrolls through different sections

### Requirement 10: Performance and Loading

**User Story:** As a visitor, I want the site to load fast, so that I don't abandon it before seeing the content.

#### Acceptance Criteria

1. THE Website SHALL achieve a Lighthouse Performance score of 90 or above on mobile using Lighthouse default simulated throttling
2. THE Website SHALL achieve a Largest Contentful Paint (LCP) of 2 seconds or less under Lighthouse simulated mobile throttling conditions
3. THE Website SHALL apply lazy-loading (native loading="lazy" or equivalent) to all images and iframes positioned below the initial viewport
4. THE Website SHALL use optimized image formats (WebP with PNG or JPEG fallback) for the profile picture and any media assets, with individual image files not exceeding 200KB
5. THE Website SHALL achieve a Cumulative Layout Shift (CLS) score of 0.1 or less
6. THE Website SHALL maintain a total page weight (all transferred resources) of no more than 1.5MB for the initial landing page load

#### Correctness Properties

- Lighthouse mobile performance score must be >= 90
- No individual image asset shall exceed 200KB in file size
- Total page weight must not exceed 1.5MB

### Requirement 11: Deployment and Hosting

**User Story:** As the site owner, I want the site to deploy automatically to GitHub Pages with my custom domain, so that updates go live without manual intervention.

#### Acceptance Criteria

1. THE Website SHALL include a GitHub Actions workflow file that builds the site and deploys the output to GitHub Pages
2. THE Website SHALL include a CNAME file containing "bynoor.io" in the static build output to maintain custom domain configuration
3. WHEN a commit is pushed to the main branch, THE Website SHALL trigger the GitHub Actions workflow which completes the build and deploy within 5 minutes
4. THE Website SHALL produce a static build output consisting of only client-side assets (HTML, CSS, JavaScript, images) with an index.html at the root, requiring no server-side processing
5. IF the build step fails in the GitHub Actions workflow, THEN THE Website SHALL retain the previously deployed version without changes to the live site

#### Correctness Properties

- The build output must contain an index.html at the root and a CNAME file with "bynoor.io"
- The GitHub Actions workflow must trigger on pushes to main branch only

### Requirement 12: SEO and Metadata

**User Story:** As the site owner, I want proper meta tags and SEO structure, so that the site is discoverable and looks good when shared on social media.

#### Acceptance Criteria

1. THE Website SHALL include Open Graph meta tags (og:title, og:description, og:image, og:url) on all pages, where og:title matches the page title, og:description is between 50 and 160 characters, og:url is the canonical page URL, and og:image references an accessible image of at least 1200×630 pixels
2. THE Website SHALL include a title tag of no more than 60 characters and a meta description of between 50 and 160 characters on each page, both reflecting the specific page content rather than using a generic site-wide value
3. THE Website SHALL include Twitter Card meta tags (twitter:card, twitter:title, twitter:description, twitter:image) on all pages with the card type set to "summary_large_image"
4. THE Website SHALL include structured data (JSON-LD) with Person schema on the homepage containing at minimum: name, url, jobTitle, and sameAs linking to the associated social profiles (LinkedIn, GitHub, YouTube, Twitter)
5. IF a page does not define a custom image, THEN THE Website SHALL use a site-level default Open Graph image so that social media previews always display an image

#### Correctness Properties

- Every page must contain og:title, og:description, og:image, and og:url meta tags
- The JSON-LD Person schema must be valid and contain all required fields

### Requirement 13: Accessibility

**User Story:** As a visitor using assistive technology, I want the site to be accessible, so that I can navigate and understand the content.

#### Acceptance Criteria

1. THE Website SHALL achieve a minimum WCAG 2.1 AA contrast ratio of 4.5:1 for normal text (below 18pt regular or 14pt bold) and 3:1 for large text (18pt regular or 14pt bold and above) against its background
2. THE Website SHALL provide descriptive alt text (maximum 150 characters) for all informative images including the profile picture, and an empty alt attribute for decorative images
3. THE Website SHALL allow all interactive elements to be reachable and operable using keyboard alone (Tab, Shift+Tab, Enter, Escape), with a visible focus indicator on the currently focused element and a tab order that follows the logical reading order of the page
4. THE Website SHALL use semantic HTML elements (header, nav, main, section, footer) for page structure
5. THE Website SHALL include ARIA labels on interactive elements that lack visible text labels
6. THE Website SHALL provide a skip-navigation link as the first focusable element, allowing keyboard users to bypass the Navigation and move focus directly to the main content area

#### Correctness Properties

- All text elements must meet WCAG 2.1 AA contrast ratios against their backgrounds
- A skip-navigation link must be the first focusable element in the tab order
- All interactive elements must have a visible focus indicator when focused via keyboard

### Requirement 14: Footer

**User Story:** As a visitor, I want to see a simple footer at the bottom of the page, so that the site feels complete and polished.

#### Acceptance Criteria

1. THE Website SHALL display a footer at the bottom of the page containing the text "© {current year} Noor" with a white heart emoji (🤍)
2. THE Footer SHALL use a minimal, understated design that does not distract from the main content
3. THE Footer SHALL be present on both the landing page and the Resources_Page

#### Correctness Properties

- The footer must be rendered as the last visible element on every page
- The copyright year must reflect the current calendar year

### Requirement 15: Light Mode Only

**User Story:** As the site owner, I want a consistent visual identity without theme variations, so that the brand colors and design are always presented as intended.

#### Acceptance Criteria

1. THE Website SHALL use a single light color scheme with no dark mode toggle or theme switcher
2. THE Website SHALL not respond to the "prefers-color-scheme: dark" media query for layout or color changes (animations may still respect prefers-reduced-motion per Requirement 3)
3. THE Website SHALL maintain its intended vibrant color palette regardless of the visitor's OS-level dark mode setting

#### Correctness Properties

- No CSS rules shall alter the site's color scheme based on prefers-color-scheme media query
- The site must present identically in terms of colors whether the visitor's OS is in light or dark mode
