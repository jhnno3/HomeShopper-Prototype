# Idea: Deterministic concern rules (not implemented)

This is a reference doc, not an implementation plan. It captures an idea
raised while removing `ConcernsList` (see
[2026-07-18-report-page-cleanup-design.md](2026-07-18-report-page-cleanup-design.md))
so a rule-based version can be picked up later without re-deriving it.

## Why not LLM-based

The original `ConcernsList` copy in `mock-data.ts` was hand-written per
fixture — it reads like judgment, but nothing computed it. Standing that up
for real would normally suggest an LLM, but several of the concerns worth
surfacing don't need one: they're threshold checks on data the report
already has.

## Candidate rules

Each rule is a plain boolean/threshold check against fields already on
`Report` / `RegistryFacts`, producing one fixed message — no model call, no
free-form generation.

1. **Deposit below market** — `deposit` sits more than a fixed percentage
   below `facts.recentTransactions.priceRangeLow`.
   Inputs: `Report.deposit`, `facts.recentTransactions`.
2. **Violation on record** — `facts.buildingRegistry.hasViolation === true`.
   Inputs: `facts.buildingRegistry`.
3. **Agency unverifiable** — `facts.agencyValidity === null` or
   `!facts.agencyValidity.isValid`.
   Inputs: `facts.agencyValidity`.
4. **High lien ratio** (premium only) — `(registryFacts.maxClaimAmount +
   deposit) / marketPrice` crosses a fixed threshold (e.g. 80%).
   Inputs: `registryFacts.maxClaimAmount`, `Report.deposit`, a market price
   figure (would need to derive from `facts.recentTransactions` — exact
   basis TBD when this is built).
5. **Owner mismatch** (premium only) —
   `registryFacts.ownerMatchesLandlord === false`.
   Inputs: `registryFacts.ownerMatchesLandlord`.

## Open questions for whenever this is built

- What counts as "market price" for rule 4 — midpoint of the transaction
  range, low end, something else?
- Should rules 1–3 run for every report, or only `basic` tier (rules 4–5 are
  inherently premium-only since they need `registryFacts`)?
- Where do the threshold constants live — hardcoded, or a config file so
  product can tune them without a code review?
