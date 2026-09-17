import { describe, expect, it } from 'vitest';
import { buildWalkForwardWindows, runWalkForward } from '../src/walk-forward.js';

describe('walk-forward validation', () => {
  const candles = Array.from({ length: 10 }, (_, i) => ({
    timestamp: i + 1,
    open: 100 + i,
    high: 101 + i,
    low: 99 + i,
    close: 100 + i,
    volume: 10
  }));

  it('builds strictly ordered train/test windows without leakage', () => {
    const windows = buildWalkForwardWindows(10, 4, 2);

    expect(windows).toEqual([
      { index: 0, trainStart: 0, trainEnd: 4, testStart: 4, testEnd: 6 },
      { index: 1, trainStart: 2, trainEnd: 6, testStart: 6, testEnd: 8 },
      { index: 2, trainStart: 4, trainEnd: 8, testStart: 8, testEnd: 10 }
    ]);

    for (const window of windows) {
      expect(window.trainEnd).toBe(window.testStart);
      expect(window.trainEnd).toBeLessThanOrEqual(window.testStart);
    }
  });

  it('passes only the training slice to strategy creation and compounds OOS equity', () => {
    const observedTrainLengths: number[] = [];

    const result = runWalkForward({
      candles,
      trainSize: 4,
      testSize: 2,
      strategyVersion: 'wf-v1',
      datasetVersionPrefix: 'fixture-v1',
      startingEquity: 1000,
      strategyFactory: {
        create: (trainCandles) => {
          observedTrainLengths.push(trainCandles.length);
          return {
            signal: (_testCandles, index) => index === 1 ? { side: 'LONG' } : null
          };
        }
      }
    });

    expect(observedTrainLengths).toEqual([4, 4, 4]);
    expect(result.windows).toHaveLength(3);
    expect(result.windows.map((w) => w.testDatasetVersion)).toEqual([
      'fixture-v1:test:w0',
      'fixture-v1:test:w1',
      'fixture-v1:test:w2'
    ]);
    expect(result.windows.every((w) => w.window.trainEnd === w.window.testStart)).toBe(true);
    expect(result.endingEquity).toBe(1003);
    expect(result.totalReturnPct).toBeCloseTo(0.3);
  });

  it('rejects invalid window parameters', () => {
    expect(() => buildWalkForwardWindows(10, 0, 2)).toThrow('INVALID_TRAIN_SIZE');
    expect(() => buildWalkForwardWindows(10, 4, 0)).toThrow('INVALID_TEST_SIZE');
    expect(() => buildWalkForwardWindows(10, 4, 2, 0)).toThrow('INVALID_STEP');
    expect(buildWalkForwardWindows(5, 4, 2)).toHaveLength(0);
  });
});
