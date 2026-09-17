import type { Candle, Side } from './domain.js';

export interface BacktestTrade {
  side: Side;
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
}

export interface BacktestResult {
  datasetVersion: string;
  strategyVersion: string;
  startingEquity: number;
  endingEquity: number;
  totalReturnPct: number;
  maxDrawdownPct: number;
  tradeCount: number;
  trades: BacktestTrade[];
}

export interface BacktestStrategy {
  signal(candles: Candle[], index: number): { side: Side; stop?: number; target?: number } | null;
}

export function runBacktest(input: {
  candles: Candle[];
  strategy: BacktestStrategy;
  strategyVersion: string;
  datasetVersion: string;
  startingEquity: number;
  feeBps?: number;
}): BacktestResult {
  const feeRate = (input.feeBps ?? 0) / 10_000;
  let equity = input.startingEquity;
  let peak = equity;
  let maxDrawdownPct = 0;
  const trades: BacktestTrade[] = [];
  let open: { side: Side; entry: Candle; quantity: number } | null = null;

  for (let i = 1; i < input.candles.length; i++) {
    const candle = input.candles[i];
    if (!open) {
      const signal = input.strategy.signal(input.candles, i);
      if (signal) open = { side: signal.side, entry: candle, quantity: 1 };
    } else {
      const exitPrice = candle.close;
      const direction = open.side === 'LONG' ? 1 : -1;
      const gross = (exitPrice - open.entry.close) * direction * open.quantity;
      const fees = (open.entry.close + exitPrice) * open.quantity * feeRate;
      const pnl = gross - fees;
      equity += pnl;
      trades.push({ side: open.side, entryTime: open.entry.timestamp, exitTime: candle.timestamp, entryPrice: open.entry.close, exitPrice, quantity: open.quantity, pnl });
      peak = Math.max(peak, equity);
      maxDrawdownPct = Math.max(maxDrawdownPct, peak ? ((peak - equity) / peak) * 100 : 0);
      open = null;
    }
  }

  return {
    datasetVersion: input.datasetVersion,
    strategyVersion: input.strategyVersion,
    startingEquity: input.startingEquity,
    endingEquity: equity,
    totalReturnPct: ((equity - input.startingEquity) / input.startingEquity) * 100,
    maxDrawdownPct,
    tradeCount: trades.length,
    trades
  };
}
