# SMMR system-policy evidence

## What was tested

- Focused policy test with an isolated preload.
- `bun run --cwd packages/omo-opencode typecheck`.
- `git diff --check`.
- `bun run build`.
- Disposable `omo-qa` container: `opencode debug config` with the branch-built
  plugin mounted through a local `file:///` plugin entry.

## What was observed

- Policy test: 1 passed, 0 failed.
- Adapter typecheck and full build exited 0.
- The policy is absent for unknown sessions and includes the active `DISCOVER`
  state plus the canonical foundational skill registry for an SMMR session.
- OpenCode resolved the branch-built plugin in the disposable container.

## Why it is enough

The new system transform callback is session-scoped and idempotent, so legacy
OpenCode sessions remain unchanged while enabled SMMR sessions receive the
operating policy. The focused test covers the session boundary; build and live
config loading cover adapter integration.

## What was omitted

No real provider request or credentials were used. Full model-turn behavior
was not claimed because the fake provider was not exercised in this check.
