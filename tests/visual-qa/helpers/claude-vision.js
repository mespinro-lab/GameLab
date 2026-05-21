'use strict';

const Anthropic = require('@anthropic-ai/sdk');

// Lazy — do not instantiate at require() time so missing API key doesn't crash
// Playwright's module loader before any test runs.
let _client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }
  if (!_client) _client = new Anthropic();
  return _client;
}

/**
 * Sends a Playwright screenshot buffer to Claude Vision and returns
 * structured QA findings.
 *
 * @param {Buffer} screenshotBuffer  PNG buffer from page.screenshot()
 * @param {string} context           Short description of what's on screen
 * @param {string} viewport          e.g. "360px mobile" or "1440px desktop"
 * @returns {Promise<VisualQAResult>}
 */
async function analyzeScreenshot(screenshotBuffer, context, viewport) {
  const client = getClient();
  if (!client) {
    console.warn('ANTHROPIC_API_KEY not set — skipping Claude Vision analysis, returning pass.');
    return { pass: true, observations: 'Claude Vision skipped (no API key).', issues: [] };
  }

  const base64 = screenshotBuffer.toString('base64');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: base64 },
          },
          {
            type: 'text',
            text: `You are a mobile game visual QA tester reviewing a screenshot of "Life Tycoon", a browser-based dynasty simulation with a Catalan UI. Viewport: ${viewport}. Screen: ${context}.

Analyze the screenshot and respond with ONLY valid JSON — no prose before or after:

{
  "pass": true or false,
  "observations": "one sentence overall assessment",
  "issues": [
    {
      "severity": "S1" | "S2" | "S3" | "S4",
      "element": "short element name",
      "description": "what is wrong"
    }
  ]
}

Severity guide:
- S1: Crash-level or content completely inaccessible / invisible
- S2: Text overflow, button too small to tap (<32px), critical info obscured
- S3: Minor alignment, padding, or contrast issue
- S4: Polish suggestion only

If no issues found, return an empty issues array and pass: true.`,
          },
        ],
      },
    ],
  });

  const raw = response.content[0].text.trim();

  // Strip markdown code fences if the model adds them
  const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

  try {
    return JSON.parse(json);
  } catch {
    return {
      pass: false,
      observations: 'Claude Vision returned unparseable output.',
      issues: [{ severity: 'S3', element: 'vision-parser', description: raw }],
    };
  }
}

/**
 * Formats a VisualQAResult for console output and PR comments.
 */
function formatResult(result, label) {
  const icon = result.pass ? '✅' : '❌';
  const lines = [`${icon} ${label} — ${result.observations}`];
  for (const issue of result.issues) {
    lines.push(`  [${issue.severity}] ${issue.element}: ${issue.description}`);
  }
  return lines.join('\n');
}

module.exports = { analyzeScreenshot, formatResult };
