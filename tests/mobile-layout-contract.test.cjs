const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('SimHub start cards use the established full-card link interaction', () => {
  const html = read('index.html');
  const start = html.match(/<section class="pha-tools" id="learning-start">([\s\S]*?)<\/section>/)?.[1] || '';

  assert.equal((start.match(/<a class="pha-tcard/g) || []).length, 2);
  assert.equal(start.includes('<article class="pha-tcard'), false);
});

test('SimHub renders PPC Coach once as the primary learning card', () => {
  const html = read('index.html');
  const coachCards = html.match(/<a class="pha-tcard[^"]*" href="ppc-coach\.html">/g) || [];

  assert.equal(coachCards.length, 1);
  assert.ok(html.indexOf('href="ppc-coach.html"') < html.indexOf('id="simulator-library"'));
});

test('new simulator display names do not expose roadmap S-number prefixes', () => {
  const displaySources = [
    'index.html',
    'planned-simulators.html',
    'assets/shell.js',
    'assets/curriculum-manifest.js',
    'assets/bid-decisions-core.js',
    'assets/campaign-architect-core.js',
    'assets/account-audit-core.js',
    'assets/sqp-studio-core.js',
    'assets/client-onboarding-core.js',
    'assets/capstone-sequence-core.js'
  ].map(read).join('\n');

  assert.doesNotMatch(displaySources, /['">]\s*S(?:2|8|9|10|11|12-S14)\s+(?:Bid Decisions|Campaign Architect|Account Audit|SQP Studio|Client Onboarding|Capstone)/);
});

test('hub progress presentation inherits the existing theme without inline colors', () => {
  const js = read('assets/hub-progress.js');
  const css = read('assets/hub.css');

  assert.equal(/#[0-9a-f]{3,8}/i.test(js), false);
  assert.equal(js.includes('style.cssText'), false);
  assert.match(css, /\.pha-progress-badge\s*\{/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*\.pha-progress-badge/);
});

test('PPC Coach progress uses its established brand treatment instead of status palettes', () => {
  const coach = read('ppc-coach.html');
  const practiceRenderer = coach.match(/function renderModulePractice[\s\S]*?\n}\n/)?.[0] || '';

  assert.equal(practiceRenderer.includes("view.tone==='success'"), false);
  assert.match(practiceRenderer, /bg-brand-50 text-brand-700 border border-brand-200/);
});

test('shared decision tables expose labels for a compact mobile presentation', () => {
  const renderer = read('assets/decision-simulator-page.js');
  const css = read('assets/decision-simulator.css');

  for (const label of ['Case', 'Signal', 'Metrics']) {
    assert.match(renderer, new RegExp('data-label="' + label + '"'));
  }
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*\.ds-table thead\s*\{\s*display:\s*none/);
  assert.match(css, /\.ds-table td::before/);
});

test('Bid Decisions and SQP Studio expose mobile field labels', () => {
  const bid = read('bid-decisions.html');
  const sqp = read('sqp-studio.html');

  for (const label of ['Target', 'Bid', 'Clicks', 'Action', 'Confidence']) {
    assert.match(bid, new RegExp('data-label="' + label + '"'));
  }
  for (const label of ['Query', 'Volume', 'Diagnosis', 'Follow-up']) {
    assert.match(sqp, new RegExp('data-label="' + label + '"'));
  }
});
