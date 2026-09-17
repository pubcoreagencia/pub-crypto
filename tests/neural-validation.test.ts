import { describe, expect, it } from 'vitest';
import { toNeuralValidationArtifact } from '../src/neural-validation.js';

describe('neural validation artifact', () => {
  it('maps shadow validation into a governed PUB Neural payload', () => {
    const result = toNeuralValidationArtifact({
      strategyVersion: 'shadow-v1',
      datasetVersion: 'fixture-v1',
      startingEquity: 1000,
      endingEquity: 1005,
      totalReturnPct: 0.5,
      tradeCount: 10,
      regimeAttribution: [{
        regime: 'UPTREND',
        tradeCount: 10,
        pnl: 5,
        winRatePct: 60,
        averageTradePnl: 0.5
      }],
      monteCarlo: null,
      status: 'SHADOW_VALIDATED'
    }, 1700000000000);

    expect(result.artifactType).toBe('TRADING_VALIDATION');
    expect(result.source).toBe('PUB_CRYPTO');
    expect(result.status).toBe('SHADOW_VALIDATED');
    expect(result.tradeCount).toBe(10);
  });

  it('rejects invalid timestamps', () => {
    expect(() => toNeuralValidationArtifact({
      strategyVersion: 'shadow-v1',
      datasetVersion: 'fixture-v1',
      startingEquity: 1000,
      endingEquity: 1000,
      totalReturnPct: 0,
      tradeCount: 0,
      regimeAttribution: [],
      monteCarlo: null,
      status: 'SHADOW_INSUFFICIENT_SAMPLE'
    }, 0)).toThrow('INVALID_OBSERVED_AT');
  });
});
