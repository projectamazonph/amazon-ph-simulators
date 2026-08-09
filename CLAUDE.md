# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Project Amazon PH Academy — SimGrid**: a multi-page static webapp that consolidates six
Amazon PPC training simulators under one brand. Each tool teaches/tests a different Amazon
Seller Central / Ads workflow (ad console, keyword research, search-term triage, bulk file
upload, listing optimization, budget pacing). It's plain HTML/CSS/JS — no framework, no
build step, no package manager, no backend.

## Running the site

No build/install step. Serve the repo root as static files:

```bash
python -m http.server 8080
# then open http://localhost:8080/
```

Opening the HTML files directly (`file://`) also works, but serving is recommended for
full font/asset fidelity. Deployment is automatic: `.github/workflows/deploy.yml` pushes
the repo root straight to GitHub Pages on every push to `master` — there is nothing to
compile, bundle, or transpile before deploying.

There is no test suite, linter, or formatter configured in this repo. Verify changes by
opening the affected page(s) in a browser and exercising the UI.

## Architecture

```
index.html           # Hub ("SimGrid") — tool grid, mission panel, principles
ad-console.html      # Tool: AdConsole Pro
keyword-lab.html     # Tool: Keyword Lab
search-triage.html   # Tool: Search Term Triage
bulk-file.html       # Tool: Bulk File Simulator
listing.html         # Tool: BuyBox Dojo
pacing-deck.html     # Tool: Pacing Deck
assets/
  tokens.css         # Design-token single source of truth (CSS custom properties)
  skin.css            # Aggressive override layer — forces every tool onto the unified theme
  shell.css           # Top bar + footer chrome
  shell.js            # Injects chrome, builds nav, applies the skin
  hub.css              # Hub-page-only layout
```

Each tool page is a **self-contained single-file app**: its own `<style>` block and its own
`<script>` block at the bottom, originally extracted from a standalone chat-export prototype
and then wired into this shell. Fonts and any third-party libraries (Chart.js in
`ad-console.html`, SheetJS in `bulk-file.html`) are loaded per-page via CDN `<link>`/`<script>`
tags in that page's own `<head>` — there's no shared bundling, so a library used by one tool
is not available to the others unless you add it there too.

### How the unification (shell + skin) works

This is the one piece of cross-cutting architecture that spans every file — read this before
touching chrome, nav, or theming on any tool page:

1. Every tool page links `assets/shell.css` and `assets/shell.js` (with `defer`) near the end
   of `<head>`/start of `<body>`, *after* its own CSS/fonts.
2. On load, `shell.js`:
   - injects `assets/tokens.css` and `assets/skin.css` into `<head>` if not already present,
   - adds the `pha-skin` class to `<body>` (skipped on the hub, which has its own styling),
   - auto-injects the `.pha-topbar` and `.pha-footer` chrome if the page doesn't already have
     them, built from a hard-coded `TOOLS` registry at the top of `shell.js`,
   - wraps the tool's own body content in a `.pha-skin-wrap` div,
   - builds/marks the nav links across tools.
3. `skin.css` loads after the tool's native CSS and overrides colors/fonts/borders/spacing on
   common component patterns (buttons, cards, tables, inputs, chips) — but deliberately
   preserves the tool's own layout (`display`, `position`, sizing, grid/flex templates). The
   tool's JS and DOM structure are never touched, only re-skinned visually.
4. A page identifies itself via `data-pha-tool="<id>"` on `<body>` (e.g.
   `data-pha-tool="bulk-file"`); `shell.js` falls back to matching on filename if that
   attribute is absent.

**Adding a new tool page**: drop a new HTML file with `data-pha-tool="your-id"` on `<body>`,
link `assets/shell.css` and `assets/shell.js`, and add an entry to the `TOOLS` array in
`assets/shell.js` (id, name, tag, file). The shared chrome and skin pick it up automatically.
There is also a runtime registration seam, `window.APHSimHub.register(manifest)`, mentioned
in the hub's brand docs for dynamically-added simulators.

### Design system ("Amazon Pro")

All colors, spacing, and type live in `assets/tokens.css` as CSS custom properties
(`--c-navy-2`, `--c-orange`, `--c-bg`, `--c-ink`, `--sp-1`…`--sp-16`, etc.) — treat this as the
single source of truth and prefer adding/reusing a token over hard-coding a color or spacing
value, especially in `skin.css` or `shell.css`. Typography: **Archivo** (display), **PT Sans**
(body), **IBM Plex Mono** (technical/mono), **Barlow Condensed** (tight UI labels) — individual
tool pages may load additional fonts for their own native styling, which `skin.css` then
partially overrides.

### Brand/content conventions

- Parent brand: "Project Amazon PH Academy"; hub name: "SimGrid".
- Tone: confident, training-focused, operator vocabulary (campaigns, ad groups, match types,
  day-parting, ACoS, TACoS, search-term harvest). No demo/placeholder-feeling data, no
  participation-trophy UX.
- Source provenance: each tool originated from a distinct chat-export JSON conversation
  (listed in README.md) and was individually audited/re-skinned — this explains why each tool
  has different internal CSS/JS conventions before the shell/skin layer unifies them visually.
