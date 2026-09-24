const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const vendorDir = path.join(root, 'assets', 'vendor');

// The installer is sold as an offline product, so browser libraries are committed
// artifacts. Pinning bytes + hashes means a silent upstream swap fails the suite,
// and an intentional upgrade is a deliberate edit here and in assets/vendor/README.md.
const PINNED = [
  {
    file: 'tailwind-play.js',
    bytes: 407279,
    sha256: '176e894661aa9cdc9a5cba6c720044cbbf7b8bd80d1c9a142a7c24b1b6c50d15',
  },
  {
    file: 'chart.umd.min.js',
    bytes: 205399,
    sha256: 'd2af8974e95271638772e9e9524db5b9a6f58d6ec2d5d781400447b4a31c681e',
  },
  {
    file: 'xlsx.full.min.js',
    bytes: 945578,
    sha256: '0dcbc967984de297bd4233cbb77febad8a396c72d8ac0cfab09094d6d7f6e805',
  },
];

const SKIP_DIRS = new Set(['.git', 'node_modules', 'release', 'dist', 'out', 'build', '.cache']);

function htmlFiles(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      htmlFiles(path.join(dir, entry.name), found);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      found.push(path.join(dir, entry.name));
    }
  }
  return found;
}

test('vendored browser libraries match their recorded bytes and hashes', () => {
  for (const pin of PINNED) {
    const full = path.join(vendorDir, pin.file);
    assert.ok(fs.existsSync(full), `assets/vendor/${pin.file} must exist for offline desktop builds`);
    const buf = fs.readFileSync(full);
    assert.equal(buf.length, pin.bytes, `assets/vendor/${pin.file} changed size (${buf.length} bytes)`);
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    assert.equal(hash, pin.sha256, `assets/vendor/${pin.file} hash drifted from the pinned artifact`);
  }
});

test('every vendored library is actually used by a page', () => {
  const pages = htmlFiles(root);
  const bodies = pages.map((file) => [path.relative(root, file).replace(/\\/g, '/'), fs.readFileSync(file, 'utf8')]);

  for (const pin of PINNED) {
    const users = bodies.filter(([, body]) => body.includes(`assets/vendor/${pin.file}`)).map(([rel]) => rel);
    assert.ok(users.length > 0, `assets/vendor/${pin.file} is pinned but referenced by no page`);
  }
});

test('no page loads a browser library from a remote script URL', () => {
  const offenders = [];
  const remoteScript = /<script\b[^>]*\bsrc\s*=\s*["']https?:\/\/[^"']+["']/gi;

  for (const file of htmlFiles(root)) {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(remoteScript)) {
      offenders.push(`${rel}: ${match[0]}`);
    }
  }

  // Ratchet, not a wish: pages may still *permit* remote origins in their CSP, but no tag may
  // pull code from them, because an offline installer must not depend on somebody else's uptime.
  assert.deepEqual(offenders, [], `${offenders.length} page(s) still load scripts over the network`);
});
