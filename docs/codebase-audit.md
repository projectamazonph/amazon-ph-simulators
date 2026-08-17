# Amazon PH Simulators Codebase Audit

**Audit date:** 2026-08-18
**Scope:** UI, copy, simulator logic, state mutation, accessibility, and validation
**Repository:** `projectamazonph/amazon-ph-simulators`

## Executive summary

The project has a strong training concept and broad simulator coverage, but it currently has two execution-blocking JavaScript syntax errors and several places where displayed metrics do not match the underlying model. The most important next step is to establish a small validation gate before polishing the UI: parse every inline script, then test budget caps, state commits, and replayability with deterministic fixtures.

The review found no source changes were required to produce this report.

## Priority findings

### P0 — Ad Console inline script does not parse

**File:** `ad-console.html:1030`

The completion copy contains `You've` inside a single-quoted JavaScript string without escaping the apostrophe. The browser cannot parse the entire inline script, so the simulator's core interactions do not initialize.

**Fix direction:** escape the apostrophe or use a template literal. Add an automated inline-script parse check to CI so this cannot regress.

### P0 — Pacing Deck inline script does not parse

**File:** `pacing-deck.html:1007`

The string contains `you''ll`. JavaScript does not escape apostrophes by doubling them, so the Pacing Deck script also fails before initialization.

**Fix direction:** use valid escaping or template literals and cover inline scripts with the same parse check.

### P1 — Ad Console budget caps make search-term data inconsistent

**File:** `ad-console.html`, `attributeTerms()` and `simHour()`

`attributeTerms()` mutates search-term records immediately. When a campaign exceeds its remaining budget, `simHour()` scales the segment and campaign totals but does not roll back or scale the already-mutated search-term records.

This causes the campaign dashboard and search-term report to disagree exactly when a campaign hits its cap—the moment students are expected to learn about budget pacing.

**Fix direction:** calculate immutable result deltas first, apply the cap, then commit the final deltas to keyword, campaign, placement, and search-term state.

### P1 — BuyBox Dojo models a seven-day cap but describes a daily cap

**File:** `listing.html:1333-1337`, `listing.html:1369`, `listing.html:1393`

The simulation applies `campaign.budget * 7` as an aggregate cap and distributes the result across seven random days. The UI says the campaign “stopped showing mid-day,” but there is no day-by-day budget exhaustion logic.

**Fix direction:** either simulate each day with a remaining daily budget or change the copy to describe a seven-day allocation cap. Do not teach mid-day pacing from a weekly aggregate model.

### P1 — BuyBox cap scaling leaves CTR internally inconsistent

**File:** `listing.html:1333-1335`

When the cap is applied, clicks, spend, and orders are scaled, but impressions and row CTR are not. Total CTR is then recomputed from scaled clicks divided by unscaled impressions.

**Fix direction:** model eligible versus served impressions, or scale impressions and recompute all dependent metrics consistently.

### P1 — Bulk File validation commits rows with blocking errors

**File:** `bulk-file.html:823`, `848`, `862`, `877`, `902`, `917`, `932`, `956`, `973`

Create rows are inserted into simulated state even when the same row has validation errors. A malformed parent can therefore become available to later child rows, masking dependency and ordering mistakes.

**Fix direction:** build a candidate entity, collect row errors, and commit only when there are no blocking errors. Keep update/delete behavior transactional as well.

### P1 — Simulations are not reproducible

**Files:** `ad-console.html`, `listing.html`, and parts of `keyword-lab.html`

Core simulations use uncontrolled `Math.random()`. Re-running the same scenario can produce materially different results, which makes causal learning, grading, and bug reports difficult.

**Fix direction:** use a seeded PRNG keyed by scenario and run seed. Add a “replay same seed” mode and expose the seed in debug/export output.

### P1 — User-controlled values are inserted into dynamic HTML

**Files:** `ppc-coach.html:801-809`, `keyword-lab.html:1173`

