# PROJECT-CONTEXT.md — shared baseline for agent sessions

Purpose: let a new session start from verified facts instead of re-deriving them.
Keep this file short and correct; if a claim below stops matching the repo, fix it here.

Last reconciled against the working tree: 2026-09-24.

## What ships

Two surfaces from one static tree — no framework, no build step, no backend:

1. **GitHub Pages** — `.github/workflows/deploy.yml` publishes the repo root on every push
   to `master`.
2. **Windows installer** — Electron + NSIS, `desktop/main.cjs`, version `1.2.1`,
   packaged by `package.json` `build.files`.

**Current product priority: desktop/offline first, then mobile web.** The installer is the
paid product; a page that needs network to render is a defect there, not a nice-to-have.

## Inventory (verified)

- 216 tracked `.html` files; 25 at the repo root.
- **Tool count, settled:** `assets/shell.js` `TOOLS` has 13 entries — 12 simulators plus
  `ppc-coach` (a teaching companion, not a simulator). "Twelve tools" in `CLAUDE.md` and "~15
  simulator pages" elsewhere both refer to this same set.
- `assets/` holds 58 files; 25 of them are `.js`.
- 32 test files in `tests/` (317 tests, `node --test tests/*.test.cjs`).
- Course content exists in three places: inline `MODULES` in `ppc-coach.html`,
  `assets/curriculum-manifest.js` (12 modules, `m0`..`m11`), and `coach-decks/`.

## Quality gates and their limits

Run the suite before shipping simulator changes:

```bash
node --test tests/*.test.cjs     # npm test fails under PowerShell (stderr notice + Stop)
```

- `tests/page-script-syntax.test.cjs` extracts every inline `<script>` from every HTML page
  in the tree and parses it (`vm.Script`) — JSON-LD blocks are validated as JSON. It fails
  closed on a suspiciously small scan, so it cannot pass by finding nothing.
- `tests/coach-curriculum-alignment.test.cjs` extracts the `MODULES` literal from
  `ppc-coach.html` and pins it to the manifest.
- `tests/vendor-assets.test.cjs` pins the size and SHA-256 of each file in `assets/vendor/` and
  fails if any page adds a remote `<script src>`. Upgrading a library means editing the hash in
  both that test and `assets/vendor/README.md`.
- `tests/local-image-assets.test.cjs` bans third-party artwork URLs, keeps `assets/img/` inside a
  400 KB budget, and pins `IMG` key liveness in both directions (see Known hazards).
- `tests/csp-fontsource.test.cjs` pins the 24 self-hosted faces, resolves each `url()` the way a
  browser does, checks woff2 magic bytes, forbids any network URL in `assets/fonts.css`, budgets the
  directory at 600 KB, and requires latin-ext range coverage per family.
- `tests/app-icon.test.cjs` parses both ICO containers, requires the 16–256 size ladder, asserts the
  favicon and installer icon are the same bytes, and checks `build.win.icon` points at a real file.
- Most other tests are **regex-on-file-content** contracts. They prove text patterns, not
  that a page runs. A green suite is necessary, not sufficient.
- CI: `deploy.yml` runs **no tests** — Pages ships whatever is on `master`. The suite runs in
  `build-windows-installer.yml` and the new `test.yml`.

## Known hazards

- **`ppc-coach.html` is 1,347 lines with a ~625-line inline data literal** (lines 350–974).
  A dropped delimiter anywhere in it kills the entire course silently.
- **Quiz IDs and saved progress keys are positional** (`m0`..`m11`). Deleting or reordering a
  module does not throw — it points stored learner data at the wrong module.
- `MODULES` references the page global `IMG`; it is not a standalone pure literal.
- `tests/csp-fontsource.test.cjs` asserts **exactly 25** pages containing `assets/fonts.css`.
  Adding or removing any HTML file anywhere in the tree can break it — including scratch files.
