# Regime Analysis + Monte Carlo V0

## Purpose

This stage adds two deterministic validation layers:

1. classify historical market windows into descriptive regimes;
2. resample observed trade returns to examine the distribution of possible final equity paths.

Neither layer is evidence of durable alpha or live readiness.

## Regime analysis

Supported labels:

- `UPTREND`
- `DOWNTREND`
- `RANGE`
- `HIGH_VOLATILITY`
- `LOW_VOLATILITY`

Classification uses only the candles inside each historical window.

Inputs include:

- window size;
- step;
- trend threshold;
- high-volatility threshold;
- dataset version;
- symbol;
- timeframe.

The default step equals window size, producing non-overlapping descriptive windows.

## Monte Carlo

The current implementation performs seeded bootstrap resampling with replacement over observed trade returns.

For each simulation:

`equity[t+1] = equity[t] × (1 + sampledReturn[t])`

Outputs include:

- simulation count;
- sample size;
- seed;
- mean final equity;
- 5th, 50th and 95th percentiles;
- worst and best simulated final equity.

A fixed seed makes the result reproducible for audit and testing.

## Interpretation limits

Monte Carlo here is a resampling diagnostic, not a proof of future performance.

It assumes the observed return sample is an adequate basis for the resampling exercise. It does not model every dependency, regime transition, liquidity constraint, market impact, execution failure, or structural break.

Regime classification is descriptive and threshold-based. It is not a predictive regime model.

## Current gates

Included:

- deterministic regime windows;
- seeded Monte Carlo;
- reproducible tests;
- explicit validation limits.

Not included:

- regime-conditioned strategy attribution;
- block/bootstrap methods for serial dependence;
- parameter uncertainty;
- multiple-testing correction;
- realistic exchange microstructure;
- live execution.

## Next gate

Connect backtest / walk-forward outputs to regime-conditioned attribution and shadow validation, then persist governed validation artifacts into PUB Neural before paper/live authorization.
