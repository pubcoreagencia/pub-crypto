import { describe, expect, it } from 'vitest';
import { runMonteCarlo } from '../src/monte-carlo.js';

describe('monte carlo', () => {
  it('is deterministic for a fixed seed', () => {
    const input = {
      startingEquity: 1000,
      tradeReturns: [0.01, -0.005, 0.02, -0.01],
      simulations: 100,
      seed: 123
    };
    expect(runMonteCarlo(input)).toEqual(runMonteCarlo(input));
  });

  it('produces ordered percentiles', () => {
    const result = runMonteCarlo({
      startingEquity: 1000,
      tradeReturns: [0.01, -0.005, 0.02, -0.01],
      simulations: 200,
      seed: 7
    });
    expect(result.worstFinalEquity).toBeLessThanOrEqual(result.percentile5FinalEquity);
    expect(result.percentile5FinalEquity).toBeLessThanOrEqual(result.percentile50FinalEquity);
    expect(result.percentile50FinalEquity).toBeLessThanOrEqual(result.percentile95FinalEquity);
    expect(result.percentile95FinalEquity).toBeLessThanOrEqual(result.bestFinalEquity);
  });

  it('rejects empty samples', () => {
    expect(() => runMonteCarlo({
      startingEquity: 1000,
      tradeReturns: [],
      simulations: 10
    })).toThrow('EMPTY_TRADE_RETURNS');
  });
});
