import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'tests/unit/**/*.{test,spec}.{js,mjs}',
      'tests/property/**/*.{test,spec}.{js,mjs}',
      'tests/integration/**/*.{test,spec}.{js,mjs}',
    ],
    environment: 'jsdom',
  },
});
