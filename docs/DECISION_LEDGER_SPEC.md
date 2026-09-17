# PUB Crypto AI — Decision Ledger V0

Every material trading decision is an immutable audit object.

## Decision schema
- `decision_id`
- `created_at`
- `market_snapshot_id`
- `research_run_id`
- `strategy_id` + version
- thesis
- supporting evidence IDs
- contradictory evidence IDs
- expected horizon
- entry/exit/invalidation conditions
- proposed side and size
- risk result
- validation result
- final state
- execution/order IDs
- outcome and attribution IDs

## State machine
`PROPOSED → RISK_REVIEW → VALIDATED → APPROVED → EXECUTED → CLOSED → ATTRIBUTED`

Alternative terminal states include `REJECTED`, `EXPIRED`, `CANCELLED` and `HALTED`.

## Audit rule
No mutable narrative may overwrite the original decision. Corrections are appended as new events referencing the prior decision.

## Learning link
Closed decisions generate outcome data. Repeated outcome patterns may become PUB Neural lesson/pattern candidates after validation.