- **Offline / remote dependencies** (measured, not assumed): only **2** pages actually loaded the
  Tailwind Play CDN as a `<script>` (`ppc-coach.html`, `ad-console.html`), and only **1** loaded
  SheetJS (`bulk-file.html`) — those three libraries are now vendored in `assets/vendor/`.
  22 HTML files still *name* `cdn.tailwindcss.com`, but only inside their CSP `script-src` /
  `style-src` lists: leftover permissions, not dependencies. Do not read a CSP mention as a load.
  Artwork was hot-linked from `image.qwenlm.ai` at 13 unique URLs / 15 real references (11 in
  `ppc-coach.html`, 4 in `listing.html`), each a ~1 MB 1024×1024 PNG — **14,318.6 KB** total,
  which no offline installer can tolerate. It is now self-hosted in `assets/img/` as **248,260
  bytes** (98.3% smaller), re-encoded with ffmpeg/libwebp; see `assets/img/README.md`.
  `assets/fonts.css` then held the last remote dependency: 12 Fontsource `@import`s from jsDelivr,
  measured at 12–21 requests per page. Those are now 24 inlined `@font-face` rules over
  self-hosted woff2 in `assets/fonts/files/` (**446,316 bytes**), latin + latin-ext only.
  **A cold-cache headless-Edge sweep of all five heavy pages now reports `remoteHosts: {}`, zero
  broken images, and no 404s** — the app makes no network requests at all. Cold payload per page:
  PPC Coach 1,018 KB, BuyBox Dojo 362 KB, hub 245 KB, AdConsole 539 KB, Bulk File 1,252 KB (the last
  two dominated by SheetJS/Chart.js). Do not reintroduce a remote URL into `assets/fonts.css`;
  `tests/csp-fontsource.test.cjs` and `tests/simulator-layout-genome.test.cjs` both forbid it.
- **The installer had no product icon.** `build.win.icon` was unset and there was no `.ico` in the
  repo, so the taskbar, Start-menu shortcut and installed-apps list all rendered the stock Electron
  icon on a paid training product. `favicon.ico` (web) and `build/icon.ico` (installer) are now
  generated from the 1024px logo master with 7 PNG-compressed entries (16/24/32/48/64/128/256) and
  are byte-identical; `tests/app-icon.test.cjs` pins that. It also fixes the only console 404 the
  pages had: Chromium auto-requests `/favicon.ico` and only `ppc-coach.html` declared an icon.
- **The one remaining console error on every page is real but not fixable in place**: `frame-ancestors`
  inside a `<meta>` CSP is ignored by browsers, so the click-jacking directive has never applied.
  GitHub Pages cannot send response headers, so enforcing it needs either Electron's
  `session.webRequest.onHeadersReceived` in `desktop/main.cjs` or dropping the dead directive from
  all 25 pages. Both are security-adjacent, so neither was done silently.
- **latin-ext must stay.** Exactly two codepoints are declared by no other vendored subset, and
  both matter here: `Ā` (U+0100) and the peso sign `₱` (U+20B1). `œ` and `†` are also inside the
  latin range and do **not** justify latin-ext — an earlier draft of this file claimed they did.
  Verified twice: parsed from the declared `unicode-range`s, then confirmed against the renderer's
  actual font list. That second check found the ranges and the files disagree about `₱`: it is
  drawn by Archivo and IBM Plex Mono but **not** by PT Sans or Barlow Condensed, so peso amounts in
  body text use a system font. Not a vendoring regression — the same Fontsource 5.1.0 files came
  from jsDelivr before. See `assets/fonts/README.md`.
- **Font `url()` resolves against the stylesheet, not the repo root.** `assets/fonts.css` lives in
  `assets/` while its files live in `assets/fonts/files/`, so the correct prefix is
  `url(./fonts/files/…)`. Writing Fontsource's own `./files/…` layout produced 24 silently
  unfetched faces: the suite was green and only a page load showed `localFontRequests: 0`.
