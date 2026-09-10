# OpenClaw SMMR environment evidence

## What was tested

- `bun install --frozen-lockfile` in the isolated worktree to provision its
  dependencies.
- `bun test packages/openclaw-core/src/__tests__/dispatcher.test.ts packages/openclaw-core/src/__tests__/reply-listener-startup.test.ts`
- `bun run --cwd packages/openclaw-core typecheck`
- source audit ensuring the three migrated runtime reads no longer directly
  read `process.env.OMO_OPENCLAW_*` outside tests.

## What was observed

- 19 OpenClaw tests passed with 45 assertions.
- TypeScript typecheck passed.
- `SMMR_OPENCLAW_COMMAND_TIMEOUT_MS` takes precedence over the legacy
  `OMO_OPENCLAW_COMMAND_TIMEOUT_MS` value; legacy fallback remains tested.
- Debug and reply-listener startup timeout reads now use the same canonical
  SMMR resolver with OMO compatibility fallback.

## Why it is enough

The changed code is harness-neutral OpenClaw core. The focused tests exercise
the changed timeout path and startup module, while the source audit covers all
three migrated environment reads. No OpenCode adapter code was changed.

## What was omitted

No live OpenCode harness was started because this PR changes only the shared
OpenClaw core environment lookup. No secrets or environment dumps were
captured.
