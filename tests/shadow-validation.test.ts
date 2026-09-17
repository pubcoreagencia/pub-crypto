import { describe, expect, it } from 'vitest';
import { runShadowValidation } from '../src/shadow-validation.js';

const trade = (entryTime: number, pnl: number) => ({
  side: 'LONG' as const,
  entryTime,
  exitTime: entryTime + 1,
  entryPrice: 100,
  exitPrice: pnl >= 0 ? 101 : 99,
  quantity: 1,
  grossPnl: pnl,
  fees: 0,
  slippageCost: 0,
  pnl,
  returnPct: pnl
});

describe('shadow validation', () => {
  it('attributes trades to historical regimes and remains explicit about sample size', () => {
    const trades = Array.from({ length: 10 }, (_, i) => trade(i + 1, i % 2 === 0 ? 1 : -0.5));
    const result = runShadowValidation({
      strategyVersion: 'shadow-v1',
      datasetVersion: 'fixture-v1',
      startingEquity: 1000,
      endingEquity: 1002.5,
      trades,
      regimes: [
        { start: 0, end: 6, returnPct: 2, volatilityPct: 0.5, regime: 'UPTREND' },
        { start: 6, end: 12, returnPct: -1, volatilityPct: 0.5, regime: 'DOWNTREND' }
      ],
      monteCarloSimulations: 50,
      monteCarloSeed: 9
    });

    expect(result.status).toBe('SHADOW_VALIDATED');
    expect(result.regimeAttribution.map((x) => x.regime)).toEqual(['UPTREND', 'DOWNTREND']);
    expect(result.regimeAttribution.reduce((sum, x) => sum + x.tradeCount, 0)).toBe(10);
    expect(result.monteCarlo?.simulations).toBe(50);
  });

  it('does not call a small sample validated', () => {
    const result = runShadowValidation({
      strategyVersion: 'shadow-v1',
      datasetVersion: 'fixture-v1',
      startingEquity: 1000,
      endingEquity: 1001,
      trades: [trade(1, 1)],
      regimes: [{ start: 0, end: 3, returnPct: 1, volatilityPct: 0.2, regime: 'UPTREND' }]
    });

    expect(result.status).toBe('SHADOW_INSUFFICIENT_SAMPLE');
    expect(result.monteCarlo).toBeNull();
  });
});
