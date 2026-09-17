import { describe, expect, it } from 'vitest';
import { RiskEngine } from '../src/risk-engine.js';
import type { MarketSnapshot, PortfolioState, RiskConfig, TradeProposal } from '../src/domain.js';

const config: RiskConfig = {
  maxPortfolioExposurePct: 30,
  maxSingleAssetExposurePct: 10,
  maxStrategyExposurePct: 10,
  maxLeverage: 1,
  maxDrawdownPct: 15,
  maxSlippagePct: 1,
  maxDataAgeMs: 1_000
};

const market: MarketSnapshot = { snapshotId: 'm1', symbol: 'BTCUSDT', asOf: 1_000, price: 100_000, candles: [], source: 'fixture' };
const portfolio: PortfolioState = { equity: 100_000, availableCapital: 100_000, grossExposure: 0, positions: {}, dailyPnl: 0, rollingDrawdownPct: 0, killSwitch: false };
const proposal: TradeProposal = { proposalId: 'p1', symbol: 'BTCUSDT', side: 'LONG', entry: 100_000, stop: 95_000, target: 110_000, requestedQuantity: 0.05, horizonMinutes: 240, strategyVersion: 'fixture-v1', thesis: 'fixture', researchRunId: 'r1', snapshotId: 'm1' };

describe('RiskEngine', () => {
  it('approves a bounded proposal', () => {
    const result = new RiskEngine(config).evaluate(proposal, portfolio, market, 1_500);
    expect(result.decision).toBe('APPROVE');
    expect(result.approvedQuantity).toBe(0.05);
  });

  it('halts on stale data', () => {
    const result = new RiskEngine(config).evaluate(proposal, portfolio, market, 3_000);
    expect(result.decision).toBe('HALT');
    expect(result.rules).toContain('STALE_DATA');
  });

  it('halts when kill switch is active', () => {
    const result = new RiskEngine(config).evaluate(proposal, { ...portfolio, killSwitch: true }, market, 1_500);
    expect(result.decision).toBe('HALT');
    expect(result.rules).toContain('KILL_SWITCH');
  });

  it('rejects invalid long stop geometry', () => {
    const result = new RiskEngine(config).evaluate({ ...proposal, stop: 105_000 }, portfolio, market, 1_500);
    expect(result.decision).toBe('REJECT');
    expect(result.rules).toContain('LONG_STOP_INVALID');
  });
});
