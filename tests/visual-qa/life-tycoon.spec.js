'use strict';

const { test, expect } = require('@playwright/test');
const { analyzeScreenshot, formatResult } = require('./helpers/claude-vision');

const TURNS_TO_PLAY = parseInt(process.env.TURNS || '20');

// ── Game flow helpers ─────────────────────────────────────────────────────────

/** Navigate past the main menu and start a new game. */
async function startNewGame(page) {
  await page.waitForSelector('#overlay-menu', { state: 'visible', timeout: 8000 });
  await page.click('#btn-new-game');
  await page.waitForSelector('#overlay-new-game', { state: 'visible' });
  await page.click('#btn-start-new-game');
  await page.waitForSelector('.zone-node', { state: 'visible', timeout: 8000 });
}

/** Dismiss any full-screen overlay that blocks the map. */
async function dismissOverlays(page) {
  const candidates = [
    '#btn-dismiss-discovery',
    '#btn-dismiss-birth',
    '#ds-btn-continue',
    '#btn-era-transition-continue',
    '#btn-close-zone-sheet',
  ];
  for (const sel of candidates) {
    const btn = page.locator(sel);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(250);
    }
  }
}

/**
 * Play N turns: click a zone node → tap the center carousel item → wait.
 * Uses .tap() because the carousel only listens to touchend events.
 */
