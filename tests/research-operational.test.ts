import { describe, expect, it } from 'vitest';
import { normalizeDataset, snapshotFromDataset } from '../src/data-provenance.js';
import { buildOperationalResearch, DeterministicResearchProvider } from '../src/research-operational.js';

const candles = [
  { timestamp: 3, open: 103, high: 105, low: 102, close: 104, volume: 10 },
  { timestamp: 1, open: 100, high: 102, low: 99, close: 101, volume: 10 },
  { timestamp: 2, open: 101, high: 104, low: 100, close: 103, volume: 10 }
];

describe('operational research foundation', () => {
  it('normalizes ordering and records deterministic provenance', () => {
    const dataset = normalizeDataset({ symbol: 'BTCUSDT', timeframe: '1h', source: 'fixture', datasetVersion: 'fixture-v2', candles });
    expect(dataset.candles.map((c) => c.timestamp)).toEqual([1, 2, 3]);
    expect(dataset.provenance.candleCount).toBe(3);
    expect(dataset.provenance.firstTimestamp).toBe(1);
    expect(dataset.provenance.lastTimestamp).toBe(3);
    expect(dataset.provenance.contentHash).toMatch(/^[0-9a-f]{8}$/);
  });

  it('rejects duplicate timestamps', () => {
    expect(() => normalizeDataset({
      symbol: 'BTCUSDT',
      timeframe: '1h',
      source: 'fixture',
      datasetVersion: 'bad',
      candles: [...candles, { ...candles[0] }]
    })).toThrow('DUPLICATE_TIMESTAMP');
  });

  it('builds grounded deterministic research evidence', async () => {
    const dataset = normalizeDataset({ symbol: 'BTCUSDT', timeframe: '1h', source: 'fixture', datasetVersion: 'fixture-v2', candles });
    const snapshot = snapshotFromDataset(dataset);
    const evidence = await new DeterministicResearchProvider().collect(snapshot);
    const artifact = buildOperationalResearch({
      snapshot,
      provenance: dataset.provenance,
      evidence,
      strategyVersion: 'strategy-v1',
      generatedAt: 123
    });
    expect(artifact.provenance.contentHash).toBe(dataset.provenance.contentHash);
    expect(artifact.generatedAt).toBe(123);
    expect(artifact.evidence.length).toBe(2);
    expect(artifact.uncertainty).toBe('PROVISIONAL');
  });
});
