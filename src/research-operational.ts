import type { Evidence, MarketSnapshot, ResearchRun } from './domain.js';
import type { DatasetProvenance } from './data-provenance.js';

export interface OperationalResearchArtifact extends ResearchRun {
  provenance: DatasetProvenance;
  generatedAt: number;
  methodology: string;
}

function returns(snapshot: MarketSnapshot): number[] {
  const result: number[] = [];
  for (let i = 1; i < snapshot.candles.length; i++) {
    const previous = snapshot.candles[i - 1].close;
    const current = snapshot.candles[i].close;
    if (previous > 0) result.push((current - previous) / previous);
  }
  return result;
}

function mean(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export class DeterministicResearchProvider {
  async collect(snapshot: MarketSnapshot): Promise<Evidence[]> {
    const rs = returns(snapshot);
    const avgReturn = mean(rs);
    const volatility = rs.length > 1 ? Math.sqrt(mean(rs.map((r) => (r - avgReturn) ** 2))) : 0;
    const first = snapshot.candles[0]?.close ?? snapshot.price;
    const returnPct = first ? ((snapshot.price - first) / first) * 100 : 0;
    const trend = returnPct > 0 ? 'UP' : returnPct < 0 ? 'DOWN' : 'FLAT';
    return [
      {
        evidenceId: `trend:${snapshot.snapshotId}`,
        kind: 'MARKET',
        source: snapshot.source,
        observedAt: snapshot.asOf,
        summary: `Price trend ${trend} over ${snapshot.candles.length} candles.`,
        value: returnPct
      },
      {
        evidenceId: `volatility:${snapshot.snapshotId}`,
        kind: 'MARKET',
        source: snapshot.source,
        observedAt: snapshot.asOf,
        summary: 'Close-to-close population volatility of the observed sample.',
        value: volatility
      }
    ];
  }
}

export function buildOperationalResearch(input: {
  snapshot: MarketSnapshot;
  provenance: DatasetProvenance;
  evidence: Evidence[];
  strategyVersion: string;
  researchRunId?: string;
  generatedAt?: number;
}): OperationalResearchArtifact {
  const positive = input.evidence.filter((e) => e.kind === 'MARKET' && (e.value ?? 0) > 0);
  const negative = input.evidence.filter((e) => e.kind === 'MARKET' && (e.value ?? 0) < 0);
  const contradictions = positive.length && negative.length ? [...positive, ...negative].map((e) => e.evidenceId) : [];
  return {
    researchRunId: input.researchRunId ?? `research:${input.snapshot.snapshotId}`,
    snapshotId: input.snapshot.snapshotId,
    thesis: positive.length && !negative.length
      ? 'Observed market evidence is directionally positive; validation remains required.'
      : negative.length && !positive.length
        ? 'Observed market evidence is directionally negative; validation remains required.'
        : 'Evidence is mixed or insufficient; validation remains required.',
    evidence: input.evidence,
    contradictions,
    uncertainty: input.evidence.length === 0 ? 'NO_EVIDENCE' : 'PROVISIONAL',
    strategyVersion: input.strategyVersion,
    provenance: input.provenance,
    generatedAt: input.generatedAt ?? Date.now(),
    methodology: 'Deterministic close-to-close descriptive research. No predictive or profitability claim.'
  };
}
