import { defineConfig } from 'astro/config';

// Static site (default): prerendered HTML to dist/, served as-is.
// The shared editorial styles live in src/styles (home.css + resources.css);
// vanilla client modules live in src/scripts and are bundled from BaseLayout.
export default defineConfig({
  site: 'https://bynoor.io',
  outDir: 'dist',
  // Keep Markdown punctuation byte-identical to the hand-written HTML
  // (no smart quotes/dashes substitution).
  markdown: {
    smartypants: false,
  },
});
