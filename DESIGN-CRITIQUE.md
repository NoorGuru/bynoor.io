# Homepage design critique

**Target:** `src/pages/index.astro` (+ shell: layout, header, footer, mobile menu, home styles)  
**Date:** 2026-10-03  
**Mode:** Persuade (personal brand landing)  
**Score:** 18/32 (Acceptable) — heuristics 7 and 10 scored n/a  
**Method:** Impeccable dual-agent critique (design review + detector)

Archive snapshot: `.impeccable/critique/2026-10-03T18-41-11Z__src-pages-index-astro.md`

---

## Verdict

**Enhance the incumbent system — do not redesign from scratch.**

The paper / pine / Fraunces world and the proof-ledger voice are a coherent, shippable identity. Severity is density, repetition, and hero composition — not a bankrupt visual language. Distill and sharpen; don’t replace the world.

---

## Design health score

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Scroll progress exists; lens reorder has no feedback beyond `aria-pressed` |
| 2 | Match System / Real World | 3 | Engineer language fits; “lens” unlabeled for outsiders |
| 3 | User Control and Freedom | 3 | Anchors + logo home; Cal/PDF open externally without return cue |
| 4 | Consistency and Standards | 3 | Tokens mostly consistent; CTA labels drift (Connect / talk / Book) |
| 5 | Error Prevention | 2 | Lens can bury expected sections; “coming soon” creates expectation debt |
| 6 | Recognition Rather Than Recall | 2 | Must remember lens/order; nav jargon (`case`, `proof`) opaque |
| 7 | Flexibility and Efficiency | n/a | Persuade landing — power-user efficiency not the job |
| 8 | Aesthetic and Minimalist Design | 1 | Attractive surface, maximalist content density |
| 9 | Error Recovery | 2 | Little guidance if Cal/external fails; email is thin fallback |
| 10 | Help and Documentation | n/a | Persuade landing — not a help system |
| **Total** | | **18/32** | **Acceptable** |

Cognitive load: **6/8 checklist failures → High**.

---

## Design specificity

**LLM assessment:** Partially grounded in Noor; visually portable. The story (EG Wizard, Amazon/Expedia ledger, Arabic-first teaching, Aura, Engineer/Builder/Teacher) is specific. The visual system is a familiar editorial personal-brand kit — warm paper, Fraunces, DM Sans, pine + brass, hairlines, soft cards, pill CTAs. Strip the copy and an unrelated senior engineer could wear this page. The lens switch is the one product-owned interaction; MENA/Amman, bilingual voice, and inventorship show up as copy more than form. First viewport fails the brand test if you strip the nav.

**Detector (styles-expanded scan):** 3 warnings

| Rule | File | Notes |
|------|------|-------|
| `overused-font` ×2 | `src/styles/fonts.css:23`, `:31` | Fraunces via `home.css` |
| `side-tab` ×1 | `src/styles/resources.css:213` | Prep-kit surface, not homepage core |

Markup-only homepage scan was clean. Browser overlays were unavailable in the critique session (`browser mutation unavailable`).

---

## Overall impression

Competent, hireable, and already a real identity — not a blank template. The single biggest opportunity is not a new aesthetic: it is cutting the hero and mid-page into one persuasive path so the proof ledger and Teach bilingual signal can land.

### What's working

1. **Proof ledger** — Metric-led serif figures + plain outcomes; the site’s best persuasive instrument.
2. **Lens switch (Engineer / Builder / Teacher)** — Rare, on-brand IA that admits multiple hiring audiences.
3. **Teach bilingual presence** — Arabic titles + Arabic-first framing is the clearest non-swappable identity signal.

---

## Priority issues

### 1. [P0] Hero is a credibility dashboard, not a brand composition

- **What:** Name muted/repeated, photo chip-sized, lens + identity card + dual CTAs + 5 socials all in first viewport.
- **Why it matters:** Persuade fails if the first screen doesn’t make *who* and *why book* inevitable.
- **Fix:** One hero job: brand-level name/mark, one line, one proof, one primary CTA (+ optional secondary). Move lens below fold; socials to Connect/footer.
- **Suggested command:** `$impeccable distill` (then `$impeccable layout` / `$impeccable bolder`)

### 2. [P1] Narrative repetition + length create a mid-page valley

- **What:** EG Wizard / weeks→hours / 18.6K restated across hero, case, strip, ledger, projects, teach, journey, connect. Eleven ledger rows + full journey + skills walls.
- **Why it matters:** Working memory burns; peak never compounds into close.
- **Fix:** One EG flagship telling; ledger → top 4–5; collapse skills tags; journey to 3 chapters max.
- **Suggested command:** `$impeccable distill`

### 3. [P1] Navigation offers a sitemap, not a path

- **What:** 8 lowercase anchors + prep kit + CTA.
- **Why it matters:** >4 choices at the primary decision surface; mobile and first-timers bounce.
- **Fix:** 3–4 anchors (e.g. Proof · Build · Teach · Connect) + CTA; prep kit secondary.
- **Suggested command:** `$impeccable clarify` (+ `$impeccable adapt` for mobile)

### 4. [P2] Lens is powerful but silent