async function playTurns(page, turns) {
  for (let i = 0; i < turns; i++) {
    await dismissOverlays(page);

    // End of time slots — pass the cycle
    const passBtn = page.locator('#btn-rest-cycle');
    if (await passBtn.isVisible().catch(() => false)) {
      await passBtn.click();
      await page.waitForTimeout(400);
      continue;
    }

    const zoneNode = page.locator('.zone-node').first();
    if (!await zoneNode.isVisible().catch(() => false)) break;
    await zoneNode.click();
    await page.waitForTimeout(250);

    // Carousel: first .zc-item is always at CAROUSEL.idx = 0 (center)
    // Must use .tap() — carousel only fires carouselOpenCurrent() on touchend
    const zcItem = page.locator('#zone-carousel-viewport .zc-item').first();
    if (await zcItem.isVisible().catch(() => false)) {
      await zcItem.tap();
      await page.waitForTimeout(800);
    } else {
      const closeBtn = page.locator('#btn-close-zone-sheet');
      if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
    }

    await dismissOverlays(page);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function viewportLabel(testInfo) {
  return `${testInfo.project.name} (${testInfo.project.use.viewport?.width ?? '?'}px)`;
}

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
    await page.addInitScript(() => {
      localStorage.removeItem('lifetycoon_autosave');
      localStorage.removeItem('lifetycoon_history');
      localStorage.removeItem('lifetycoon_unlocks');
    });
    await page.goto('/');
    await page.waitForSelector('#app', { state: 'visible', timeout: 8000 });
  });

  // ── 1. Main menu ─────────────────────────────────────────────────────────────

  test('main menu — layout and readability', async ({ page }, testInfo) => {
    const label = viewportLabel(testInfo);
    await page.waitForSelector('#overlay-menu', { state: 'visible' });
    await page.waitForTimeout(400);

    const screenshot = await page.screenshot({ fullPage: false });
    const result = await analyzeScreenshot(
      screenshot,
      'Main menu — game title "Life Tycoon", navigation buttons in Catalan (Nova partida, Continuar, Fites, Botiga, Historial, Opcions)',
      label
    );

    console.log(formatResult(result, `Main menu @ ${label}`));
    testInfo.attach('main-menu', { body: screenshot, contentType: 'image/png' });
    assertNoBlockingIssues(result, `main menu @ ${label}`);
  });

  // ── 2. In-game map ────────────────────────────────────────────────────────────

  test('in-game map — zone nodes and dashboard', async ({ page }, testInfo) => {
    const label = viewportLabel(testInfo);
    await startNewGame(page);
    await page.waitForTimeout(400);

    const screenshot = await page.screenshot({ fullPage: false });
    const result = await analyzeScreenshot(
      screenshot,
      'In-game map with clickable zone nodes, character dashboard at top (food/health bar), cycle info at bottom',
      label
    );

    console.log(formatResult(result, `In-game map @ ${label}`));
    testInfo.attach('in-game-map', { body: screenshot, contentType: 'image/png' });
    assertNoBlockingIssues(result, `in-game map @ ${label}`);
  });

  // ── 3. Zone action sheet ──────────────────────────────────────────────────────

  test('zone action sheet — carousel and action labels', async ({ page }, testInfo) => {
    const label = viewportLabel(testInfo);
    await startNewGame(page);

    await page.locator('.zone-node').first().click();
    await page.waitForSelector('#overlay-zone-actions', { state: 'visible' });
    await page.waitForTimeout(400);

    const screenshot = await page.screenshot({ fullPage: false });
    const result = await analyzeScreenshot(
      screenshot,
      'Zone action sheet — carousel showing available actions (Recol·lectar, Caçar, Descansar, etc.) with Catalan labels and icons',
      label
    );

    console.log(formatResult(result, `Zone action sheet @ ${label}`));
    testInfo.attach('zone-action-sheet', { body: screenshot, contentType: 'image/png' });
    assertNoBlockingIssues(result, `zone action sheet @ ${label}`);
  });

  // ── 4. Resource bar after turns ───────────────────────────────────────────────

  test('resource bar — legible values after gameplay', async ({ page }, testInfo) => {
    const label = viewportLabel(testInfo);
    await startNewGame(page);
    await playTurns(page, TURNS_TO_PLAY);

    await page.waitForSelector('#panel-top-resources', { state: 'visible' });
    const bar = await page.locator('#panel-top-resources').screenshot();
    const result = await analyzeScreenshot(
      bar,
      'Resource bar showing live food (🍖) and health (❤️) values after gameplay',
      label
    );

    console.log(formatResult(result, `Resource bar @ ${label}`));
    testInfo.attach('resource-bar', { body: bar, contentType: 'image/png' });
    assertNoBlockingIssues(result, `resource bar @ ${label}`);
  });

  // ── 5. Character dashboard ────────────────────────────────────────────────────

  test('character dashboard — stats and traits visible', async ({ page }, testInfo) => {
    const label = viewportLabel(testInfo);
    await startNewGame(page);
    await playTurns(page, TURNS_TO_PLAY);

    await page.waitForSelector('#char-dashboard', { state: 'visible' });
    const panel = await page.locator('#char-dashboard').screenshot();
    const result = await analyzeScreenshot(
      panel,
      'Character dashboard — name, generation badge, stat icons (💪🧠👥), age, and innate trait pills',
      label
    );

    console.log(formatResult(result, `Character dashboard @ ${label}`));
    testInfo.attach('char-dashboard', { body: panel, contentType: 'image/png' });
    assertNoBlockingIssues(result, `character dashboard @ ${label}`);
  });

  // ── 6. No horizontal overflow (mobile only) ───────────────────────────────────

  test('no horizontal overflow', async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 1440;
    if (width > 480) { test.skip(); return; }

    await startNewGame(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );

    if (overflow) {
      const screenshot = await page.screenshot({ fullPage: true });
      testInfo.attach('overflow-evidence', { body: screenshot, contentType: 'image/png' });
    }

    expect(overflow, `Horizontal overflow detected at ${width}px viewport`).toBe(false);
  });

  // ── 7. Lineage panel ──────────────────────────────────────────────────────────

  test('lineage panel — opens and readable', async ({ page }, testInfo) => {
    const label = viewportLabel(testInfo);
    await startNewGame(page);
    await playTurns(page, TURNS_TO_PLAY);

    const btn = page.locator('#btn-lineage-toggle');
    if (!await btn.isVisible().catch(() => false)) { test.skip(); return; }

    await btn.click();
    await page.waitForTimeout(400);

    const screenshot = await page.screenshot({ fullPage: false });
    const result = await analyzeScreenshot(
      screenshot,
      'Lineage panel open — showing dynasty or generation information',
      label
    );

    console.log(formatResult(result, `Lineage panel @ ${label}`));
    testInfo.attach('lineage-panel', { body: screenshot, contentType: 'image/png' });
    assertNoBlockingIssues(result, `lineage panel @ ${label}`);
  });

});
