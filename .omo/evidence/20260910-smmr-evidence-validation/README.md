# SMMR evidence validation evidence

## What was tested

- Core controller tests for malformed evidence rejection and valid evidence acceptance.
- Core typecheck and diff validation.

## What was observed

- Empty IDs, claims, and content are rejected.
- Non-finite or out-of-range confidence is rejected.
- Valid verified evidence remains usable for evidence-first completion.

## Why it is enough

The controller cannot satisfy its completion invariant with structurally invalid evidence.

## What was omitted

No host adapter or live provider was exercised.
