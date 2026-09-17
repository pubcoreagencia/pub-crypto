import { describe, expect, it } from 'vitest';
import { runBacktest } from '../src/backtest.js';

describe('backtest', () => {
  it('produces deterministic results with dataset and strategy versions', () => {
    const candles = [
      { timestamp: 1, open: 100, high: 102, low: 99, close: 101, volume: 10 },
      { timestamp: 2, open: 101, high: 104, low: 100, close: 103, volume: 10 },
      { timestamp: 3, open: 103, high: 105, low: 102, close: 102, volume: 10 },
      { timestamp: 4, open: 102, high: 106, low: 101, close: 105, volume: 10 }
    ];
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
    expect(result.endingEquity).toBe(1001);
  });
});
