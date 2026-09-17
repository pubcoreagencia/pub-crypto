import { createHash } from 'node:crypto';
import type { NeuralValidationArtifact } from './neural-validation.js';

export interface NeuralSqlTransaction {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export interface NeuralSqlExecutor {
  transaction<T>(fn: (tx: NeuralSqlTransaction) => Promise<T>): Promise<T>;
}

export interface NeuralIngestionConfig {
  actorId: string;
  machineSecret: string;
  trustZone?: string;
  projectId?: string;
  producerVersion?: string;
}

export interface NeuralIngestionResult {
  eventId: string;
  globalSequence: number;
  idempotencyKey: string;
  idempotentReplay: boolean;
}

function requestHash(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function deterministicEventId(idempotencyKey: string): string {
  const hex = createHash('sha256').update(idempotencyKey).digest('hex');
  const h = hex.slice(0, 32);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/**
 * Thin adapter over PUB Neural's verified PostgreSQL ingestion contract.
 *
 * The injected executor MUST keep every query in one database transaction.
 * PUB Neural's attach_session uses a transaction-local setting that must remain
 * attached when append_event executes.
 */
export class PubNeuralIngestionClient {
  constructor(
    private readonly db: NeuralSqlExecutor,
    private readonly config: NeuralIngestionConfig
  ) {}

  async ingestTradingValidation(
    artifact: NeuralValidationArtifact,
    sourceCommit: string
  ): Promise<NeuralIngestionResult> {
    if (!sourceCommit || sourceCommit.length < 7) throw new Error('INVALID_SOURCE_COMMIT');
    if (artifact.source !== 'PUB_CRYPTO') throw new Error('INVALID_ARTIFACT_SOURCE');
    if (!artifact.strategyVersion || !artifact.datasetVersion) throw new Error('MISSING_LINEAGE');

    const payload = {
      artifactType: artifact.artifactType,
      artifactVersion: artifact.artifactVersion,
      source: artifact.source,
      sourceRepository: 'pubcoreagencia/pub-crypto',
      sourceCommit,
      strategyVersion: artifact.strategyVersion,
      datasetVersion: artifact.datasetVersion,
      observedAt: artifact.observedAt,
      status: artifact.status,
      totalReturnPct: artifact.totalReturnPct,
      tradeCount: artifact.tradeCount,
      regimeAttribution: artifact.regimeAttribution,
      monteCarloSummary: artifact.monteCarloSummary
    };

    const idempotencyKey =
      `trading_validation:pubcoreagencia/pub-crypto:${sourceCommit}:${artifact.strategyVersion}:${artifact.datasetVersion}`;
    const hash = requestHash(payload);
    const eventId = deterministicEventId(idempotencyKey);

    return this.db.transaction(async (tx) => {
      const existing = await tx.query<{
        resulting_event_id: string | null;
      }>(
        'SELECT resulting_event_id FROM pub_neural.neural_idempotency_records WHERE idempotency_key = $1',
        [idempotencyKey]
      );

      if (existing.rows[0]?.resulting_event_id) {
        const event = await tx.query<{ global_sequence: number }>(
          'SELECT global_sequence FROM pub_neural.neural_events WHERE id = $1::uuid',
          [existing.rows[0].resulting_event_id]
        );
        return {
          eventId: existing.rows[0].resulting_event_id,
          globalSequence: event.rows[0]?.global_sequence ?? -1,
          idempotencyKey,
          idempotentReplay: true
        };
      }

      const existingEvent = await tx.query<{ global_sequence: number }>(
        'SELECT global_sequence FROM pub_neural.neural_events WHERE id = $1::uuid',
        [eventId]
      );

      if (existingEvent.rows[0]) {
        await tx.query(
          `INSERT INTO pub_neural.neural_idempotency_records
            (idempotency_key, actor_id, request_hash, resulting_event_id, response_payload, created_at, expires_at)
           VALUES ($1, $2, $3, $4::uuid, $5::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + interval '30 days')
           ON CONFLICT (idempotency_key) DO NOTHING`,
          [idempotencyKey, this.config.actorId, hash, eventId, JSON.stringify(payload)]
        );
        return {
          eventId,
          globalSequence: existingEvent.rows[0].global_sequence,
          idempotencyKey,
          idempotentReplay: true
        };
      }

      const session = await tx.query<{ token: string }>(
        'SELECT pub_neural.establish_session_context($1, $2, $3, $4) AS token',
        [
          this.config.actorId,
          this.config.machineSecret,
          this.config.trustZone ?? 'tz_internal_holding',
          this.config.projectId ?? 'pub-crypto'
        ]
      );
      const token = session.rows[0]?.token;
      if (!token) throw new Error('NEURAL_SESSION_NOT_ESTABLISHED');

      const attached = await tx.query<{ attached: boolean }>(
        'SELECT pub_neural.attach_session($1) AS attached',
        [token]
      );
      if (!attached.rows[0]?.attached) throw new Error('NEURAL_SESSION_ATTACH_FAILED');

      const streamId = `stream:trading-validation:${artifact.strategyVersion}:${artifact.datasetVersion}`;

      const appended = await tx.query<{ global_sequence: number }>(
        `SELECT pub_neural.append_event(
          p_event_id := $1::uuid,
          p_event_type := $2::varchar,
          p_stream_id := $3::varchar,
          p_stream_version := $4::bigint,
          p_producer_version := $5::varchar,
          p_payload := $6::jsonb,
          p_parent_event_ids := $7::uuid[],
          p_signature := $8::text
        ) AS global_sequence`,
        [
          eventId,
          'TRADING_VALIDATION',
          streamId,
          1,
          this.config.producerVersion ?? 'pub-crypto-neural:v0',
          JSON.stringify(payload),
          [],
          null
        ]
      );

      const globalSequence = appended.rows[0]?.global_sequence;
      if (globalSequence === undefined) throw new Error('NEURAL_EVENT_APPEND_FAILED');

      await tx.query(
        `INSERT INTO pub_neural.neural_idempotency_records
          (idempotency_key, actor_id, request_hash, resulting_event_id, response_payload, created_at, expires_at)
         VALUES ($1, $2, $3, $4::uuid, $5::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + interval '30 days')
         ON CONFLICT (idempotency_key) DO NOTHING`,
        [idempotencyKey, this.config.actorId, hash, eventId, JSON.stringify(payload)]
      );

      return { eventId, globalSequence, idempotencyKey, idempotentReplay: false };
    });
  }
}
