# Interview Kit Page Fix — Bugfix Design

## Overview

The technical-interview-preparation-kit page is unreadable because `resources.css` references three undefined CSS variables (`--color-border`, `--color-primary`, `--color-primary-hover`) and uses six hardcoded light-theme hex colors (`#f8fafc`, `#f1f5f9`, `#e2e8f0`) that produce white/light boxes on the site's dark background. The fix defines the missing variables in `tokens.css` using existing design system conventions and replaces all hardcoded colors in `resources.css` with dark-theme-compatible values leveraging the glassmorphism tokens and elevated surface patterns already established across the site.

## Glossary

- **Bug_Condition (C)**: Any CSS rule in `resources.css` that references an undefined variable or uses a hardcoded light-theme color, causing invisible or illegible content on dark backgrounds
- **Property (P)**: All styled elements on the interview kit page render with dark-theme-compatible backgrounds and visible text, consistent with the site's neon-accent glassmorphism design system
- **Preservation**: Responsive layout behavior, scroll-margin-top offsets, text color tokens, TOC structure, table overflow scrolling, and spacing tokens must remain unchanged
- **`resources.css`**: The stylesheet in `/src/styles/resources.css` that styles the `.resources` page layout (interview kit)
- **`tokens.css`**: The design token file in `/src/styles/tokens.css` that defines all CSS custom properties for the site
- **Glassmorphism tokens**: `--glass-bg`, `--glass-bg-hover`, `--glass-border`, `--glass-border-hover`, `--glass-blur` — semi-transparent white overlays with backdrop blur

## Bug Details

### Bug Condition

The bug manifests when the browser renders any element on the interview kit page that either (a) references one of the three undefined CSS variables, causing fallback to browser defaults, or (b) uses a hardcoded light hex color, producing a light surface against the dark page background that makes text invisible.

**Formal Specification:**
```
FUNCTION isBugCondition(cssRule)
  INPUT: cssRule of type CSSDeclaration applied within .resources
  OUTPUT: boolean

  undefinedVarUsed := cssRule.value REFERENCES ANY OF
    ['--color-border', '--color-primary', '--color-primary-hover']
    AND variable NOT DEFINED in :root

  hardcodedLightColor := cssRule.value IN
    ['#f8fafc', '#f1f5f9', '#e2e8f0']

  RETURN undefinedVarUsed OR hardcodedLightColor
END FUNCTION
```

### Examples

- **H2 border**: `border-bottom: 2px solid var(--color-border)` → variable undefined → border invisible (browser default `transparent` or initial)
- **TOC links**: `color: var(--color-primary)` → variable undefined → falls back to browser default blue, inconsistent with neon accents
- **Blockquote background**: `background-color: #f8fafc` → nearly white box on `hsl(240, 15%, 6%)` dark background → italic text invisible
- **Code blocks**: `background-color: #f1f5f9` → light gray box → code text unreadable
- **Table headers**: `background-color: #f1f5f9` → header row appears as white strip, text invisible
- **Even table rows**: `background-color: #f8fafc` → alternating white rows make cell text unreadable
- **Table group headers**: `background-color: #e2e8f0` → slate-colored row on dark page → group labels unreadable

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Responsive padding and font-size adjustments at `max-width: 768px` must continue to apply as defined
- `scroll-margin-top: calc(var(--header-height) + 1rem)` on headings must remain for anchor navigation
- General text uses `--color-text` and `--color-text-secondary` — no changes to paragraph/list/heading text colors
- TOC rendered as bordered rounded container with ordered list structure and link styling
- `.resources__table-wrapper` provides horizontal overflow scrolling for narrow viewports
- Layout respects `--max-width`, `--header-height`, and spacing tokens (`--space-xs` through `--space-2xl`)

**Scope:**
All inputs that do NOT involve the undefined variables or hardcoded light colors should be completely unaffected by this fix. This includes:
- Font family, weight, and size declarations
- Margin and padding values using spacing tokens
- Line-height and text-underline-offset
- Media query breakpoints and their adjustments
- List style and nesting behavior

