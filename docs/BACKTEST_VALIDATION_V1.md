# Backtest Validation V1

## Scope

V1 extends the deterministic backtest foundation with explicit trading costs and descriptive risk metrics.

## Costs

Each trade records gross PnL, fees, slippage cost, net PnL, trade return, and turnover.

Costs are configurable in basis points and are never silently omitted when supplied.

## Metrics

The result exposes total return, maximum drawdown, trade count, winners and losers, win rate, gross profit/loss, profit factor, average trade PnL, expectancy, trade-return volatility, Sharpe ratio when enough non-zero observations exist, and turnover.

The engine returns null for Sharpe or profit factor when the sample is insufficient to support that statistic. This avoids manufacturing statistical confidence from tiny samples.

## Governance

These metrics are descriptive validation outputs. They do not constitute evidence of durable alpha or live readiness.

Next validation stages:

1. walk-forward partitions;
2. out-of-sample evaluation;
3. regime-aware metrics;
4. Monte Carlo perturbation;
5. shadow validation;
6. strategy promotion governance.

No live exchange credentials or capital movement are introduced by V1.
