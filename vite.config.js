import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        resources: resolve(__dirname, 'technical-interview-preparation-kit/index.html'),
      },
    },
  },
  test: {
    include: [
      'tests/unit/**/*.{test,spec}.{js,mjs}',
      'tests/property/**/*.{test,spec}.{js,mjs}',
      'tests/integration/**/*.{test,spec}.{js,mjs}',
    ],
    environment: 'jsdom',
  },
});
