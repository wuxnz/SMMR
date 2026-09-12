# SMMR controller restore evidence

## What was tested

- `bun test packages/smmr-core/src`
- `bun run --cwd packages/smmr-core typecheck`
- `git diff --check`

The tests cover validated snapshot restoration for workflow state, step/retry
counters, reflections, transitions, flat evidence, structured bundles, and
continued skill selection through `SmmrRuntimeSession`.

## What was observed

- 26 core tests passed with 0 failures.
- A restored controller continued from `UNDERSTAND` to `RESEARCH`.
- A restored runtime session retained its saved state and selected the same
  deterministic skill as a live session.
- Typecheck and diff validation passed.

## Why it is enough

Host adapters can now persist `ControllerSnapshot` and resume it through the
public core/runtime boundary without reconstructing private controller state.

## What was omitted

No Codex or Senpi hook was changed in this slice; live adapter QA is deferred
to the runtime bridge that consumes this restoration primitive.
