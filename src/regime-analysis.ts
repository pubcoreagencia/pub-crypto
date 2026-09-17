import type { Candle } from './domain.js';

export type MarketRegime = 'UPTREND' | 'DOWNTREND' | 'RANGE' | 'HIGH_VOLATILITY' | 'LOW_VOLATILITY';

export interface RegimeWindow {
  start: number;
  end: number;
  returnPct: number;
  volatilityPct: number;
  regime: MarketRegime;
}

export interface RegimeAnalysis {
  datasetVersion: string;
  symbol: string;
  timeframe: string;
  windows: RegimeWindow[];
}

function mean(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function std(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(mean(values.map((v) => (v - m) ** 2)));
}

export function classifyRegime(input: {
  candles: Candle[];
  start: number;
  end: number;
  trendThresholdPct?: number;
  highVolatilityThresholdPct?: number;
}): RegimeWindow {
  const candles = input.candles.slice(input.start, input.end);
  if (candles.length < 2) throw new Error('INSUFFICIENT_REGIME_WINDOW');

  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  if (first <= 0 || last <= 0) throw new Error('INVALID_PRICE');

  const returns = candles.slice(1).map((c, i) => {
    const previous = candles[i].close;
    return previous > 0 ? Math.log(c.close / previous) : 0;
  });

  const returnPct = ((last - first) / first) * 100;
  const volatilityPct = std(returns) * 100;
  const trendThresholdPct = input.trendThresholdPct ?? 1;
  const highVolatilityThresholdPct = input.highVolatilityThresholdPct ?? 2;

  let regime: MarketRegime;
  if (volatilityPct >= highVolatilityThresholdPct) {
    regime = 'HIGH_VOLATILITY';
  } else if (volatilityPct <= highVolatilityThresholdPct / 2 && Math.abs(returnPct) < trendThresholdPct) {
    regime = 'LOW_VOLATILITY';
  } else if (returnPct >= trendThresholdPct) {
    regime = 'UPTREND';
  } else if (returnPct <= -trendThresholdPct) {
    regime = 'DOWNTREND';
  } else {
    regime = 'RANGE';
  }

  return { start: input.start, end: input.end, returnPct, volatilityPct, regime };
}

export function analyzeRegimes(input: {
  candles: Candle[];
  windowSize: number;
  step?: number;
  datasetVersion: string;
  symbol: string;
  timeframe: string;
  trendThresholdPct?: number;
  highVolatilityThresholdPct?: number;
}): RegimeAnalysis {
  if (!Number.isInteger(input.windowSize) || input.windowSize < 2) throw new Error('INVALID_WINDOW_SIZE');
  const step = input.step ?? input.windowSize;
  if (!Number.isInteger(step) || step < 1) throw new Error('INVALID_STEP');

  const windows: RegimeWindow[] = [];
  for (let start = 0; start + input.windowSize <= input.candles.length; start += step) {
    windows.push(classifyRegime({
      candles: input.candles,
      start,
      end: start + input.windowSize,
      trendThresholdPct: input.trendThresholdPct,
      highVolatilityThresholdPct: input.highVolatilityThresholdPct
    }));
  }

  return {
    datasetVersion: input.datasetVersion,
    symbol: input.symbol,
    timeframe: input.timeframe,
    windows
  };
}
