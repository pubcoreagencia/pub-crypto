import { describe, expect, it, vi } from 'vitest';
import type { NeuralValidationArtifact } from '../src/neural-validation.js';
import { PubNeuralIngestionClient, type NeuralSqlTransaction } from '../src/neural-ingestion.js';

const artifact: NeuralValidationArtifact = {
  artifactType: 'TRADING_VALIDATION',
  artifactVersion: 'v0',
  strategyVersion: 'strategy:v1',
  datasetVersion: 'dataset:v1',
  observedAt: 1750000000000,
  status: 'SHADOW_VALIDATED',
  totalReturnPct: 4.2,
  tradeCount: 10,
  regimeAttribution: [],
  monteCarloSummary: null,
  source: 'PUB_CRYPTO'
};

function transactionMock(responses: Array<{ rows: unknown[] }>) {
  const query = vi.fn();
  for (const response of responses) query.mockResolvedValueOnce(response);
  const transaction = vi.fn(async (fn: (tx: NeuralSqlTransaction) => Promise<unknown>) => fn({ query }));
  return { query, transaction };
}

describe('PubNeuralIngestionClient', () => {
  it('uses one transaction for session attachment and append_event', async () => {
    const db = transactionMock([
      { rows: [] },
      { rows: [] },
      { rows: [{ token: 'opaque-token' }] },
      { rows: [{ attached: true }] },
      { rows: [{ global_sequence: 42 }] },
      { rows: [] }
    ]);

    const client = new PubNeuralIngestionClient(
      db,
      { actorId: 'actor:pub-crypto:ingestor', machineSecret: 'secret', projectId: 'pub-crypto' }
    );

    const result = await client.ingestTradingValidation(artifact, 'abcdef1234567');

    expect(result.globalSequence).toBe(42);
    expect(result.idempotentReplay).toBe(false);
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledTimes(6);
    expect(db.query.mock.calls.map((call) => call[0])).toEqual([
      expect.stringContaining('neural_idempotency_records'),
      expect.stringContaining('neural_events'),
      expect.stringContaining('establish_session_context'),
      expect.stringContaining('attach_session'),
      expect.stringContaining('append_event'),
      expect.stringContaining('neural_idempotency_records')
    ]);
  });

  it('replays an existing idempotency record without appending another event', async () => {
    const db = transactionMock([
      { rows: [{ resulting_event_id: '11111111-1111-5111-8111-111111111111' }] },
      { rows: [{ global_sequence: 7 }] }
    ]);

    const client = new PubNeuralIngestionClient(
      db,
      { actorId: 'actor:pub-crypto:ingestor', machineSecret: 'secret' }
    );

    const result = await client.ingestTradingValidation(artifact, 'abcdef1234567');

    expect(result.idempotentReplay).toBe(true);
    expect(result.globalSequence).toBe(7);
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledTimes(2);
  });

  it('fails closed when lineage is incomplete', async () => {
    const db = transactionMock([]);

    const client = new PubNeuralIngestionClient(
      db,
      { actorId: 'actor:pub-crypto:ingestor', machineSecret: 'secret' }
    );

    await expect(client.ingestTradingValidation(artifact, 'x')).rejects.toThrow('INVALID_SOURCE_COMMIT');
    expect(db.transaction).not.toHaveBeenCalled();
  });
});
