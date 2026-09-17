# PUB Crypto AI — Live Execution Governance V0

## Environment separation
- `BACKTEST`: historical simulation only.
- `SHADOW`: live market data, simulated settlement.
- `PAPER`: broker/exchange paper environment when supported.
- `LIVE`: real capital, explicit enablement required.

## Live gate
Live execution requires:
1. validated strategy/version;
2. shadow/paper evidence;
3. current risk policy;
4. fresh market data;
5. exchange connectivity health;
6. explicit mandate;
7. kill switch healthy;
8. audit record created before order submission.

## Order invariants
Execution may not silently change side, size, symbol, strategy, mandate or risk limits. Any material change returns the decision to the decision/risk gate.

## Operational safety
- idempotent order submission;
- reconciliation against exchange state;
- stale-order detection;
- balance reconciliation;
- circuit breaker on connectivity/data anomalies;
- independent emergency stop;
- complete audit trail.

## Principle
Autonomy means continuous operation inside explicit constraints. It does not mean unrestricted authority.
