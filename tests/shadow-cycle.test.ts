import { describe, expect, it } from 'vitest';
import { runShadowCycle } from '../src/shadow-cycle.js';
import type { MarketSnapshot, PortfolioState, RiskConfig, TradeProposal } from '../src/domain.js';

const market: MarketSnapshot = { snapshotId: 'm1', symbol: 'BTCUSDT', asOf: 1_000, price: 100_000, candles: [], source: 'fixture' };
const portfolio: PortfolioState = { equity: 100_000, availableCapital: 100_000, grossExposure: 0, positions: {}, dailyPnl: 0, rollingDrawdownPct: 0, killSwitch: false };
const riskConfig: RiskConfig = { maxPortfolioExposurePct: 30, maxSingleAssetExposurePct: 10, maxStrategyExposurePct: 10, maxLeverage: 1, maxDrawdownPct: 15, maxSlippagePct: 1, maxDataAgeMs: 1_000 };
const proposal: TradeProposal = { proposalId: 'p1', symbol: 'BTCUSDT', side: 'LONG', entry: 100_000, stop: 95_000, target: 110_000, requestedQuantity: 0.05, horizonMinutes: 240, strategyVersion: 'fixture-v1', thesis: 'fixture', researchRunId: 'r1', snapshotId: 'm1' };

describe('shadow cycle', () => {
  it('keeps execution in shadow and records the decision', async () => {
    const result = await runShadowCycle({ market, portfolio, proposal, riskConfig, now: 1_500 });
    expect(result.research.evidence).toHaveLength(1);
    expect(result.decision.state).toBe('APPROVED');
    expect(result.shadowOrder?.environment).toBe('SHADOW');
    expect(result.shadowOrder?.orderId).toBe('shadow:decision:p1');
    expect(result.ledger.history(result.decision.decisionId)).toHaveLength(1);
  });
});
