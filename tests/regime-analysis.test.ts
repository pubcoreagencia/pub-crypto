import { describe, expect, it } from 'vitest';
import { analyzeRegimes, classifyRegime } from '../src/regime-analysis.js';

const candles = [
  { timestamp: 1, open: 100, high: 101, low: 99, close: 100, volume: 10 },
  { timestamp: 2, open: 100, high: 104, low: 99, close: 103, volume: 10 },
  { timestamp: 3, open: 103, high: 108, low: 102, close: 106, volume: 10 },
  { timestamp: 4, open: 106, high: 109, low: 105, close: 108, volume: 10 },
  { timestamp: 5, open: 108, high: 109, low: 107, close: 108, volume: 10 },
  { timestamp: 6, open: 108, high: 109, low: 107, close: 108, volume: 10 }
];

describe('regime analysis', () => {
  it('classifies an upward window deterministically', () => {
    const result = classifyRegime({
      candles,
      start: 0,
      end: 4,
      trendThresholdPct: 1
    });
    expect(result.returnPct).toBeCloseTo(8);
    expect(result.regime).toBe('UPTREND');
  });

  it('classifies a quiet flat window as low volatility', () => {
    const result = classifyRegime({
      candles,
      start: 3,
      end: 6,
      trendThresholdPct: 1,
      highVolatilityThresholdPct: 2
    });
    expect(result.regime).toBe('LOW_VOLATILITY');
  });

  it('creates non-overlapping deterministic windows by default', () => {
    const result = analyzeRegimes({
      candles,
      windowSize: 2,
      datasetVersion: 'fixture-v1',
      symbol: 'BTCUSDT',
      timeframe: '1h'
    });
    expect(result.windows.map((w) => [w.start, w.end])).toEqual([[0, 2], [2, 4], [4, 6]]);
  });
});
