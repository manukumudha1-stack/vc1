import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
config({ path: '.env.local' });

export default defineConfig({
  globalSetup: './tests/global-setup.ts',
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 1,
  timeout: 30000,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
