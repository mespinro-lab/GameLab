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
    baseURL: 'http://localhost:3000/src/life-tycoon/',
    // Screenshots on every test so the artifact shows what actually happened
    screenshot: 'on',
    trace: 'retain-on-failure',
  },

  webServer: {
    // Serve repo root so ../../design/life-tycoon/ paths resolve correctly
    command: `python3 -m http.server 3000 --directory ${ROOT}`,
    url: 'http://localhost:3000/src/life-tycoon/',
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
      use: { ...devices['Pixel 5'] },     // 393×851, Chromium-based
    },
    {
      name: 'desktop-1440',
      use: { viewport: { width: 1440, height: 900 } },
    },
  ],
});
