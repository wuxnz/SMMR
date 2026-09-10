# SMMR Evidence Bundle bound evidence

## What was tested

- Core Evidence Bundle tests and typecheck.
- Diff validation.

## What was observed

- Retrieval context is capped at the exported 12,000-character core limit.
- Existing normalization, defensive copies, and controller snapshot isolation remain passing.

## Why it is enough

The bound is enforced at the shared contract, so adapters cannot accidentally reintroduce unbounded prompt/context retention.

## What was omitted

No host adapter or live provider was exercised.
