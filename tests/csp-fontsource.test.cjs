const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');

function htmlFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...htmlFiles(full));
    else if (entry.isFile() && full.endsWith('.html')) files.push(full);
  }
  return files;
}

test('Fontsource pages allow jsDelivr stylesheet and font origins in CSP', () => {
  const pages = htmlFiles(root).filter((file) => {
    const html = fs.readFileSync(file, 'utf8');
    return html.includes('assets/fonts.css');
  });

  assert.equal(pages.length, 23);
  for (const file of pages) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /style-src[^>]*https:\/\/cdn\.jsdelivr\.net/, path.relative(root, file));
    assert.match(html, /font-src[^>]*https:\/\/cdn\.jsdelivr\.net/, path.relative(root, file));
  }
});
