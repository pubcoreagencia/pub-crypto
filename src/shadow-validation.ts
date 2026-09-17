import type { BacktestTrade } from './backtest.js';
import type { MarketRegime, RegimeWindow } from './regime-analysis.js';
import { runMonteCarlo, type MonteCarloSummary } from './monte-carlo.js';

export interface RegimeAttribution {
  regime: MarketRegime;
  tradeCount: number;
  pnl: number;
  winRatePct: number;
  averageTradePnl: number;
}

export interface ShadowValidationResult {
  strategyVersion: string;
  datasetVersion: string;
  startingEquity: number;
  endingEquity: number;
  totalReturnPct: number;
  tradeCount: number;
  regimeAttribution: RegimeAttribution[];
  monteCarlo: MonteCarloSummary | null;
  status: 'SHADOW_VALIDATED' | 'SHADOW_INSUFFICIENT_SAMPLE';
}

function mean(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function regimeForTrade(trade: BacktestTrade, regimes: RegimeWindow[]): MarketRegime | null {
  const match = regimes.find((window) => trade.entryTime >= window.start && trade.entryTime < window.end);
  return match?.regime ?? null;
}

export function runShadowValidation(input: {
  strategyVersion: string;
  datasetVersion: string;
  startingEquity: number;
  endingEquity: number;
  trades: BacktestTrade[];
  regimes: RegimeWindow[];
  monteCarloSimulations?: number;
  monteCarloSeed?: number;
}): ShadowValidationResult {
  const grouped = new Map<MarketRegime, BacktestTrade[]>();

  for (const trade of input.trades) {
    const regime = regimeForTrade(trade, input.regimes);
    if (!regime) continue;
    const existing = grouped.get(regime) ?? [];
    existing.push(trade);
    grouped.set(regime, existing);
  }

  const regimeAttribution = [...grouped.entries()].map(([regime, trades]) => ({
    regime,
    tradeCount: trades.length,
    pnl: trades.reduce((sum, trade) => sum + trade.pnl, 0),
    winRatePct: (trades.filter((trade) => trade.pnl > 0).length / trades.length) * 100,
    averageTradePnl: mean(trades.map((trade) => trade.pnl))
  }));

  const monteCarlo = input.trades.length >= 2
    ? runMonteCarlo({
        startingEquity: input.startingEquity,
        tradeReturns: input.trades.map((trade) => trade.returnPct / 100),
        simulations: input.monteCarloSimulations ?? 1000,
        seed: input.monteCarloSeed ?? 42
      })
    : null;

  return {
    strategyVersion: input.strategyVersion,
    datasetVersion: input.datasetVersion,
    startingEquity: input.startingEquity,
    endingEquity: input.endingEquity,
    totalReturnPct: ((input.endingEquity - input.startingEquity) / input.startingEquity) * 100,
    tradeCount: input.trades.length,
    regimeAttribution,
    monteCarlo,
    status: input.trades.length >= 10 ? 'SHADOW_VALIDATED' : 'SHADOW_INSUFFICIENT_SAMPLE'
  };
}
