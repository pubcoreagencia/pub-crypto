import type { Candle } from './domain.js';
import { runBacktest, type BacktestResult, type BacktestStrategy } from './backtest.js';

export interface WalkForwardWindow {
  index: number;
  trainStart: number;
  trainEnd: number;
  testStart: number;
  testEnd: number;
}

export interface StrategyFactory {
  create(trainCandles: Candle[], window: WalkForwardWindow): BacktestStrategy;
}

export interface WalkForwardSliceResult {
  window: WalkForwardWindow;
  trainDatasetVersion: string;
  testDatasetVersion: string;
  result: BacktestResult;
}

export interface WalkForwardResult {
  strategyVersion: string;
  datasetVersionPrefix: string;
  startingEquity: number;
  endingEquity: number;
  totalReturnPct: number;
  windows: WalkForwardSliceResult[];
}

export function buildWalkForwardWindows(
  candleCount: number,
  trainSize: number,
  testSize: number,
  step = testSize
): WalkForwardWindow[] {
  if (!Number.isInteger(candleCount) || candleCount < 1) throw new Error('INVALID_CANDLE_COUNT');
  if (!Number.isInteger(trainSize) || trainSize < 1) throw new Error('INVALID_TRAIN_SIZE');
  if (!Number.isInteger(testSize) || testSize < 1) throw new Error('INVALID_TEST_SIZE');
  if (!Number.isInteger(step) || step < 1) throw new Error('INVALID_STEP');

  const windows: WalkForwardWindow[] = [];
  let index = 0;

  for (let start = 0; start + trainSize + testSize <= candleCount; start += step) {
    const trainStart = start;
    const trainEnd = start + trainSize;
    const testStart = trainEnd;
    const testEnd = testStart + testSize;
    windows.push({ index, trainStart, trainEnd, testStart, testEnd });
    index += 1;
  }

  return windows;
}

export function runWalkForward(input: {
  candles: Candle[];
  trainSize: number;
  testSize: number;
  step?: number;
  strategyFactory: StrategyFactory;
  strategyVersion: string;
  datasetVersionPrefix: string;
  startingEquity: number;
  feeBps?: number;
  slippageBps?: number;
}): WalkForwardResult {
  const windows = buildWalkForwardWindows(
    input.candles.length,
    input.trainSize,
    input.testSize,
    input.step
  );

  if (windows.length === 0) throw new Error('INSUFFICIENT_DATA_FOR_WALK_FORWARD');

  let equity = input.startingEquity;
  const slices: WalkForwardSliceResult[] = [];

  for (const window of windows) {
    const trainCandles = input.candles.slice(window.trainStart, window.trainEnd);
    const testCandles = input.candles.slice(window.testStart, window.testEnd);

    const strategy = input.strategyFactory.create(trainCandles, window);
    const trainDatasetVersion = `${input.datasetVersionPrefix}:train:w${window.index}`;
    const testDatasetVersion = `${input.datasetVersionPrefix}:test:w${window.index}`;

    const result = runBacktest({
      candles: testCandles,
      strategy,
      strategyVersion: input.strategyVersion,
      datasetVersion: testDatasetVersion,
      startingEquity: equity,
      feeBps: input.feeBps,
      slippageBps: input.slippageBps
    });

    equity = result.endingEquity;
    slices.push({
      window,
      trainDatasetVersion,
      testDatasetVersion,
      result
    });
  }

  return {
    strategyVersion: input.strategyVersion,
    datasetVersionPrefix: input.datasetVersionPrefix,
    startingEquity: input.startingEquity,
    endingEquity: equity,
    totalReturnPct: ((equity - input.startingEquity) / input.startingEquity) * 100,
    windows: slices
  };
}
