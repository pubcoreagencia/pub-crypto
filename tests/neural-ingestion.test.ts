import { describe, expect, it, vi } from 'vitest';
import type { NeuralValidationArtifact } from '../src/neural-validation.js';
import { PubNeuralIngestionClient, type NeuralSqlExecutor } from '../src/neural-ingestion.js';

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

describe('PubNeuralIngestionClient', () => {
  it('uses the governed session and append_event path', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] }) // idempotency lookup
      .mockResolvedValueOnce({ rows: [{ token: 'opaque-token' }] }) // session
      .mockResolvedValueOnce({ rows: [{ attached: true }] }) // attach
      .mockResolvedValueOnce({ rows: [{ global_sequence: 42 }] }) // append
      .mockResolvedValueOnce({ rows: [] }); // idempotency record

    const client = new PubNeuralIngestionClient(
      { query } satisfies NeuralSqlExecutor,
      { actorId: 'actor:pub-crypto:ingestor', machineSecret: 'secret', projectId: 'pub-crypto' }
    );

    const result = await client.ingestTradingValidation(artifact, 'abcdef1234567');

    expect(result.globalSequence).toBe(42);
    expect(result.idempotentReplay).toBe(false);
    expect(query.mock.calls.map((call) => call[0])).toEqual([
      expect.stringContaining('neural_idempotency_records'),
      expect.stringContaining('establish_session_context'),
      expect.stringContaining('attach_session'),
      expect.stringContaining('append_event'),
      expect.stringContaining('neural_idempotency_records')
    ]);
  });

  it('replays an existing idempotency record without appending another event', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({
        rows: [{
          idempotency_key: 'existing',
          resulting_event_id: '11111111-1111-5111-8111-111111111111',
          response_payload: {}
        }]
      })
      .mockResolvedValueOnce({ rows: [{ global_sequence: 7 }] });

    const client = new PubNeuralIngestionClient(
      { query } satisfies NeuralSqlExecutor,
      { actorId: 'actor:pub-crypto:ingestor', machineSecret: 'secret' }
    );

    const result = await client.ingestTradingValidation(artifact, 'abcdef1234567');

    expect(result.idempotentReplay).toBe(true);
    expect(result.globalSequence).toBe(7);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('fails closed when lineage is incomplete', async () => {
    const query = vi.fn();
    const client = new PubNeuralIngestionClient(
      { query } satisfies NeuralSqlExecutor,
      { actorId: 'actor:pub-crypto:ingestor', machineSecret: 'secret' }
    );

    await expect(client.ingestTradingValidation(artifact, 'x')).rejects.toThrow('INVALID_SOURCE_COMMIT');
    expect(query).not.toHaveBeenCalled();
  });
});
