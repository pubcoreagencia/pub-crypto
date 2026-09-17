# PUB Crypto AI — Risk Engine V0

## Purpose
The risk engine is deterministic and authoritative. It converts a candidate trade into a bounded risk envelope or rejects it.

## Inputs
- portfolio equity and available capital;
- current positions and pending orders;
- asset volatility and liquidity;
- correlations/exposures;
- strategy risk budget;
- portfolio drawdown state;
- approved mandate;
- proposed entry, stop/invalidation and target/horizon.

## Controls
1. maximum portfolio exposure;
2. maximum single-asset exposure;
3. maximum strategy exposure;
4. leverage limit;
5. concentration/correlation limit;
6. liquidity/slippage limit;
7. daily and rolling drawdown limits;
8. loss-streak or operational-failure circuit breaker;
9. stale-data rejection;
10. duplicate-order/idempotency protection.

## Output
`APPROVE | REDUCE_SIZE | REJECT | HALT`

Every result must contain rule identifiers, input snapshot, timestamp and deterministic reason.

## Kill switch
The kill switch must be executable without an LLM and must block new orders immediately. Recovery requires an explicit state transition and audit record.

## Principle
The model may request risk. It never grants itself risk.
