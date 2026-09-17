# Walk-Forward / Out-of-Sample Validation V0

## Purpose

Add a deterministic validation layer that evaluates strategy behavior on data that occurs strictly after the training window.

This stage is a validation mechanism, not evidence of durable profitability or live readiness.

## Contract

For each window:

`TRAIN -> TEST(OOS)`

The strategy factory receives only the training candles. The resulting strategy is then evaluated only on the subsequent test candles.

Default windowing uses:

- `trainSize`: number of candles available for strategy creation;
- `testSize`: number of out-of-sample candles;
- `step`: distance between window starts, defaulting to `testSize`;
- `strategyVersion`;
- `datasetVersionPrefix`.

With `step = testSize`, OOS test windows do not overlap.

## Leakage controls

The implementation enforces structural separation:

1. `trainEnd === testStart`.
2. The strategy factory receives a copy of only the training slice.
3. `runBacktest` receives only the test slice.
4. Each OOS slice receives a distinct dataset version.
5. Test windows are evaluated sequentially and their ending equity becomes the next window's starting equity.

No future test candles are passed to strategy creation.

## OOS interpretation

Every test segment is out-of-sample relative to its immediately preceding training segment.

This does not by itself establish statistical significance, robustness across regimes, or durable alpha. Those require additional validation layers and appropriate statistical controls.

## Known boundary behavior

The current backtest engine does not carry open positions between slices. An open position that has not exited before a test slice ends is not force-closed or transferred into the next slice. This boundary behavior must be addressed before using the engine for production-grade validation.

## Current scope

Included:

- deterministic window generation;
- train/test isolation;
- sequential OOS evaluation;
- compounded test equity;
- dataset and strategy versioning;
- validation tests.

Not included:

- hyperparameter optimization;
- regime classification;
- Monte Carlo;
- statistical significance testing;
- multiple-testing correction;
- transaction-cost calibration from real venues;
- paper/live execution.

## Next gates

1. regime analysis;
2. Monte Carlo / resampling;
3. shadow validation;
4. PUB Neural persistence of validation artifacts;
5. governance gates before paper/live.
