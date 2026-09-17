import type { Candle, MarketSnapshot } from './domain.js';

export interface MarketDataProvider {
  getSnapshot(symbol: string, asOf?: number): Promise<MarketSnapshot>;
}

export class FixtureMarketDataProvider implements MarketDataProvider {
  constructor(private readonly candles: Candle[]) {}

  async getSnapshot(symbol: string, asOf = this.candles.at(-1)?.timestamp ?? Date.now()): Promise<MarketSnapshot> {
    const candle = this.candles.findLast((c) => c.timestamp <= asOf);
    if (!candle) throw new Error('NO_MARKET_DATA');
    return {
      snapshotId: `market:${symbol}:${candle.timestamp}`,
      symbol,
      asOf: candle.timestamp,
      price: candle.close,
      candles: this.candles.filter((c) => c.timestamp <= candle.timestamp),
      source: 'fixture'
    };
  }
}
