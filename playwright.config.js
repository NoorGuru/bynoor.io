import { defineConfig } from '@playwright/test';
import fs from 'node:fs';

const localChromium = '/home/noor/.local/bin/chromium';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (fs.existsSync(localChromium) ? localChromium : undefined);

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    launchOptions: executablePath ? { executablePath, args: ['--no-sandbox', '--disable-setuid-sandbox'] } : undefined,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});

