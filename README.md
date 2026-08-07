# Project Amazon PH Academy — SimGrid

A multi-page webapp that consolidates six Amazon PPC training simulators under one
brand: **Project Amazon PH Academy**.

> Train the VAs who run Amazon PPC for a living.

Built from the eight chat-export JSONs in `../`. Each simulator was extracted from
its conversation, audited, and re-skinned under a unified design system so the
whole app looks like it was built from the ground up — not stitched together.

---

## How to run

It's plain static HTML. Open it three ways:

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
    ├── tokens.css       # Single source of truth (colors, fonts, spacing, shadows)
    ├── skin.css         # Aggressive overrides — forces every tool onto the unified theme
    ├── shell.css        # Top bar + footer chrome (the consistent frame)
    ├── shell.js         # Auto-injects chrome, builds nav, applies skin
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
4. `shell.css` adds the top bar + footer
5. `hub.css` styles the hub page
6. The result: same look on every page

---

## Design system

The unified theme is "**Amazon Pro**" — a clean, professional, Amazon-inspired
design language that mirrors the real Seller Central aesthetic, so VAs feel at
home.

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
