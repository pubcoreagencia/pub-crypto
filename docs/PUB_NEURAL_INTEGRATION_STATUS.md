# PUB Neural Integration Status V0

## Current state

PUB Crypto has a versioned `TRADING_VALIDATION` artifact contract.

PUB Neural has a corresponding governance contract for receiving that artifact while preserving provenance and promotion boundaries.

## Verified

- producer repository: `pubcoreagencia/pub-crypto`;
- artifact type: `TRADING_VALIDATION`;
- strategy version;
- dataset version;
- observation timestamp;
- validation status;
- trade count;
- regime attribution;
- Monte Carlo summary;
- source provenance;
- project-scoped promotion boundary.

## Not yet verified

The current connected GitHub surface does not expose enough verified runtime evidence to name the concrete PUB Neural ingestion endpoint, RPC, database function, or projector entrypoint.

Therefore PUB Crypto must not fabricate or hard-code an assumed ingestion path.

## Required next implementation

1. Verify the current PUB Neural runtime ingestion/projector path.
2. Identify its exact contract from code/tests/migrations.
3. Add the smallest PUB Crypto adapter against that real path.
4. Add an integration test using the actual contract.
5. Verify persisted provenance and promotion state.
6. Commit, publish and verify both repositories.

## Governance

Until those gates pass, the artifact remains a **prepared integration payload**, not evidence of successful Neural persistence.

No paper/live authorization depends on this artifact.


## Live database proof status — 2026-09-17

The real PUB Neural Supabase project was inspected directly. The `pub-crypto` holding project exists and is active. The canonical event log currently contains 39 events and the idempotency table contains 0 records.

A disposable E2E actor provisioning attempt was deliberately rejected by the database because `trusted_actors.originating_event_id` is mandatory. This is correct fail-closed behavior: creating an INGESTOR actor cannot bypass the governed actor-registration path.

Current trusted actors do not include an active PUB Crypto INGESTOR/CEO identity with credentials available to the runtime. Therefore no real `TRADING_VALIDATION` event was appended. No test event was left behind.

The graph projector checkpoint is HEALTHY but currently at global sequence 7, so there is also no evidence yet that it has processed a PUB Crypto validation event.

Next gate: provision a dedicated PUB Crypto INGESTOR through the governed actor-registration flow, provision its machine secret out-of-band, then execute the adapter against the real database and verify event, idempotency and projector state.
