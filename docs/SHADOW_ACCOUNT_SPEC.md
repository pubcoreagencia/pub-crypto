# PUB Crypto AI — Shadow Account V0

## Purpose
A shadow account simulates the exact decision and execution path without financial settlement. It is the bridge between research and live capital.

## Required state
- virtual equity;
- positions and orders;
- fees/slippage assumptions;
- strategy version;
- decision IDs;
- timestamps;
- fills and rejected orders;
- realized/unrealized P&L;
- risk events;
- post-trade attribution.

## Fidelity
Shadow mode must use the same decision, risk and execution adapters as live mode, replacing only the settlement adapter. This prevents paper mode from becoming a separate code path with different behavior.

## Exit criteria
A strategy can leave shadow only after a predefined observation window and sufficient sample size, with stability across relevant regimes and no unresolved critical operational failures.

## Human strategy capture
Future versions may ingest a human trade journal, extract hypotheses, replay them in shadow, and compare outcomes. This is inspired by the Shadow Account pattern observed in Vibe-Trading.
