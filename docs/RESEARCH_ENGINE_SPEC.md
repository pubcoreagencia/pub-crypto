# PUB Crypto AI — Research Engine V0

## Objective
Turn market information into auditable hypotheses rather than unsupported trade calls.

## Research pipeline
`FETCH → NORMALIZE → TIME-ALIGN → PROVENANCE → ANALYZE → CROSS-CHECK → SYNTHESIZE`

## Evidence classes
- market/price;
- derivatives/funding/open interest;
- on-chain where available;
- news and sentiment;
- macro/context;
- strategy-specific historical evidence.

Every material metric must carry source, timestamp/as-of time, symbol/market scope and transformation metadata.

## Research artifacts
A research run produces:
- research_run_id;
- hypothesis;
- evidence set;
- contradictory evidence;
- assumptions;
- uncertainty;
- candidate strategy/parameters;
- validation request.

## Grounding rule
The system must not invent missing market values, fill data gaps from model memory, or silently mix timeframes. Missing data becomes an explicit uncertainty.

## PUB Neural integration
Research runs should be persisted as evidence and linked to decisions. Reusable patterns may become Neural `PATTERN`, `LESSON` or `SKILL` candidates only after validation.
