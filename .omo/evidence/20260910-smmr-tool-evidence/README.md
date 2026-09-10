# OpenCode SMMR evidence capture evidence

## What was tested

- Focused lifecycle tests with an isolated preload.
- `bun run --cwd packages/omo-opencode typecheck`.
- `git diff --check`.
- `bun run build`.

## What was observed

- Lifecycle tests: 3 passed, 0 failed.
- A successful OpenCode tool completion advances the active session and records
  one verified observation in the SMMR controller evidence list.
- Failed tool output does not advance or record evidence.
- Adapter typecheck and full build completed successfully.

## Why it is enough

The adapter now turns a real successful tool lifecycle into durable,
controller-owned evidence while preserving the failure boundary. The evidence
is structured using `@smmr/core` rather than an adapter-specific format.

## What was omitted

No real provider request or credentials were used. No claim is made about
model-generated evidence quality.
