const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const WEB_ICON = path.join(root, 'favicon.ico');
const APP_ICON = path.join(root, 'build', 'icon.ico');
const BUDGET = 120_000;
const REQUIRED_SIZES = [16, 24, 32, 48, 64, 128, 256];

// The Windows installer shipped with the stock Electron icon for its whole life: build.win.icon
// was unset and there was no .ico anywhere in the repo, so the taskbar, Start-menu shortcut and
// installed-apps entry all said "Electron" on a paid training product. Both icons are generated
// from the 1024px logo master, so these checks exist to keep that from quietly reverting.
function parseIco(file) {
  const buf = fs.readFileSync(file);
  assert.equal(buf.readUInt16LE(0), 0, `${file}: reserved field must be 0`);
  assert.equal(buf.readUInt16LE(2), 1, `${file}: type must be 1 (icon)`);
  const count = buf.readUInt16LE(4);
  assert.ok(count > 0, `${file}: zero image entries`);

  const entries = [];
  for (let i = 0; i < count; i++) {
    const o = 6 + i * 16;
    const off = buf.readUInt32LE(o + 12);
    const bytes = buf.readUInt32LE(o + 8);
    entries.push({
      w: buf.readUInt8(o) || 256,
      h: buf.readUInt8(o + 1) || 256,
      bpp: buf.readUInt16LE(o + 6),
      off,
      bytes,
      png: buf.subarray(off + 1, off + 4).toString('latin1') === 'PNG',
    });
  }
  return { buf, entries };
}

test('the web favicon and the app icon exist and are real ICO containers', () => {
  for (const file of [WEB_ICON, APP_ICON]) {
    assert.ok(fs.existsSync(file), `${path.relative(root, file)} is missing`);
    const { buf, entries } = parseIco(file);

    for (const e of entries) {
      assert.ok(e.off + e.bytes <= buf.length, `${path.relative(root, file)}: entry ${e.w}x${e.h} runs past EOF`);
      assert.equal(e.w, e.h, `${path.relative(root, file)}: ${e.w}x${e.h} is not square`);
      assert.ok(e.png, `${path.relative(root, file)}: ${e.w}px entry is not PNG-compressed`);
    }

    const sizes = entries.map((e) => e.w).sort((a, b) => a - b);
    assert.deepEqual(sizes, REQUIRED_SIZES, `${path.relative(root, file)}: sizes are ${sizes.join(',')}`);
    assert.ok(buf.length <= BUDGET, `${path.relative(root, file)}: ${buf.length} bytes over the ${BUDGET} budget`);
  }
});

test('favicon and installer icon are the same bytes so they cannot drift apart', () => {
  const a = crypto.createHash('sha256').update(fs.readFileSync(WEB_ICON)).digest('hex');
  const b = crypto.createHash('sha256').update(fs.readFileSync(APP_ICON)).digest('hex');
  assert.equal(a, b, 'favicon.ico and build/icon.ico differ — regenerate with the same master');
});

test('the installer config points at the icon that is actually shipped', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.build.win.icon, 'build/icon.ico', 'build.win.icon must be explicit, not defaulted');
  assert.ok(fs.existsSync(path.join(root, pkg.build.win.icon)), 'build.win.icon names a missing file');
});

// favicon.ico is deliberately NOT in build.files: under file:// Chromium never requests it, so
// packaging it would add ~79 KB of dead weight to every installed copy. The tab icon in the app
// comes from the executable, which is what build/icon.ico feeds.
test('the favicon is not packaged into the app where nothing can request it', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.ok(!pkg.build.files.includes('favicon.ico'), 'favicon.ico belongs to the web surface only');
  assert.ok(pkg.build.files.includes('assets/**/*'), 'assets must still ship (fonts and art live there)');
});