## Hypothesized Root Cause

Based on the bug analysis, the root cause is straightforward:

1. **Missing Variable Definitions**: `--color-border`, `--color-primary`, and `--color-primary-hover` are used in `resources.css` but never defined in `tokens.css` or any other stylesheet. The original author likely intended to add them but did not, or they were removed during a design system refactor to the dark-mode-first approach.

2. **Light-Theme Color Remnants**: The hardcoded hex values (`#f8fafc`, `#f1f5f9`, `#e2e8f0`) are Tailwind CSS slate palette colors (slate-50, slate-100, slate-200). They were likely carried over from a light-theme template or written before the site adopted its dark-mode-first design system. No other stylesheet in the project uses these colors.

3. **No Visual QA on Dark Background**: The page was styled in isolation without testing against the actual dark background (`hsl(240, 15%, 6%)`), so the contrast failure was not caught.

## Correctness Properties

Property 1: Bug Condition — Dark-Theme Rendering of Styled Elements

_For any_ CSS rule within `.resources` that previously referenced an undefined variable or used a hardcoded light hex color, the fixed stylesheet SHALL render the element with a dark-theme-compatible value (using defined tokens or dark semi-transparent backgrounds) such that text content maintains a minimum contrast ratio of 4.5:1 against its background and visual elements (borders, accents) are visible.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9**

Property 2: Preservation — Layout and Structure Unchanged

_For any_ CSS rule within `.resources` that does NOT involve border color variables, link/accent colors, or background colors of content blocks (blockquotes, code, tables), the fixed stylesheet SHALL produce identical computed styles as the original stylesheet, preserving layout, spacing, typography, responsive behavior, and scroll offsets.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

**File**: `/Users/mabukhlaif/bynoor.io/src/styles/tokens.css`

**Changes**: Add three new variables to the `:root` block, positioned after the Text section:

1. **Define `--color-border`**: Use a subtle white transparency consistent with the glassmorphism border token pattern.
   - Value: `rgba(255, 255, 255, 0.12)` — slightly more opaque than `--glass-border` (0.10) for standalone borders

2. **Define `--color-primary`**: Map to the existing violet accent for link styling.
   - Value: `var(--accent-primary)` — reuses `hsl(265, 90%, 65%)`

3. **Define `--color-primary-hover`**: A brighter/lighter variant for hover states.
   - Value: `hsl(265, 90%, 75%)` — 10% lighter than `--accent-primary` for hover feedback

---

**File**: `/Users/mabukhlaif/bynoor.io/src/styles/resources.css`

**Function**: Replace all six hardcoded hex colors with dark-theme-compatible values

**Specific Changes**:

1. **Blockquote background** (`#f8fafc` → dark glassmorphism):
   - Replace with `var(--glass-bg)` (`rgba(255, 255, 255, 0.05)`)
   - Add `border-radius: 6px` for polish consistent with glassmorphism cards

2. **Inline code background** (`#f1f5f9` → elevated surface):
   - Replace with `rgba(255, 255, 255, 0.08)` — slightly more visible than glass-bg for inline distinction

3. **Code block (pre) background** (`#f1f5f9` → dark elevated):
   - Replace with `var(--color-bg-elevated)` (`hsl(240, 10%, 12%)`)
   - Add `border: 1px solid var(--color-border)` for definition against the section background

4. **Table thead background** (`#f1f5f9` → elevated with glass):
   - Replace with `var(--color-bg-elevated)`

5. **Table even row background** (`#f8fafc` → subtle stripe):
   - Replace with `rgba(255, 255, 255, 0.02)` — barely-visible stripe for alternation on dark

6. **Table row hover background** (`#f1f5f9` → glass hover):
   - Replace with `var(--glass-bg-hover)` (`rgba(255, 255, 255, 0.10)`)

7. **Table group header background** (`#e2e8f0` → accent-tinted dark):
   - Replace with `rgba(255, 255, 255, 0.06)` — distinguishable but not overpowering

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that undefined variables and hardcoded colors cause readability failures.

