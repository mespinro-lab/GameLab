'use strict';

const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '../..');

module.exports = defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  timeout: 120_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(ROOT, 'production/playtests/visual-qa-results.json') }],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'off',
  },

  webServer: {
    // cwd defaults to the config file directory — use ROOT so paths resolve correctly
    command: `python3 -m http.server 3000 --directory ${path.join(ROOT, 'src/life-tycoon')}`,
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
