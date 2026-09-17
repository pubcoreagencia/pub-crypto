import { describe, expect, it } from 'vitest';
import { runBacktest } from '../src/backtest.js';

describe('backtest', () => {
  const candles = [
    { timestamp: 1, open: 100, high: 102, low: 99, close: 101, volume: 10 },
    { timestamp: 2, open: 101, high: 104, low: 100, close: 103, volume: 10 },
    { timestamp: 3, open: 103, high: 105, low: 102, close: 102, volume: 10 },
    { timestamp: 4, open: 102, high: 106, low: 101, close: 105, volume: 10 }
  ];

  it('produces deterministic results with dataset and strategy versions', () => {
    const result = runBacktest({
      candles,
      datasetVersion: 'fixture-v1',
      strategyVersion: 'close-up-v1',
      startingEquity: 1000,
      strategy: { signal: (_candles, index) => index === 1 ? { side: 'LONG' } : null }
    });
    expect(result.datasetVersion).toBe('fixture-v1');
    expect(result.strategyVersion).toBe('close-up-v1');
    expect(result.tradeCount).toBe(1);
    expect(result.endingEquity).toBe(999);
    expect(result.metrics.losingTrades).toBe(1);
    expect(result.metrics.winRatePct).toBe(0);
  });

  it('accounts for fees and slippage explicitly', () => {
    const result = runBacktest({
      candles,
      datasetVersion: 'fixture-v1',
      strategyVersion: 'cost-v1',
      startingEquity: 1000,
      feeBps: 10,
      slippageBps: 5,
      strategy: { signal: (_candles, index) => index === 1 ? { side: 'LONG' } : null }
    });
    expect(result.trades[0].grossPnl).toBe(-1);
    expect(result.trades[0].fees).toBeCloseTo(0.205);
    expect(result.trades[0].slippageCost).toBeCloseTo(0.1025);
    expect(result.endingEquity).toBeCloseTo(998.6925);
  });

  it('does not fabricate a Sharpe ratio for a single trade', () => {
    const result = runBacktest({
      candles,
      datasetVersion: 'fixture-v1',
      strategyVersion: 'stats-v1',
      startingEquity: 1000,
      strategy: { signal: (_candles, index) => index === 1 ? { side: 'LONG' } : null }
    });
    expect(result.metrics.sharpeRatio).toBeNull();
    expect(result.metrics.profitFactor).toBeNull();
  });
});
