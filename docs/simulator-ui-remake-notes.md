# Simulator UI remake notes

**Branch:** `redesign/distinct-simulator-layouts`
**Baseline:** 86 passing tests on `master` at `7dda6cb`

## Delivered layout genomes

| Simulator | Layout genome | Primary view mechanic |
|---|---|---|
| Bid Decisions | Decision cockpit | One keyword, instrument readouts, evidence meter, separated action controls |
| Campaign Architect | Blueprint canvas | Persistent hierarchy, selectable nodes, block palette, negatives tray, rule inspector |
| Account Audit | Diagnostic sweep | Inspectable zones, five finding buckets, accumulating clipboard |
| SQP Studio | Signal lab | Query queue, three signal meters, evidence stance, classification bench |
| Client Onboarding | Intake interview | Sequential confirmation, six-topic spine, filling client brief |
| Capstone Sequence | Journey map | Five-stage route, gated decisions, carried artifact chain |

The views consume current scenario/core data and keep all existing grading exports,
scenario selectors, versioned attempt records, and student-progress events intact.
The Client Onboarding and Capstone cores currently expose four scored rows. Their
views show the requested six-topic/five-stage operating model, while the extra
reporting/communication nodes remain presentational until scenario expansion adds
versioned scored content.

## Explicitly out of scope

These pre-existing engine or product-copy issues were intentionally recorded rather
than changed during the UI pass:

- Search Term Triage hub copy says five questions, while the tool supports 8/12/16.
- Pacing Deck uses the `US STANDARD` demand profile; localization needs product review.
- Ad Console can desynchronize capped campaign totals and search-term attribution.
- BuyBox Dojo hardcodes Amazon.com fulfillment/stock copy and describes a seven-day cap as daily.
- Bulk File validation can commit rows that have blocking validation errors.
- Keyword Lab shows a `v1.0` badge while the hub lists `v2.2`.

## Verification requirements

- `node --test tests/*.test.cjs`
- Parse every external and inline JavaScript block.
- Resolve every local static asset reference.
- Check each simulator at desktop and approximately 380px.
- Walk all controls by keyboard and confirm live-result announcements.
