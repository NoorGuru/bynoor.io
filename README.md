# bynoor.io

Personal site source for https://www.bynoor.io/ — light editorial site (Fraunces + DM Sans, paper/pine/ink). Homepage plus Technical Interview Preparation Kit, sharing one stylesheet system (`home.css` + kit companion `resources.css`).

## Stack

Astro 7 (static output) with vanilla CSS/JS — no UI framework. Shared `BaseLayout` + components in `src/`; kit body lives in the `guide` Markdown content collection (`src/content/guide/`).

## Commands

- `npm run dev` — local dev server
- `npm run build` — static build to `dist/` (run before tests)
- `npm test` — Vitest unit/integration suite (asserts against `dist/`)
- `npm run test:e2e` — Playwright browser suite (starts `astro preview` itself)