**Test Plan**: Use computed style inspection (via Playwright or JSDOM) to verify that elements styled by the buggy rules produce insufficient contrast ratios or fallback to browser defaults. Run these checks on the UNFIXED code.

**Test Cases**:
1. **Undefined Variable Test**: Check computed `border-bottom-color` on `h2` elements — will be `transparent` or default on unfixed code
2. **Link Color Test**: Check computed `color` on `.toc a` — will be browser default blue, not matching accent palette
3. **Blockquote Background Test**: Check computed `background-color` on `blockquote` — will be `#f8fafc` (nearly white) against dark page
4. **Code Block Contrast Test**: Check that `pre` background luminance is too high relative to dark text/page

**Expected Counterexamples**:
- Computed border colors resolve to `transparent` or initial values
- Link colors don't match any defined accent token
- Background luminance values exceed 0.9 (on 0-1 scale) for elements that should be dark

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed stylesheet produces visible, readable content.

**Pseudocode:**
```
FOR ALL element WHERE isBugCondition(getAppliedCSS(element)) DO
  computedBg := getComputedStyle(element).backgroundColor
  computedText := getComputedStyle(element).color
  contrastRatio := calculateContrastRatio(computedBg, computedText)
  ASSERT contrastRatio >= 4.5
  ASSERT backgroundLuminance(computedBg) < 0.3  // dark background
END FOR
```

### Preservation Checking

**Goal**: Verify that for all elements where the bug condition does NOT hold, the fixed stylesheet produces the same computed styles as the original.

**Pseudocode:**
```
FOR ALL element WHERE NOT isBugCondition(getAppliedCSS(element)) DO
  ASSERT getComputedStyle_fixed(element).padding = getComputedStyle_original(element).padding
  ASSERT getComputedStyle_fixed(element).margin = getComputedStyle_original(element).margin
  ASSERT getComputedStyle_fixed(element).fontSize = getComputedStyle_original(element).fontSize
  ASSERT getComputedStyle_fixed(element).fontFamily = getComputedStyle_original(element).fontFamily
  ASSERT getComputedStyle_fixed(element).maxWidth = getComputedStyle_original(element).maxWidth
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It can generate many viewport widths and element combinations to verify responsive behavior is unchanged
- It catches edge cases like interaction between spacing tokens and header-height offset
- It provides strong guarantees that layout properties remain identical for all unaffected elements

**Test Plan**: Snapshot key computed styles on UNFIXED code for non-buggy properties (padding, margins, fonts, max-width), then verify these exact values persist after the fix.

**Test Cases**:
1. **Layout Preservation**: Verify `max-width`, padding, and margins on `.resources` container are unchanged
2. **Responsive Preservation**: Verify font-size reductions at 768px breakpoint continue to apply
3. **Scroll Offset Preservation**: Verify `scroll-margin-top` on h2/h3/h4 remains `calc(var(--header-height) + 1rem)`
4. **Typography Preservation**: Verify font-family, font-weight, line-height on paragraphs and headings are unchanged

### Unit Tests

- Verify `--color-border`, `--color-primary`, `--color-primary-hover` are defined in computed `:root` styles
- Verify blockquote background is dark (luminance < 0.15)
- Verify code block background matches `--color-bg-elevated` computed value
- Verify table header background is dark
- Verify link color matches `--accent-primary` computed value
- Verify link hover color changes from base state

### Property-Based Tests

- Generate random viewport widths (320px–1920px) and verify all `.resources` text elements maintain contrast ratio ≥ 4.5:1
- Generate random table sizes (1–20 rows) and verify alternating row backgrounds are distinguishable but dark
- Generate random combinations of page elements and verify no computed background exceeds luminance threshold of 0.3

### Integration Tests

- Full page render test: load interview kit page and screenshot-compare against expected dark appearance
- Navigation test: click TOC links and verify scroll behavior lands correctly with proper offset
- Responsive test: resize viewport to mobile breakpoint and verify layout adjustments apply without light-color artifacts
