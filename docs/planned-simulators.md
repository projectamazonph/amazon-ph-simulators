# Planned Simulator Roadmap

Source reference: `projectamazonph/va-project-ph`, docs `36-simulators-platform.md` through `42-simulator-roadmap.md`.

This file copies the planned simulator set into SimGrid so the missing work can be built inside this project without losing the curriculum intent from VA Project PH.

## Platform contract copied from VA Project PH

Every future simulator should stay inside these rules:

- Use synthetic or explicitly approved training data only.
- Never accept live Amazon credentials.
- Never send simulator decisions to Amazon Ads or change a real budget, bid, listing, or campaign.
- Label results as practice/formative, not certification or hiring proof.
- Preserve scenario version and rubric version for attempts once persistence exists.
- Give feedback on the work, not the learner.

## Planned simulator inventory

| ID | Simulator | Current SimGrid Status | Build Priority | Integration Notes |
|---|---|---|---|---|
| S1 | Search-Term Report Lab | Covered by `search-triage.html` | Keep improving | Align copy with VA Project PH rule: no universal zero-order negative rule. |
| S2 | Bid Decisions | Missing standalone | P0 | Build a focused raise/hold/lower/investigate simulator using spend, clicks, sales, ACOS/ROAS, and confidence. |
| S3 | Budget and Pacing | Covered by `pacing-deck.html` | Keep improving | Keep budget pacing separate from profitability in feedback. |
| S4 | Campaign Builder / Console Wizard | Partial in `ad-console.html` | P1 | Add a guided SP/SB/SD planning wizard or adapt the existing setup flow with stronger rubric feedback. |
| S5 | Listing Audit | Partial in `listing.html` | P1 | Add explicit listing-readiness audit scoring before PPC pressure testing. |
| S7 | Bulk Operations | Covered by `bulk-file.html` | Keep improving | Preserve preview, affected-row counts, and rollback guidance. |
| S8 | Campaign Architect | Missing | P0 | Build campaign-map practice from a product brief: structure, targeting, negatives, naming, budgets, and first review plan. |
| S9 | Account Audit | Missing | P0 | Build synthetic account snapshot triage with impact/confidence ranking and next-step recommendations. |
| S10 | SQP Studio | Live in `sqp-studio.html` | Keep improving | Tests query visibility and conversion-signal analysis with a separated scoring core in `assets/sqp-studio-core.js`. |
| S11 | Client Onboarding | Missing | P1 | Build checklist practice for access boundaries, goals, product facts, constraints, cadence, approvals, and open questions. |
| S12-S14 | Capstone Sequence | Missing | P2 | Build after S2, S8, S9, and S10 are stable; requires teacher review rules. |

## Recommended build order

1. S2 Bid Decisions: isolates bid judgment from the larger Ad Console.
2. S8 Campaign Architect: turns research and bid logic into a campaign plan.
3. S9 Account Audit: teaches prioritization across a synthetic account snapshot.
4. S11 Client Onboarding: adds the VA workflow and communication layer.
5. S12-S14 Capstone: combines research, setup, optimization, reporting, and client communication.

## First shipped simulator: S10 SQP Studio

`sqp-studio.html` is the first planned simulator moved into the live SimGrid hub.

Implementation notes:

- The page is a self-contained static simulator that uses the shared `assets/shell.js` chrome.
- Scoring and SQP metric calculations live in `assets/sqp-studio-core.js` instead of inline page logic.
- The core module exports through CommonJS for Node tests and `window.SQPStudioCore` for the browser.
- Student progress is stored locally under `aph-sqp-studio-attempt`.
- The simulator focuses on evidence quality: visibility gap, conversion gap, data-confidence limit, and wasted exposure.

Regression coverage:

- `tests/sqp-studio-core.test.cjs` verifies SQP metrics, full-credit scoring, missed-evidence scoring, and deterministic feedback.
- `tests/hub-links.test.cjs` verifies the simulator is reachable from the main hub, the planned-simulators page, and the shared shell registry.

## Release checklist for each new simulator

- Learning objective ties to a real VA task.
- Synthetic data and formulas have an independent review.
- Pure scoring/calculation logic has Node test coverage where practical.
- Practice-data copy appears at start, decision, and result.
- Mobile layout has no horizontal scroll.
- Loading, empty, error, submitted, scored, and retry states are accounted for.
- Feedback includes evidence, risk, and next step.
- Existing live simulator routes still load after integration.
