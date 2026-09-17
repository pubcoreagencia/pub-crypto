import type { RegimeAttribution, ShadowValidationResult } from './shadow-validation.js';

export interface NeuralValidationArtifact {
  artifactType: 'TRADING_VALIDATION';
  artifactVersion: 'v0';
  strategyVersion: string;
  datasetVersion: string;
  observedAt: number;
  status: ShadowValidationResult['status'];
  totalReturnPct: number;
  tradeCount: number;
  regimeAttribution: RegimeAttribution[];
  monteCarloSummary: ShadowValidationResult['monteCarlo'];
  source: 'PUB_CRYPTO';
}

export function toNeuralValidationArtifact(
  result: ShadowValidationResult,
  observedAt: number
): NeuralValidationArtifact {
  if (!Number.isFinite(observedAt) || observedAt <= 0) throw new Error('INVALID_OBSERVED_AT');

  return {
    artifactType: 'TRADING_VALIDATION',
    artifactVersion: 'v0',
    strategyVersion: result.strategyVersion,
    datasetVersion: result.datasetVersion,
    observedAt,
    status: result.status,
    totalReturnPct: result.totalReturnPct,
    tradeCount: result.tradeCount,
    regimeAttribution: result.regimeAttribution,
    monteCarloSummary: result.monteCarlo,
    source: 'PUB_CRYPTO'
  };
}
