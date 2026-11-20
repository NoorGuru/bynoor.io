import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Long-form reference guides (Markdown). Rendered by their fixed routes;
// heading ids are auto-generated and must keep matching the hand-written TOC.
const guide = defineCollection({
  loader: glob({ base: './src/content/guide', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: z.string(),
  }),
});

// Ready-to-copy chat prompts. One markdown file becomes one block on /prompts/.
const prompt = defineCollection({
  loader: glob({ base: './src/content/prompts', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    group: z.enum(['Learn', 'Make']),
    minutes: z.number(),
    order: z.number(),
  }),
});

export const collections = { guide, prompt };
