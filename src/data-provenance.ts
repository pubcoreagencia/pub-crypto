import type { Candle, MarketSnapshot } from './domain.js';

export interface DatasetProvenance {
  datasetVersion: string;
  source: string;
  symbol: string;
  timeframe: string;
  asOf: number;
  firstTimestamp: number;
  lastTimestamp: number;
  candleCount: number;
  contentHash: string;
}

export interface NormalizedDataset {
  provenance: DatasetProvenance;
  candles: Candle[];
}

function canonicalCandle(candle: Candle): string {
  return [candle.timestamp, candle.open, candle.high, candle.low, candle.close, candle.volume].join('|');
}

export function hashDataset(candles: Candle[]): string {
  let hash = 2166136261;
  for (const char of candles.map(canonicalCandle).join('\n')) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function normalizeDataset(input: {
  symbol: string;
  timeframe: string;
  source: string;
  datasetVersion: string;
  candles: Candle[];
}): NormalizedDataset {
  const candles = [...input.candles].sort((a, b) => a.timestamp - b.timestamp);
  if (candles.length === 0) throw new Error('EMPTY_DATASET');
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    if (c.high < Math.max(c.open, c.close) || c.low > Math.min(c.open, c.close)) throw new Error('INVALID_OHLC');
    if (c.volume < 0) throw new Error('INVALID_VOLUME');
    if (i > 0 && c.timestamp === candles[i - 1].timestamp) throw new Error('DUPLICATE_TIMESTAMP');
  }
  return {
    candles,
    provenance: {
      datasetVersion: input.datasetVersion,
      source: input.source,
      symbol: input.symbol,
      timeframe: input.timeframe,
      asOf: candles[candles.length - 1].timestamp,
      firstTimestamp: candles[0].timestamp,
      lastTimestamp: candles[candles.length - 1].timestamp,
      candleCount: candles.length,
      contentHash: hashDataset(candles)
    }
  };
}

export function snapshotFromDataset(dataset: NormalizedDataset): MarketSnapshot {
  const last = dataset.candles[dataset.candles.length - 1];
  return {
    snapshotId: `market:${dataset.provenance.symbol}:${last.timestamp}:${dataset.provenance.datasetVersion}`,
    symbol: dataset.provenance.symbol,
    asOf: last.timestamp,
    price: last.close,
    candles: dataset.candles,
    source: dataset.provenance.source
  };
}