PPC Coach renders user messages through `innerHTML`. Keyword Lab places a user-entered negative keyword inside an inline event-handler string. These paths can break markup or execute injected markup in the local app context.

**Fix direction:** render untrusted values with `textContent`, use DOM event listeners, and reserve HTML templates for trusted static content.

## UI and accessibility findings

- Ad Console icon-only controls use `data-tip` tooltips but lack reliable accessible names such as `aria-label`.
- Pacing Deck range inputs use visual labels rather than associated `<label>` elements or equivalent ARIA names.
- The Pacing Deck day-part grid is pointer-driven and lacks keyboard interaction.
- Bulk File instructional help depends on hover, which does not work consistently on touch or keyboard devices.
- Dynamic scores, feedback, and simulation results should use explicit `aria-live` regions where users need immediate status updates.
- Shared table overflow behavior targets `.table-scroll-wrap`, but pages use several different wrapper classes (`.twrap`, `.tblwrap`, `.tbl-wrap`, and Tailwind overflow utilities). Mobile affordances are therefore inconsistent.
- `assets/skin.css` relies heavily on substring selectors such as `[class*="card"]` and `[class*="ticker"]`, which increases the chance of unintended cross-page styling.

## Copy and product consistency findings

- The hub says Search Term Triage has “Five questions a round,” while the simulator supports 8, 12, or 16 terms.
- Keyword Lab displays inconsistent versions between the hub and the simulator.
- The course copy uses 70%, 80%, and 85% thresholds without clearly naming the difference between pass, distinction, and supervised-readiness targets.
- The student guide says “pass both quizzes” in multiple phases even though the course contains 12 module quizzes.
- “AI Coach” is presented as a product label, while the implementation is a deterministic keyword-rule matcher. The feature documentation correctly describes it as rule-based; the primary labels should match that reality.
- The marketplace selector is cosmetic. Its handler explicitly reports that the demo data remains on Amazon.com.
- The hub claims the simulator has the “same layout, same controls, same copy” as Seller Central. This should be reframed as a training approximation to avoid overpromising fidelity.
- Tool numbering and suite labels are duplicated across pages and have already drifted (`TOOL 05` through `TOOL 09`, `SIMULATOR 06`, and hub labels).

## Simulation and domain-model findings

- Pacing Deck describes second-price bidding, but the model uses a market-CPC approximation without competitor bids. The copy should call this an approximation or the model should expose competing bids.
- Keyword Lab intentionally gives each keyword its own full daily budget, but aggregate charts use a budget reference that can be interpreted as a portfolio-level budget. The UI should make the per-keyword scope visually explicit.
- Pacing Deck uses `US STANDARD` profiles and fixed US-style assumptions while the project branding is Amazon PH. Marketplace, timezone, and scenario geography should be explicit.
- BuyBox Dojo hardcodes “In Stock,” “Ships from Amazon.com,” and “Sold by brand,” so its Buy Box drills are not connected to editable inventory or Buy Box state.
- Pacing Deck reports fractional sales from expected-value calculations. Labeling these as “expected conversions” would be more precise than presenting them as actual orders.

## Validation performed

- Parsed all HTML inline scripts with Node's `vm.Script`.
- Confirmed failures in `ad-console.html` and `pacing-deck.html`.
- Confirmed other inline scripts parse successfully.
- Ran `node --check` on shared and desktop JavaScript files successfully.
- Ran `git diff --check` successfully.
- Confirmed there is no configured test script in `package.json`; available scripts are packaging/start commands only.

## Recommended implementation order

1. Fix both syntax errors and add an inline-script parsing gate.
2. Correct budget-cap accounting and align BuyBox cap behavior with its copy.
3. Make Bulk File validation transactional and calendar-date validation strict.
4. Add seeded simulation runs and replayable fixtures.
5. Remove unsafe dynamic HTML and normalize accessible controls.
6. Create a shared content manifest for tool names, versions, counts, thresholds, and labels.
7. Extract pure simulator kernels and shared UI primitives incrementally; avoid a large rewrite until the behavioral contracts are covered.
