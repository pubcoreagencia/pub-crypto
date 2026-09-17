import type { Candle, Side } from './domain.js';

export interface BacktestTrade {
  side: Side;
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  grossPnl: number;
  fees: number;
  slippageCost: number;
  pnl: number;
  returnPct: number;
}

export interface BacktestMetrics {
  totalReturnPct: number;
  maxDrawdownPct: number;
  tradeCount: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number | null;
  averageTradePnl: number;
  expectancy: number;
  volatilityPct: number;
  sharpeRatio: number | null;
  turnover: number;
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
  metrics: BacktestMetrics;
}

export interface BacktestStrategy {
  signal(candles: Candle[], index: number): { side: Side; stop?: number; target?: number } | null;
}

function mean(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function std(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(mean(values.map((v) => (v - m) ** 2)));
}

export function runBacktest(input: {
  candles: Candle[];
  strategy: BacktestStrategy;
  strategyVersion: string;
  datasetVersion: string;
  startingEquity: number;
  feeBps?: number;
  slippageBps?: number;
}): BacktestResult {
  const feeRate = (input.feeBps ?? 0) / 10_000;
  const slippageRate = (input.slippageBps ?? 0) / 10_000;
  let equity = input.startingEquity;
  let peak = equity;
  let maxDrawdownPct = 0;
  let turnover = 0;
  const trades: BacktestTrade[] = [];

  let open: { side: Side; entry: Candle; quantity: number } | null = null;

  for (let i = 1; i < input.candles.length; i++) {
    const candle = input.candles[i];

    if (!open) {
      const signal = input.strategy.signal(input.candles, i);
      if (signal) open = { side: signal.side, entry: candle, quantity: 1 };
      continue;
    }

    const direction = open.side === 'LONG' ? 1 : -1;
    const entryPrice = open.entry.close;
    const exitPrice = candle.close;
    const notional = (entryPrice + exitPrice) * open.quantity;
    const grossPnl = (exitPrice - entryPrice) * direction * open.quantity;
    const fees = notional * feeRate;
    const slippageCost = notional * slippageRate;
    const pnl = grossPnl - fees - slippageCost;
    equity += pnl;
    turnover += notional;

    trades.push({
      side: open.side,
      entryTime: open.entry.timestamp,
      exitTime: candle.timestamp,
      entryPrice,
      exitPrice,
      quantity: open.quantity,
      grossPnl,
      fees,
      slippageCost,
      pnl,
      returnPct: entryPrice > 0 ? (pnl / (entryPrice * open.quantity)) * 100 : 0
    });

    peak = Math.max(peak, equity);
    maxDrawdownPct = Math.max(maxDrawdownPct, peak ? ((peak - equity) / peak) * 100 : 0);
    open = null;
  }

  const tradeReturns = trades.map((trade) => trade.returnPct / 100);
  const winners = trades.filter((trade) => trade.pnl > 0);
  const losers = trades.filter((trade) => trade.pnl < 0);
  const grossProfit = winners.reduce((sum, trade) => sum + trade.pnl, 0);
  const grossLoss = losers.reduce((sum, trade) => sum + trade.pnl, 0);
  const deviation = std(tradeReturns);
  const sharpeRatio = tradeReturns.length >= 2 && deviation > 0
    ? (mean(tradeReturns) / deviation) * Math.sqrt(tradeReturns.length)
    : null;

  const metrics: BacktestMetrics = {
    totalReturnPct: ((equity - input.startingEquity) / input.startingEquity) * 100,
    maxDrawdownPct,
    tradeCount: trades.length,
    winningTrades: winners.length,
    losingTrades: losers.length,
    winRatePct: trades.length ? (winners.length / trades.length) * 100 : 0,
    grossProfit,
    grossLoss,
    profitFactor: grossLoss < 0 ? grossProfit / Math.abs(grossLoss) : null,
    averageTradePnl: mean(trades.map((trade) => trade.pnl)),
    expectancy: mean(trades.map((trade) => trade.pnl)),
    volatilityPct: deviation * 100,
    sharpeRatio,
    turnover
  };

  return {
    datasetVersion: input.datasetVersion,
    strategyVersion: input.strategyVersion,
    startingEquity: input.startingEquity,
    endingEquity: equity,
    totalReturnPct: metrics.totalReturnPct,
    maxDrawdownPct,
    tradeCount: trades.length,
    trades,
    metrics
  };
}
