# OpenCode SMMR tool-advance evidence

## What was tested

- Focused lifecycle tests with an isolated preload.
- `bun run --cwd packages/omo-opencode typecheck`.
- `git diff --check`.
- `bun run build`.

## What was observed

- Lifecycle tests: 3 passed, 0 failed.
- A successful OpenCode tool completion advances the active SMMR session via
  `runNextSkill`; an absent output (failed tool completion) leaves state intact.
- Adapter typecheck and full build completed successfully.
- Permission failures are caught and logged without breaking the legacy tool
  completion hook.

## Why it is enough

The adapter now consumes a real OpenCode lifecycle event and preserves the
core success invariant. The wrapper is additive and leaves non-SMMR sessions
and existing tool hooks unchanged.

## What was omitted

No real provider request or credentials were used. The focused lifecycle test
is the direct behavior proof; full model-turn QA was not claimed.
