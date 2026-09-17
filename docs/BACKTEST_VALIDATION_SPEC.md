# PUB Crypto AI — Backtest & Validation V0

## Validation ladder
`UNIT → HISTORICAL BACKTEST → WALK-FORWARD → OUT-OF-SAMPLE → MONTE CARLO → REGIME ANALYSIS → SHADOW`

A strategy is not considered validated from a single backtest.

## Required metrics
- return and volatility;
- Sharpe/Sortino where statistically appropriate;
- maximum drawdown and recovery;
- trade count and holding period;
- win/loss distribution;
- turnover and estimated costs;
- slippage sensitivity;
- beta/market dependence where applicable;
- regime-specific behavior;
- Monte Carlo distribution of outcomes.

## Anti-overfitting requirements
- preserve train/test separation;
- avoid future leakage;
- record dataset version and timestamp;
- record strategy code/config version;
- test parameter sensitivity;
- prefer walk-forward evidence over one optimized window;
- report failure cases, not only aggregate returns.

## Promotion
`CANDIDATE → BACKTESTED → WALK_FORWARD_VALIDATED → SHADOW_VALIDATED → PAPER_APPROVED → LIVE_APPROVED`

Promotion is a governance event and must be recorded in PUB Neural. No promotion is automatic solely because a metric exceeds a threshold.
