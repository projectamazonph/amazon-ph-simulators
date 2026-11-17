const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const css = read('assets/ad-console.css');
const html = read('ad-console.html');

// Flatten the stylesheet into { selector, body } pairs so a rule can be
// inspected without matching on its exact formatting.
function rules(source) {
  const out = [];
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const block of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const body = block[2].trim();
    if (!body) continue;
    for (const selector of block[1].split(',')) out.push({ selector: selector.trim(), body });
  }
  return out;
}

const parsed = rules(css);

test('AdConsole scopes the select control skin to real <select> elements', () => {
  // `.sel` is also the selected state on wizard cards. A bare `.sel` rule would
  // re-skin those cards as form controls and collapse them.
  assert.doesNotMatch(css, /(?:^|[\s,])\.sel(?=[\s,{:])/m, 'a bare .sel rule leaks the control skin onto cards');

  const control = parsed.find((rule) => rule.selector === 'select.sel');
  assert.ok(control, 'the shared form-control rule must target select.sel');
  assert.match(control.body, /height:34px/);
  assert.match(control.body, /width:100%/);
  assert.ok(
    parsed.some((rule) => rule.selector === '.inp' && /height:34px/.test(rule.body)),
    'text inputs must keep the shared control skin'
  );

  assert.ok(
    parsed.some((rule) => rule.selector === '.fbar select.sel'),
    'campaign filter selects must keep their scoped sizing'
  );
});

test('selected wizard cards keep full card height and text clearance', () => {
  // Card states may change colour/border but never inherit control geometry.
  for (const selector of ['.pcard.sel', '.tcard.sel', '.radioc.sel']) {
    // Pseudo-elements (the check badge) may size themselves; the card box may not.
    const state = parsed.filter((rule) => rule.selector.includes(selector) && !rule.selector.includes('::'));
    assert.ok(state.length > 0, `${selector} must have a selected-state rule`);
    for (const rule of state) {
      assert.doesNotMatch(rule.body, /(?:^|;)\s*height\s*:/, `${rule.selector} must not pin a control height`);
      assert.doesNotMatch(rule.body, /appearance\s*:/, `${rule.selector} must not reuse the select appearance reset`);
      assert.doesNotMatch(rule.body, /background-image\s*:\s*url\(/, `${rule.selector} must not reuse the select chevron`);
    }
  }

  const cardColumn = parsed.find((rule) => rule.selector === '.pcard>div');
  assert.ok(cardColumn, 'product cards need a shrinkable info column');
  assert.match(cardColumn.body, /min-width:0/);

  const cardTitle = parsed.find((rule) => rule.selector === '.pcard b');
  assert.match(cardTitle.body, /overflow-wrap:anywhere/);
  assert.match(cardTitle.body, /padding-right:20px/);

  // The wizard markup drives both the base and selected classes.
  assert.match(html, /class="pcard '\+\(wz\.products\.has\(p\.id\)\?'sel':''\)\+'"/);
  assert.match(html, /class="tcard '\+\(wz\.type===t\[0\]\?'sel':''\)\+'"/);
  assert.match(html, /class="radioc '\+\(wz\.strategy===o\[0\]\?'sel':''\)\+'"/);
});

test('the campaign table reserves enough width for its fourteen columns', () => {
  const wide = parsed.find((rule) => rule.selector === '.twrap>.tbl.wide');
  assert.ok(wide, 'the wide table variant must exist');
  const minWidth = Number(wide.body.match(/min-width:\s*(\d+)px/)?.[1]);
  assert.ok(minWidth >= 900, 'a fourteen-column table must not be crushed below 900px');

  assert.match(html, /buildTable\('camps',cols,rows,rowHtml,\{key:'sp',dir:-1\},'wide'\)/);
  assert.match(html, /class="tbl'\+\(tableClass\?' '\+tableClass:''\)\+'"/);
});

test('AdConsole modals layer above the shared shell chrome', () => {
  const overlay = parsed.find((rule) => rule.selector === '#modal-root .mroot');
  assert.ok(overlay, 'the modal overlay rule must exist');
  const zIndex = Number(overlay.body.match(/z-index:\s*(\d+)/)?.[1]);
  assert.ok(zIndex > 9000, 'the modal overlay must paint above the 9000z shell topbar');

  // shell.js wraps page content in .pha-skin-wrap, which is its own stacking
  // context; the overlay has to be rendered at body level to beat the topbar.
  assert.match(html, /document\.body\.appendChild\(root\)/);
});
