# Shadow Validation + PUB Neural Artifact V0

## Purpose

Connect deterministic validation outputs to a governed shadow-validation artifact suitable for PUB Neural ingestion.

The runtime still has no live exchange credentials and no real-capital execution.

## Shadow validation

`runShadowValidation` combines:

- observed backtest trades;
- historical regime windows;
- regime-conditioned attribution;
- seeded Monte Carlo when at least two trades exist;
- explicit sample-size status.

The current validation status is:

- `SHADOW_VALIDATED`: at least 10 observed trades;
- `SHADOW_INSUFFICIENT_SAMPLE`: fewer than 10 trades.

The threshold is a governance guard, not a statistical proof of strategy quality.

## Regime attribution

Each trade is assigned to the historical regime containing its entry timestamp.

The artifact records:

- regime;
- trade count;
- PnL;
- win rate;
- average trade PnL.

Trades outside known regime windows are not silently assigned.

## PUB Neural boundary

`toNeuralValidationArtifact` creates a versioned, provenance-bearing payload with:

- artifact type/version;
- strategy version;
- dataset version;
- observation timestamp;
- validation status;
- total return;
- trade count;
- regime attribution;
- Monte Carlo summary;
- source = `PUB_CRYPTO`.

This is an **adapter contract**, not a claim that a PUB Neural database write has occurred.

The next integration step must connect this artifact to the governed PUB Neural ingestion path and preserve its source/version/timestamp lineage.

## Safety

No artifact grants paper/live authorization.

Promotion remains a separate governance event and requires the validation evidence plus the risk, execution and strategy governance gates.
