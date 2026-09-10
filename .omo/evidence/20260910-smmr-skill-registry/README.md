# SMMR skill registry evidence

## What was tested

- `bun test src` from `packages/smmr-core`.
- `bun run --cwd packages/smmr-core typecheck`.
- `git diff --check`.

## What was observed

- The registry test passes and contains exactly the six canonical foundational
  skills.
- Research is mapped to `research`, memory management to `memory-write`, and
  the other skills to local execution.
- `SmmrRuntimeSession.skills` exposes the same immutable registry.
- Existing controller and runtime-session tests continue to pass.

## Why it is enough

The registry is pure `@smmr/core` data with no harness or filesystem imports.
Tests cover names, operation mapping, unknown lookup, and session exposure.

## What was omitted

No live harness was started because this PR changes only harness-neutral core
contracts. No secrets or environment dumps were captured.
