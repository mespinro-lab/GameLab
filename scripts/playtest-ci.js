'use strict';

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const ROOT = path.resolve(__dirname, '..');
const PROTO = path.join(ROOT, 'prototypes/bloodline');

const PERSPECTIVES = [
  {
    id: 'bugs',
    label: 'Bug Audit',
    prompt: `You are a game QA engineer auditing a Catalan-language browser game called Life Tycoon 2.
Read the source code below and identify bugs: logic errors, broken state mutations, incorrect calculations, progression blockers, or any code that will not behave as intended.
For each bug found, provide: severity (S1 critical / S2 major / S3 minor), location (file:line), description, and reproduction steps.
Be specific and cite line numbers. Only report genuine bugs, not style issues.`,
  },
  {
    id: 'ux',
    label: 'UX & Readability',
    prompt: `You are a UX reviewer auditing a Catalan-language browser game called Life Tycoon 2 targeting 360px mobile screens.
Read the source code below and identify UX issues: confusing Catalan labels, touch targets likely below 32px, overlapping elements, missing feedback, unclear onboarding, or anything that would confuse a new player.
For each issue found, provide: severity (S2 major / S3 minor / S4 trivial), location, and a concrete suggestion.`,
  },
  {
    id: 'balance',
    label: 'Gameplay Balance',
    prompt: `You are a game balance designer auditing a Catalan-language browser game called Life Tycoon 2.
Read the source code below and identify balance issues: resource faucets/sinks that are broken, actions that are always dominant or never worth using, progression gates that are too tight or too loose, or formulas that produce degenerate outcomes.
For each issue found, provide: severity (S2 major / S3 minor), location, and a concrete fix suggestion.`,
  },
];

function readSources() {
  const files = ['game.js', 'data.js', 'index.html', 'style.css'];
  const parts = [];
  for (const f of files) {
    const fpath = path.join(PROTO, f);
    if (fs.existsSync(fpath)) {
      parts.push(`\n\n=== ${f} ===\n${fs.readFileSync(fpath, 'utf8')}`);
    }
  }
  return parts.join('');
}

async function main() {
  const client = new Anthropic();

  const date = new Date().toISOString().slice(0, 10);
  const outDir = path.join(ROOT, 'production/playtests', date);
  fs.mkdirSync(outDir, { recursive: true });

  console.log('Reading source files...');
  const sources = readSources();
  if (!sources.trim()) {
    console.error('No source files found in prototypes/bloodline/');
    process.exit(1);
  }
  console.log(`  Source loaded: ${Math.round(sources.length / 1024)}KB`);

  const userMessage = `Here is the full source code of the game:\n${sources}`;
  const sections = [];

  for (const p of PERSPECTIVES) {
    console.log(`Running ${p.label} analysis...`);
    try {
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: p.prompt,
        messages: [{ role: 'user', content: userMessage }],
      });
      sections.push(`## ${p.label}\n\n${msg.content[0].text}`);
      console.log(`  ✓ ${p.label} done`);
    } catch (err) {
      sections.push(`## ${p.label}\n\n_Analysis failed: ${err.message}_`);
      console.error(`  ✗ ${p.label} failed:`, err.message);
    }
  }

  const report = `# Playtest Report — ${date}

**Game**: Life Tycoon 2 (prototypes/bloodline/)
**Perspectives**: Bug Audit · UX & Readability · Gameplay Balance

---

${sections.join('\n\n---\n\n')}
`;

  const outPath = path.join(outDir, 'summary.md');
  fs.writeFileSync(outPath, report, 'utf8');
  console.log(`Report written to ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