- **What:** Reorders DOM, updates URL, persists — without explaining the effect.
- **Why it matters:** Looks like filter chips; users won’t use it or will feel the page “broke.”
- **Fix:** One-line helper + live-region confirm on change.
- **Suggested command:** `$impeccable onboard` / `$impeccable clarify`

### 5. [P2] Trust/end surfaces under-deliver craft

- **What:** Recommendation attribution runs together; teach facades read as black voids; “coming soon” on the flagship; soft CTA verbs.
- **Why it matters:** Peak-end and hire reassurance are where polish must be sharpest.
- **Fix:** Fix attribution; ship real teach imagery; replace or drop teaser; unify ask to “Book a conversation.”
- **Suggested command:** `$impeccable polish` (+ `$impeccable harden`)

---

## Persona red flags

**Jordan (First-Timer):** Opaque nav (`case`, `proof`); unexplained lens; EG Wizard assumed known; name not hero-scale. Path “who is this → should I book?” stalls.

**Riley (Stress Tester):** “Full agent system — coming soon” after inventorship claims; EG story repeated without deeper artifact; recommendation truncation + attribution glue look careless under scrutiny.

**Casey (Distracted Mobile):** Hero still packs lens + identity card + two CTAs + five icons; sticky header without persistent CTA; 8-item hamburger; long scroll before Connect.

---

## Minor observations

- CTA vocabulary drift across Connect / talk / Book / build together.
- Proof strip’s fourth cell (18.6K teaching) breaks the EG-case theme.
- Client project cards over-tag scope + tech.
- Footer philosophy quote is strong — could sit closer to the Connect ask.
- Prep kit matches homepage visually; its TOC is another >4-choice surface.

---

## Open questions

1. If EG Wizard can’t be shown yet, should the flagship be Aura (live) until the agent system ships?
2. Who is the primary buyer in the first 5 seconds — hiring manager, consulting client, or student?
3. Would removing the lens make the default path clearer, or is it the only irreplaceable idea?
4. What if the first viewport had no pills, no social row, and no identity card — only name, one proof, one book CTA?
5. Is `bynoor.io` the brand, or is Mohammad Noor?

---

## Suggested next commands

Work order if enhancing (not redesigning):

1. `$impeccable distill` — hero + page length (P0 / P1)
2. `$impeccable clarify` / `$impeccable adapt` — nav path + mobile menu (P1)
3. `$impeccable onboard` — lens explanation (P2)
4. `$impeccable polish` / `$impeccable harden` — trust/end craft (P2)
5. `$impeccable init` then `$impeccable document` — lock product truth + DESIGN.md when ready

---

## Decisions (locked 2026-10-03)

| Decision | Choice | Notes |
|----------|--------|-------|
| Direction | **Enhance** | Keep paper/pine/Fraunces world; distill & sharpen |
| Primary buyer (first 5s) | **Hiring manager → Client → Student** | Hero/default path = hiring manager; client & student via lens/later sections |
| Flagship while EG is closed | **Split** | EG = narrative/proof (no “coming soon” chip); Aura = live Builder artifact |
| Visual world | **Keep now, push bolder later** | This pass = layout/hierarchy/copy/density; optional character pass after distill |
| Scope | **All five, one by one** | Full priority list; execute sequentially |
| First focus | **Step 1 — Hero distill (P0)** | Then 2→3→4→5 in order below |

## Execution checklist

Remind at the start of each step what to work on. Do not skip ahead.

| Step | Status | Issue | Focus | Command |
|------|--------|-------|-------|---------|
| **1** | ✅ **Done** (2026-10-03) | [P0] Hero | Redesign-skill pass + finish pass: content-driven height (no 100dvh dead space), roles as mono eyebrow, socials moved to footer, CTA unified | `/redesign-existing-projects` |
| **2** | ◐ **Partial** (2026-10-03) | [P1] Narrative length | Proof strip re-themed to EG (SVP cell replaces 18.6K); ledger EG row trimmed to one telling. Still open: ledger 11 rows, journey 4 chapters, skills walls kept deliberately (evidence depth) | `$impeccable distill` |
| **3** | ✅ **Done** (2026-10-03) | [P1] Nav path | Curated path: Proof · Build · Teach · Skills · Connect + prep kit + “Book a conversation” CTA; desktop + mobile mirror; case/journey scroll-only | `$impeccable clarify` + `$impeccable adapt` |
| **4** | ✅ **Superseded** (2026-10-03) | [P2] Lens | Lens switch removed per PRODUCT.md (identity copy, no reordering); static “Engineer · Builder · Teacher” eyebrow replaces it; dead `lens.js`/CSS/tests deleted | `$impeccable onboard` |
| **5** | ✅ **Done** (2026-10-03) | [P2] Trust/end | Attribution stacked + deduped; quote collapse CSS implemented (was dead); toggle no-wrap + chevron rotate; all CTAs “Book a conversation”; global `:focus-visible` | `$impeccable polish` |

Later (optional): `$impeccable bolder` / `$impeccable typeset` for more personal character; `$impeccable init` + `$impeccable document` for PRODUCT.md / DESIGN.md.