- **`m.img ? … : …` guards hide missing art.** See the artwork-keys hazard above; same failure
  shape as the font paths — a guard that turns "absent" into "quietly nothing".
- **There is no favicon in this repo.** Only `ppc-coach.html` declares `rel="icon"`, so Chromium
  auto-requests `/favicon.ico`, gets a 404, and logs a console error on the other 18 root pages.
  It is a real red line in every browser check until each page links an icon.
- **Artwork keys can be silently dead.** `ppc-coach.html` built module art paths as
  `img:IMG.<key>` against keys the `IMG` map never declared (`builder`, `lab`, `console`, `deck`,
  `triage`, `report`). The renderer guards with `m.img ? … : …`, so nothing threw and nothing
  displayed: 9 module headers shipped with no illustration for the entire life of the product,
  while 5 declared images were never read. `tests/local-image-assets.test.cjs` now asserts both
  directions of that contract. When adding module art, add the key to `IMG` *and* the `img:` field.
- `desktop/main.cjs` and `assets/coach-security.js` need security review before changes.
  `master` is protected: branch + PR, checks green, one approval.

## Verification that works here

- Dead-page check per file: extract `<script>` blocks (skip `src=`, skip `application/ld+json`),
  `new vm.Script(code, { filename })`. `node --check` on a temp `.cjs` also works; note its
  error's first stack line is `file:line` **without** a column.
- `vm.Script` only *parses*; it never runs, so page globals stay out of it.
- Live check in the in-app browser: expect **zero** console errors, then drive one real
  interaction (open a module, open a lesson). Screenshots alone are not evidence — query the
  rendered text.
- To compare against `master`: `git worktree add --detach <path> HEAD`. `git archive | tar`
  fails through PowerShell pipes. **Never nest a worktree inside this repo** — the HTML-walking
  tests count files tree-wide and will double-count or report a HEAD defect as a new one.
- **Real-browser measurement**: `chrome-devtools-mcp` has no usable browser here (no Chrome
  installed; Edge is at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`) and the
  in-app browser tool cannot execute JavaScript or report network entries. What works is raw CDP:
  launch `msedge.exe --headless=new --remote-debugging-port=9222 --user-data-dir=<repo>\.tmp-edge-profile`
  and drive `http://127.0.0.1:9222` with `fetch` + the global `WebSocket` in Node — no npm
  install, no approval. `Runtime.evaluate` gives decoded/broken image counts, `document.fonts.status`,
  load timings, and per-host request counts; that is the only way to prove an image actually decodes.
  **You must send `Network.setCacheDisabled` and use a fresh `--user-data-dir`.** The first two
  sweeps here were invalid: a persistent profile served the previous `fonts.css` from disk cache, so
  the page still showed 12 jsDelivr requests after the remote imports had been deleted, and the
  second run's byte totals were cache-warm near-zero.
- To ask *which font drew a glyph*, don't compare element widths — generic-family mapping makes
  that unreliable across pages. Use `DOM.getDocument` + `DOM.querySelector` +
  `CSS.getPlatformFontsForNode`, which returns real rendered families with `isCustomFont` and glyph
  counts. That is how the peso-sign coverage gap above was found rather than assumed.

## Session state worth knowing (2026-09-24)

- `ppc-coach.html` was completely dead at `master` (`SyntaxError`, first broken at `1f032ce`,
  ~4 weeks and 6 commits) while the suite stayed green. Repaired by splicing the last-known-good
  data literal from `d73ad02` into HEAD's renderer.
- Enriched lesson prose from the corrupted versions (416 blocks vs the 235 shipped) is archived
  at `docs/recovered/ppc-coach-modules-corrupted-2026-09-24.txt`. Decision: ship the Aug-27
  prose now, recover the enriched prose deliberately later — do not hand-patch the archive.
- Scratch `.tmp-*` files in the repo root are undeleted leftovers, not product files. Do not
  commit them; this machine's safety policy blocks `Remove-Item` and `mavis-trash`.
