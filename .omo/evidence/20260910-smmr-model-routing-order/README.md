# SMMR model-routing order evidence

## What was tested

- Reviewed the OpenCode chat-message pipeline and moved SMMR model application
  after the legacy handler.
- Reused the merged model-routing focused tests.
- Ran `bun run --cwd packages/omo-opencode typecheck` and `git diff --check`.

## What was observed

- SMMR model routing now runs after legacy chat-message mutations, making the
  explicit SMMR setting authoritative for enabled sessions.
- Existing model-routing tests remain green.
- Adapter typecheck passes.

## Why it is enough

The order change is isolated to the SMMR opt-in path and preserves legacy
behavior when SMMR is disabled.

## What was omitted

No provider request or credentials were used.
