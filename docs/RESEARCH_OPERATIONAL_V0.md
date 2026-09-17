# Research Operational V0

## Purpose

Transform PUB Crypto research from a fixture-only concept into a deterministic, provenance-aware research artifact pipeline.

## Dataset contract

Every normalized dataset records dataset version, source, symbol, timeframe, first and last timestamps, observation timestamp, candle count, and a deterministic content hash.

The dataset is sorted by timestamp and rejects duplicate timestamps, invalid OHLC relationships, negative volume, and empty datasets.

## Research artifact

Operational research records:

researchRunId → snapshotId → evidence → contradictions → uncertainty → thesis → strategyVersion

The artifact also retains complete dataset provenance and generation timestamp.

## V0 methodology

The deterministic provider currently computes descriptive close-to-close evidence:

- observed price return;
- close-to-close population volatility;
- directional trend classification.

This is descriptive research, not a predictive model and not evidence of profitability.

## Governance

No LLM, exchange credential, broker credential, or live order is required.

No strategy becomes paper/live eligible from this stage alone.

Future stages add:

1. real market-data adapters;
2. source-specific provenance;
3. walk-forward and out-of-sample validation;
4. richer risk-adjusted metrics;
5. regime analysis and Monte Carlo;
6. PUB Neural persistence and lesson extraction.
