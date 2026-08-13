# Project Amazon PH Academy

Multi-tool training grid for VAs who run Amazon PPC. Six hands-on simulators sharing a unified design system (tokens + skin + shell + responsive).

## PR #7 — Nav rail

Tool pages now get a slim 56px-wide sticky-left icon rail that lets users jump between simulators. Auto-injected by `shell.js` (`ensureRail()`), styled by `responsive.css` (NAV RAIL block).

### Behavior
- Visible only on tool pages (`body[data-pha-tool]`)
- Hidden below 1024px (topbar pill nav + hamburger drawer take over)
- Hidden on the hub page
- Active tool gets an orange left border (matches PR #6 tool-card style)
- Native `title` attribute provides tooltip; `aria-label` for screen readers
- Respect `prefers-reduced-motion` and print media

### Files touched
- `assets/responsive.css` — NAV RAIL block + desktop shell-wrap flex row
- `assets/shell.js` — `ensureRail()` + `markActive()` extension + init wiring
- This README section

### Tool registry (single source of truth)
Both the topbar nav and the rail are generated from the `TOOLS` array at the top of `shell.js`. Adding a new tool = adding one entry there + one `data-pha-tool` page.

## See also
- PR #6 — Hub visual hierarchy
- PR #5 — Hamburger polish
- PR #3 — Mobile-first responsive layer
