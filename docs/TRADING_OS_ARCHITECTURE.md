# PUB Crypto AI — Trading OS Architecture V0

**Status:** ARCHITECTURE BASELINE
**Scope:** autonomous crypto swing-trading runtime
**Source of truth:** Git + PUB Neural

## 1. Mission
PUB Crypto is the operational trading runtime of PUB Core Holding. It observes markets, researches hypotheses, creates and validates trade theses, applies risk policy, executes only through governed gates, and records every decision and outcome for learning in PUB Neural.

## 2. System boundary
- **PUB Crypto:** market ingestion, research orchestration, strategy/signal generation, portfolio/risk, validation, execution, post-trade attribution.
- **PUB Neural:** durable memory, evidence, decisions, lessons, patterns, governance knowledge and institutionalization.
- **PDL/ACP:** engineering/runtime orchestration. They are not allowed to silently become the financial decision maker.

## 3. Closed loop
`OBSERVE → RESEARCH → SYNTHESIZE → RISK → DECIDE → VALIDATE → EXECUTE → ATTRIBUTE → LEARN → INSTITUTIONALIZE`

## 4. Core planes
1. **Observation Plane:** exchange data, OHLCV, order books where available, funding, open interest, news and macro/context data.
2. **Research Plane:** quant, technical, macro, sentiment and adversarial agents. Every material numeric claim must have provenance and timestamp.
3. **Decision Plane:** thesis, expected value, invalidation, horizon, confidence, evidence set and alternatives.
4. **Risk Plane:** exposure, concentration, correlation, liquidity, drawdown, leverage, position sizing and portfolio-level limits.
5. **Validation Plane:** backtest, walk-forward, out-of-sample, Monte Carlo, regime analysis and shadow account.
6. **Execution Plane:** paper/live profiles, pre-trade checks, mandate, idempotency, kill switch and broker/exchange adapter.
7. **Learning Plane:** trade journal, attribution, postmortem and promotion of validated lessons to PUB Neural.

## 5. Non-negotiables
- No live order without an explicit decision record.
- No decision without timestamped evidence.
- No strategy promotion based only on backtest performance.
- No live strategy without paper/shadow validation and risk approval.
- Every order must be attributable to a strategy, thesis, decision and risk check.
- Kill switch must be available independently of the LLM.
- LLMs propose and synthesize; deterministic controls enforce limits.
- Secrets never enter prompts, logs, Neural memory or Git.

## 6. Initial maturity path
`DESIGN → DATA → RESEARCH → BACKTEST → SHADOW → PAPER → GOVERNED LIVE`

Live trading is a later gate, not a default capability of the first implementation.
