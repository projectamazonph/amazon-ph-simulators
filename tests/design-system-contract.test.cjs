const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const simulatorPages = [
  'account-audit.html',
  'ad-console.html',
  'bid-decisions.html',
  'bulk-file.html',
  'campaign-architect.html',
  'capstone-sequence.html',
  'client-onboarding.html',
  'keyword-lab.html',
  'listing.html',
  'pacing-deck.html',
  'ppc-coach.html',
  'search-triage.html',
  'sqp-studio.html'
];

const sharedDecisionPages = new Set();

const learningPages = [
  'learn/downloads.html',
  'learn/features.html',
  'learn/guide.html',
  'learn/handouts.html',
  'learn/index.html'
];

test('every simulator consumes the central design-system cascade', () => {
  for (const page of simulatorPages) {
    const html = read(page);
    const fonts = html.indexOf('href="assets/fonts.css"');
    const tokens = html.indexOf('href="assets/tokens.css"');
    const nativeHref = sharedDecisionPages.has(page)
      ? 'href="assets/decision-simulator.css"'
      : `href="assets/${page.replace('.html', '.css')}"`;
    const nativeStyles = html.indexOf(nativeHref);
    const skin = html.indexOf('href="assets/skin.css"');
    const shell = html.indexOf('href="assets/shell.css"');

    assert.notEqual(fonts, -1, `${page} must import the shared brand fonts`);
    assert.notEqual(tokens, -1, `${page} must import tokens.css`);
    assert.notEqual(skin, -1, `${page} must import skin.css`);
    assert.notEqual(shell, -1, `${page} must import shell.css`);
    assert.ok(fonts < tokens, `${page} must load fonts before design tokens`);
    assert.ok(tokens < nativeStyles, `${page} must expose tokens to its native stylesheet`);
    assert.ok(nativeStyles < skin, `${page} must load the unifying skin after native styles`);
    assert.ok(skin < shell, `${page} must load the shared shell last`);
  }
});

test('simulators do not load page-specific font families', () => {
  for (const page of simulatorPages) {
    const html = read(page);

    assert.doesNotMatch(html, /(?:fontsource|fonts\.googleapis\.com\/css2)/i, `${page} bypasses fonts.css`);
  }
});

