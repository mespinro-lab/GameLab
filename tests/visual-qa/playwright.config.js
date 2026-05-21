'use strict';

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['json', { outputFile: 'production/playtests/visual-qa-results.json' }],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'off',
  },

  webServer: {
    command: 'python3 -m http.server 3000 --directory src/life-tycoon',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },

  projects: [
    {
      name: 'mobile-360',
      use: { ...devices['Galaxy S9+'] },  // 360×740
    },
    {
      name: 'mobile-390',
      use: { ...devices['iPhone 14'] },   // 390×844
    },
    {
      name: 'desktop-1440',
      use: { viewport: { width: 1440, height: 900 } },
    },
  ],
});
