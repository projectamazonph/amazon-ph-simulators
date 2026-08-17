# Project Amazon PH Academy — SimGrid

A multi-page webapp that consolidates six Amazon PPC training simulators under one
brand: **Project Amazon PH Academy**.

> Train the VAs who run Amazon PPC for a living.

Built from the eight chat-export JSONs in `../`. Each simulator was extracted from
its conversation, audited, and re-skinned under a unified design system so the
whole app looks like it was built from the ground up — not stitched together.

---

## How to run

The project is a plain static webapp and also ships as a Windows desktop app.

### Windows installer

Download `SimGrid-Setup-<version>.exe` from the GitHub Actions artifact or a
published release and run it. The installer is per-user, creates a Start Menu
entry and desktop shortcut, and does not require administrator access by default.

### Run from source

Open the static site three ways:

```powershell
# 1. Just double-click
explorer "D:\Web Project\Simulators\webapp\index.html"

# 2. Or via PowerShell
Start-Process "D:\Web Project\Simulators\webapp\index.html"

# 3. Or serve it (recommended for full font fidelity)
cd "D:\Web Project\Simulators\webapp"
python -m http.server 8080
# then open http://localhost:8080/
```

No build step. No dependencies. No backend. Everything is in the page.

### Build the desktop app

Install Node.js 20 or newer, then run these commands from the repository root:

```powershell
npm install
npm run start       # launch the desktop wrapper
npm run dist:win   # create release\SimGrid-Setup-<version>.exe
```

The wrapper loads the same local HTML, CSS, JavaScript, and learning materials as
the browser version. Student progress continues to use the browser's local storage,
now scoped to the installed SimGrid app. The pages still use their existing CDN
font, chart, spreadsheet, and image references when those features are available.

---

## Pages

| # | Page | File | What it does |
|---|------|------|--------------|
| — | **Hub** | `index.html` | Control grid — links to all six tools, mission panel, principles |
| 1 | **AdConsole Pro** | `ad-console.html` | Amazon Sponsored Ads console replica — campaigns, ad groups, keywords, search terms, hour-by-hour auction simulation |
| 2 | **Keyword Lab** | `keyword-lab.html` | Keyword research training: playbooks, practice drills, search-term audits, 12-question certification exam |
| 3 | **Search Term Triage** | `search-triage.html` | Five-question triage rounds; read the report, decide the action, defend it. OPSDECK Practice Suite · Tool 07 |
| 4 | **Bulk File Simulator** | `bulk-file.html` | Upload bulk sheets, get graded like a real Amazon bulk upload |
| 5 | **BuyBox Dojo** | `listing.html` | Listing optimizer + 7-day PPC pressure test + VA Playbook |
| 6 | **Pacing Deck** | `pacing-deck.html` | Budget & day-parting simulator with 24-hour flight log |

---

## Architecture

```
webapp/
├── index.html           # Hub (Amazon Pro theme)
├── ad-console.html      # Tool — re-skinned via skin.css
├── keyword-lab.html     # Tool — re-skinned via skin.css
├── search-triage.html   # Tool — re-skinned via skin.css
├── bulk-file.html       # Tool — re-skinned via skin.css
├── listing.html         # Tool — re-skinned via skin.css
├── pacing-deck.html     # Tool — re-skinned via skin.css
└── assets/
    ├── tokens.css       # Single source of truth (colors, fonts, spacing, shadows, breakpoints, fluid type, touch targets)
    ├── skin.css         # Aggressive overrides — forces every tool onto the unified theme
    ├── responsive.css   # Mobile-first layer (auto-injected by shell.js) — hamburger nav, fluid type, 44px touch targets, .stack-mobile + .table-scroll utilities, print + reduced-motion
    ├── shell.css        # Top bar + footer chrome (the consistent frame)
    ├── shell.js         # Auto-injects chrome + responsive layer, builds nav, wires hamburger + scrim, applies skin
    ├── hub.css          # Hub-page-specific layout (hero, tool grid, principles)
    └── (the tool HTMLs keep their original CSS, but the skin overrides win)
```

### How the unification works

Each tool page's body class is set to `pha-skin` (auto-applied by `shell.js`).
Inside `assets/skin.css`, every tool-internal element is overridden onto the
unified design tokens. The tool's **JS still works** (we don't touch it),
but its **visual surface** is forced to use the same colors, fonts, spacing,
and component styles as every other page.

The flow:

1. `tokens.css` defines the design system (CSS custom properties)
2. The tool's original CSS loads (defines its own dark/colorful styles)
3. `skin.css` loads last and overrides the tool's colors, fonts, surfaces
4. `responsive.css` loads after skin and applies the mobile-first layer
5. `shell.css` adds the top bar + footer
6. `hub.css` styles the hub page
7. The result: same look on every page, responsive across all sizes

---

## Design system

The unified theme is "**Amazon Pro**" — a clean, professional, Amazon-inspired
design language that mirrors the real Seller Central aesthetic, so VAs feel at
home.

### Responsive breakpoints (new in v1.1)

