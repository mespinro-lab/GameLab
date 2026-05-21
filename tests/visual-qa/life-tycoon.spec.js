'use strict';

const { test, expect } = require('@playwright/test');
const { analyzeScreenshot, formatResult } = require('./helpers/claude-vision');

// ── Helpers ───────────────────────────────────────────────────────────────────

function viewportLabel(testInfo) {
  return `${testInfo.project.name} (${testInfo.project.use.viewport?.width ?? '?'}px)`;
}

/** Fails the test if any S1 or S2 issues are present. */
function assertNoBlockingIssues(result, label) {
  const blocking = result.issues.filter(i => i.severity === 'S1' || i.severity === 'S2');
  if (blocking.length > 0) {
    const detail = blocking.map(i => `[${i.severity}] ${i.element}: ${i.description}`).join('\n');
    throw new Error(`Visual QA blocking issues on "${label}":\n${detail}`);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Life Tycoon — Visual QA', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage so every test starts from a fresh game state
    await page.addInitScript(() => {
      localStorage.removeItem('lifetycoon_autosave');
      localStorage.removeItem('lifetycoon_history');
      localStorage.removeItem('lifetycoon_unlocks');
    });
    await page.goto('/');
    // Wait for the app to finish initialising (action list or map must be visible)
    await page.waitForSelector('#app', { state: 'visible', timeout: 8000 });
  });

  // ── 1. Initial load ─────────────────────────────────────────────────────────

  test('initial load — layout and readability', async ({ page }, testInfo) => {
    const label = viewportLabel(testInfo);
    await page.waitForTimeout(500); // let CSS transitions settle

    const screenshot = await page.screenshot({ fullPage: false });
    const result = await analyzeScreenshot(screenshot, 'Initial game load — first character generated, action list visible', label);

    console.log(formatResult(result, `Initial load @ ${label}`));
    testInfo.attach('initial-load', { body: screenshot, contentType: 'image/png' });

    assertNoBlockingIssues(result, `initial load @ ${label}`);
  });

  // ── 2. Resource bar ─────────────────────────────────────────────────────────

  test('resource bar — icons and values legible', async ({ page }, testInfo) => {
    const label = viewportLabel(testInfo);
    await page.waitForSelector('#panel-top-resources', { state: 'visible' });

    const bar = await page.locator('#panel-top-resources').screenshot();
    const result = await analyzeScreenshot(bar, 'Top resource bar showing food (🍖), health (❤️) values', label);

    console.log(formatResult(result, `Resource bar @ ${label}`));
    testInfo.attach('resource-bar', { body: bar, contentType: 'image/png' });

    assertNoBlockingIssues(result, `resource bar @ ${label}`);
  });

  // ── 3. Action list tap targets ───────────────────────────────────────────────

  test('action list — tap targets and labels', async ({ page }, testInfo) => {
    const label = viewportLabel(testInfo);

    // The action list panel — wait for at least one action button
    await page.waitForSelector('#panel-actions', { state: 'visible', timeout: 8000 })
      .catch(() => page.waitForSelector('.action-btn', { state: 'visible', timeout: 8000 }));

    const screenshot = await page.screenshot({ fullPage: false });
    const result = await analyzeScreenshot(
      screenshot,
      'Action selection panel — list of available actions (Recol·lectar, Caçar, Descansar, etc.) with Catalan labels',
      label
    );

    console.log(formatResult(result, `Action list @ ${label}`));
    testInfo.attach('action-list', { body: screenshot, contentType: 'image/png' });

    assertNoBlockingIssues(result, `action list @ ${label}`);
  });

  // ── 4. Character stats panel ─────────────────────────────────────────────────

  test('character dashboard — stats and traits visible', async ({ page }, testInfo) => {
    const label = viewportLabel(testInfo);
    await page.waitForSelector('#char-dashboard', { state: 'visible' });

    const panel = await page.locator('#char-dashboard').screenshot();
    const result = await analyzeScreenshot(
      panel,
      'Character dashboard showing name, stats (💪🧠👥), and innate traits',
      label
    );

    console.log(formatResult(result, `Character dashboard @ ${label}`));
    testInfo.attach('char-dashboard', { body: panel, contentType: 'image/png' });

    assertNoBlockingIssues(result, `character dashboard @ ${label}`);
  });

  // ── 5. No horizontal overflow at 360px ───────────────────────────────────────

  test('no horizontal overflow', async ({ page }, testInfo) => {
    // Only meaningful on narrow viewports
    const width = testInfo.project.use.viewport?.width ?? 1440;
    if (width > 480) {
      test.skip();
      return;
    }

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (overflow) {
      const screenshot = await page.screenshot({ fullPage: true });
      testInfo.attach('overflow-evidence', { body: screenshot, contentType: 'image/png' });
    }

    expect(overflow, 'Page has horizontal overflow at 360px — some element is wider than the viewport').toBe(false);
  });

  // ── 6. Lineage tech panel ────────────────────────────────────────────────────

  test('lineage tech panel (📜) opens correctly', async ({ page }, testInfo) => {
    const label = viewportLabel(testInfo);

    const techBtn = page.locator('#btn-lineage-toggle, [id*="lineage"], [id*="tech"]').first();
    const btnVisible = await techBtn.isVisible().catch(() => false);

    if (!btnVisible) {
      test.skip();
      return;
    }

    await techBtn.click();
    await page.waitForTimeout(400); // animation

    const screenshot = await page.screenshot({ fullPage: false });
    const result = await analyzeScreenshot(
      screenshot,
      'Lineage tech panel open — showing dynasty technologies and knowledge tree',
      label
    );

    console.log(formatResult(result, `Tech panel @ ${label}`));
    testInfo.attach('tech-panel', { body: screenshot, contentType: 'image/png' });

    assertNoBlockingIssues(result, `tech panel @ ${label}`);
  });

});
