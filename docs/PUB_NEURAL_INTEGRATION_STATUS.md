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
