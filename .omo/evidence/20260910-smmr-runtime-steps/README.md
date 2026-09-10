# SMMR runtime steps evidence

## What was tested

- `bun test src` from `packages/smmr-core`.
- `bun run --cwd packages/smmr-core typecheck`.
- `git diff --check`.

## What was observed

- Runtime session tests pass for disabled behavior, enabled construction,
  permission-gated research/network execution, and controller advancement.
- The session exposes controller transitions, retries, reflections, evidence,
  and operation permission checks without importing a harness API.
- TypeScript typecheck and whitespace validation pass.

## Why it is enough

This is a harness-neutral core API change. Tests directly exercise the new
adapter boundary and prove denied operations do not execute.

## What was omitted

No live host harness was started because this PR changes only `@smmr/core`.
No secrets or environment dumps were captured.
