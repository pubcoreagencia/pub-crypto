# PUB Crypto AI — Data + Backtest Engine V0

## Purpose
Provide deterministic, provenance-aware market data and a first historical validation engine without any live exchange dependency.

## Data contract
Every market snapshot carries symbol, timestamp, source, snapshot ID and candle history. Dataset and strategy versions are mandatory inputs to backtests.

## V0 backtest
The engine is intentionally minimal: deterministic candle iteration, explicit strategy version, dataset version, fee model, trade ledger and max drawdown.

This is a validation foundation, not evidence of profitability. V0 does not claim Sharpe, alpha, walk-forward validity or live readiness.

## Safety
No exchange credentials, live orders, broker calls or capital movement are permitted in this stage.
