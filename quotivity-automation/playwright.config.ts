import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.PORTAL_DOMAIN ?? 'https://app.quote.hapily.com';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    testIdAttribute: 'data-testid'
  },

  // We’ll use separate "setup" projects to create storageState for each provider.
  projects: [
    // 1) Setup projects (run these only when generating auth state)
    {
      name: 'setup-google',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' } // chrome channel helps with Google challenges
    },
   /* {
      name: 'setup-microsoft',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' }
    },
    {
      name: 'setup-magic',
      use: { ...devices['Desktop Chrome'] }
    },

    // 2) Test projects that REUSE storageState
    {
      name: 'google',
      use: { storageState: 'storage/google.json', ...devices['Desktop Chrome'] },
      dependencies: [] // run after you’ve generated storage/google.json once
    },
    {
      name: 'microsoft',
      use: { storageState: 'storage/microsoft.json', ...devices['Desktop Chrome'] },
      dependencies: []
    },
    {
      name: 'magic-link',
      use: { storageState: 'storage/magic.json', ...devices['Desktop Chrome'] },
      dependencies: []
    }*/
  ],
});