| Token        | Value  | Use |
|--------------|--------|-----|
| `--bp-sm`    | 480px  | small phones → large phones |
| `--bp-md`    | 768px  | tablet portrait threshold |
| `--bp-lg`    | 1024px | tablet landscape / small desktop |
| `--bp-xl`    | 1280px | wide desktop |
| `--tap`      | 44px   | WCAG 2.5.5 / Apple HIG min touch target |
| `--nav-h`    | 56px   | shared with topbar height |

### Fluid typography

| Token      | Formula                                | Use |
|------------|----------------------------------------|-----|
| `--fs-body`| `clamp(0.875rem, 0.8rem + 0.4vw, 1rem)` | body text |
| `--fs-h1`  | `clamp(1.75rem, 1.2rem + 2.6vw, 2.5rem)`| h1 |
| `--fs-h2`  | `clamp(1.25rem, 1rem + 1.2vw, 1.5rem)` | h2 |
| `--fs-h3`  | `clamp(1.0625rem, 0.95rem + 0.6vw, 1.25rem)` | h3 |

### Breakpoint behaviour

**Mobile (< 768px):**
- All sections stack vertically (1 column for `.pha-tools`, `.pha-principles`, `.pha-hero`)
- Navigation collapses into a hamburger drawer with scrim, ESC-to-close, focus-trap
- Touch targets enforced at 44px min on buttons, inputs, nav links
- Footer stacks vertically; meta line gets full width

**Tablet (768px – 1023.98px):**
- 2-column grid for tools and principles
- Hero stays 2-column (main + side)
- Nav becomes a horizontal scroll (no hamburger)

**Desktop (≥ 1024px):**
- Original layout preserved (3-column tool grid, 4-column principles)

### Utilities (new in v1.1)

- **`.stack-mobile`** — wrap any block to force 1-col layout at `<768px` regardless of its native grid/flex template.
- **`.table-scroll`** — wrap any wide table to get horizontal scroll on mobile instead of overflowing the page. Pair with **`.table-scroll-wrap`** to show a fade hint when content overflows (auto-detected via JS).

### Color tokens

| Token | Value | Use |
|-------|-------|-----|
| `--c-navy-2` | `#131921` | Brand primary, PHA top bar |
| `--c-orange` | `#FF9900` | Accent, primary buttons, highlights |
| `--c-bg` | `#F7F8FA` | Page background |
| `--c-card` | `#FFFFFF` | Card / panel surface |
| `--c-ink` | `#0F1111` | Primary text |
| `--c-sub` | `#565959` | Secondary text |
| `--c-faint` | `#767B7B` | Tertiary text |
| `--c-link` | `#007185` | Amazon link blue |
| `--c-green` | `#067D62` | Success / positive delta |
| `--c-amber` | `#C45500` | Warning / coach tip |
| `--c-red` | `#B12704` | Error / negative delta |

### Typography

- **Display**: `Archivo` (400/500/600/700/800) — sharp, modern, professional
- **Body**: `PT Sans` (400/700) — humanist, legible
- **Mono**: `IBM Plex Mono` (400/500/600) — technical, ops-deck feel
- **Condensed**: `Barlow Condensed` (500/600/700) — for tight UI labels

### Spacing

4px base. Use `--sp-1` (4) through `--sp-16` (64).

### Component patterns

- **Buttons**: rounded 6px, `btn-primary` (orange), `btn-ghost` (link), `btn-danger` (red)
- **Cards**: 8px radius, 1px border, soft shadow
- **Tables**: striped header, hover orange-soft
- **Inputs**: rounded 6px, focus ring orange
- **Chips**: pill, semantic colors (ok/warn/err)
- **Sidebar nav**: light surface, hover bg-2, active orange-soft with orange left bar

---

## Brand voice

- **Parent brand**: Project Amazon PH Academy
- **Hub name**: SimGrid (manifest-driven, can register new simulators via
  `window.APHSimHub.register()`)
- **Tagline**: "Train the VAs who run Amazon PPC for a living."
- **Tone**: Confident, training-focused, slightly tactical. Operator vocabulary
  (campaigns, ad groups, match types, day-parting, ACoS, TACoS, search-term
  harvest). No demo data. No participation trophies.

---

## Source

Every tool was extracted from one of these conversations in `../`:

| Conversation | Tool extracted |
|--------------|----------------|
| `chat-export-1786082534142.json` & `…5835.json` | Keyword Lab (branch + main) |
| `chat-export-1786082577736.json` | (SimGrid hub design) |
| `chat-export-1786082600081.json` | Bulk File Simulator |
| `chat-export-1786082615619.json` | BuyBox Dojo |
| `chat-export-1786082624608.json` | Search Term Triage |
| `chat-export-1786082634879.json` | AdConsole Pro |
| `chat-export-1786082566954.json` | (insights → Pacing Deck) |

Working artifacts:

- `../_extracted/` — every HTML block pulled from the JSONs (36 files)
- `../_audit/` — internal notes (not user-facing)

---

## How a new tool gets added

Two options:

1. **Drop a new HTML file in `webapp/`** with `data-pha-tool="your-id"` on
   `<body>`, link `assets/shell.css` and `assets/shell.js`, and add an entry to
   the `TOOLS` array in `assets/shell.js`. The chrome + skin will pick it up.
2. **Register dynamically** from the hub via the SimGrid manifest API
   (`window.APHSimHub.register(manifest)`) — same seam, just runtime.
