# SMMR controller bundle evidence

## What was tested

- Core controller and runtime-session tests.
- Core typecheck and diff validation.

## What was observed

- Recorded Evidence Bundles appear in controller snapshots.
- Runtime recording defensively copies caller-owned bundle collections.
- Existing flat evidence, workflow, retry, and permission behavior remains passing.

## Why it is enough

Retrieval and research adapters now have a durable controller-owned destination for structured bundles, rather than an adapter-local return value.

## What was omitted

No host adapter or live provider was exercised; this is a harness-neutral core change.