test('stylesheets use the shared font tokens instead of legacy font stacks', () => {
  const cssFiles = fs.readdirSync(path.join(root, 'assets'))
    .filter((file) => file.endsWith('.css') && file !== 'fonts.css');
  const fragmentedFonts = /(?:['"]Inter['"]|Space Grotesk|['"]Anton['"]|JetBrains Mono|IBM Plex Sans|Archivo Variable)/i;

  for (const file of cssFiles) {
    assert.doesNotMatch(read(`assets/${file}`), fragmentedFonts, `${file} declares a legacy font family`);
  }
});

test('simulator pages keep presentation out of HTML', () => {
  for (const page of simulatorPages) {
    assert.doesNotMatch(read(page), /<style(?:\s[^>]*)?>[\s\S]*?<\/style>/i, `${page} contains inline CSS`);
  }
});

test('shared shell aliases central tokens instead of duplicating brand constants', () => {
  const css = read('assets/shell.css');

  assert.match(css, /--shell-navy:\s*var\(--c-navy-2\)/);
  assert.match(css, /--shell-orange:\s*var\(--c-orange\)/);
  assert.doesNotMatch(css.match(/:root\s*\{[\s\S]*?\}/)?.[0] || '', /#[0-9a-f]{3,8}/i);
});

test('shared shell repairs either missing design-system stylesheet independently', () => {
  const shell = read('assets/shell.js');
  const injectSkin = shell.match(/function injectSkin\(\)[\s\S]*?\n  \}/)?.[0] || '';

  assert.match(injectSkin, /if \(!document\.querySelector\('link\[data-pha-tokens\]/);
  assert.match(injectSkin, /if \(!document\.querySelector\('link\[data-pha-skin\]/);
  assert.doesNotMatch(injectSkin, /tokens[^\n]*\) return/);
});

test('decision simulators alias the central palette instead of defining a parallel one', () => {
  const css = read('assets/decision-simulator.css');
  const rootTokens = css.match(/:root\s*\{[\s\S]*?\}/)?.[0] || '';

  assert.match(rootTokens, /--ds-bg:\s*var\(--c-bg\)/);
  assert.match(rootTokens, /--ds-orange:\s*var\(--c-orange\)/);
  assert.doesNotMatch(rootTokens, /#[0-9a-f]{3,8}/i);
});

test('shared shell resolves assets and navigation from nested learning pages', () => {
  const shell = read('assets/shell.js');

  for (const page of learningPages) {
    const html = read(page);
    assert.match(html, /<body[^>]*data-pha-root="\.\.\/"/);
    assert.match(html, /<body[^>]*data-pha-page-name="Learn &amp; Docs"/);
  }
  assert.match(shell, /function rootPrefix\(\)/);
  assert.match(shell, /rootPrefix\(\) \+ 'assets\/tokens\.css'/);
  assert.match(shell, /rootPrefix\(\) \+ t\.file/);
  assert.match(shell, /var root = rootPrefix\(\)/);
  assert.match(shell, /root \+ 'index\.html"/);
  assert.match(shell, /data-pha-page-name/);
});

test('learning pages use the shared design-system cascade without inline style blocks', () => {
  for (const page of learningPages) {
    const html = read(page);
    const name = page.split('/').pop().replace('.html', '');
    const fonts = html.indexOf('href="../assets/fonts.css"');
    const tokens = html.indexOf('href="../assets/tokens.css"');
    const shared = html.indexOf('href="../assets/learn.css"');
    const pageStyles = html.indexOf(`href="../assets/learn-${name}.css"`);
    const skin = html.indexOf('href="../assets/skin.css"');
    const shell = html.indexOf('href="../assets/shell.css"');

    assert.ok(fonts !== -1 && fonts < tokens, `${page} must load shared fonts first`);
    assert.ok(tokens < shared && shared < pageStyles, `${page} has an invalid learning CSS cascade`);
    assert.ok(pageStyles < skin && skin < shell, `${page} must load skin and shell last`);
    assert.doesNotMatch(html, /<style(?:\s[^>]*)?>[\s\S]*?<\/style>/i, `${page} contains inline CSS`);
    assert.doesNotMatch(html, /<main[^>]*style=/i, `${page} styles its main landmark inline`);
  }
});

test('interactive HTML uses explicit button behavior and valid link semantics', () => {
  const pages = [
    ...fs.readdirSync(root).filter((file) => file.endsWith('.html')),
    ...learningPages
  ];

  for (const page of pages) {
    const html = read(page);
    assert.doesNotMatch(html, /<button\b(?![^>]*\btype=)/i, `${page} has a button with an implicit type`);
    assert.doesNotMatch(html, /<a\b(?![^>]*\bhref=)/i, `${page} uses a link without a destination`);
  }
});

test('shared shell provides keyboard users a skip-to-content link', () => {
  const shell = read('assets/shell.js');
  const shellCss = read('assets/shell.css');

  assert.match(shell, /function ensureSkipLink\(\)/);
  assert.match(shell, /document\.querySelector\('main'\)/);
  assert.match(shell, /skip\.className = 'pha-skip-link'/);
  assert.match(shell, /ensureChrome\(\);\s*ensureSkipLink\(\);/);
  assert.match(shellCss, /\.pha-skip-link:focus/);
});

test('mobile shell keeps navigation out of header flow and groups footer links', () => {
  const responsive = read('assets/responsive.css');
  const shell = read('assets/shell.js');
  assert.match(responsive, /\.pha-topbar \{[\s\S]*?height: 72px/);
  assert.match(responsive, /\.pha-topbar \.pha-nav \{[\s\S]*?display: none/);
  assert.match(responsive, /\.pha-topbar \.pha-nav\.is-open \{[\s\S]*?display: flex/);
  assert.match(shell, /data-label="Academy"/);
  assert.match(shell, /data-label="Simulators"/);
});
