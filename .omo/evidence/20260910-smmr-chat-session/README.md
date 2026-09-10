# SMMR OpenCode chat-session bridge evidence

## What was tested

- `bun install --frozen-lockfile` in the isolated worktree.
- `bun run --cwd packages/omo-opencode typecheck`.
- `bun test packages/omo-opencode/src/plugin/smmr-chat-session.test.ts`.
- `bun run build`.
- Disposable OpenCode run with an enabled SMMR project config was attempted;
  its model call stopped because no provider was configured.

## What was observed

- The adapter compiles with `@smmr/core` and the full repository build passes.
- 2 focused session-bridge tests passed with 8 assertions, covering explicit
  creation, disabled/empty input, and duplicate session suppression.
- Enabled chat messages now create one `SmmrRuntimeSession` per OpenCode
  session from the first non-empty objective; absent/disabled config remains
  inert by construction.
- The attempted container run produced the expected provider error but did not
  expose the plugin log artifact needed to prove the new session log line.

## Why it is enough

The typecheck and full build cover the new adapter dependency and hook wiring.
The live result is recorded honestly as incomplete runtime evidence; this PR
must not merge until the plugin-specific session event is captured.

## What was omitted

No merge was performed and no provider credentials were used. No secrets or
environment dumps were captured.
