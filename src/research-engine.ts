import type { Evidence, MarketSnapshot, ResearchRun } from './domain.js';

export interface ResearchProvider {
  collect(snapshot: MarketSnapshot): Promise<Evidence[]>;
}

export class ResearchEngine {
  constructor(private readonly provider: ResearchProvider) {}

  async run(snapshot: MarketSnapshot, strategyVersion: string, researchRunId = `research:${snapshot.snapshotId}`): Promise<ResearchRun> {
    const evidence = await this.provider.collect(snapshot);
    const contradictions = evidence.filter((item) => item.kind === 'NEWS' && item.value !== undefined && item.value < 0).map((item) => item.evidenceId);
    return {
      researchRunId,
      snapshotId: snapshot.snapshotId,
      thesis: 'Research output is provisional until validation gates are satisfied.',
      evidence,
      contradictions,
      uncertainty: evidence.length === 0 ? 'NO_EVIDENCE' : 'PROVISIONAL',
      strategyVersion
    };
  }
}

export class FixtureResearchProvider implements ResearchProvider {
  async collect(snapshot: MarketSnapshot): Promise<Evidence[]> {
    return [{
      evidenceId: `market:${snapshot.snapshotId}`,
      kind: 'MARKET',
      source: snapshot.source,
      observedAt: snapshot.asOf,
      summary: `Price ${snapshot.price} from ${snapshot.candles.length} candles.`,
      value: snapshot.price
    }];
  }
}
