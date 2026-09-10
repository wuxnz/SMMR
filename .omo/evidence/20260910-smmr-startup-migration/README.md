# SMMR startup migration evidence

## What was tested

- `create-plugin-module.test.ts` with an isolated Bun test config.
- `bun run --cwd packages/omo-opencode typecheck`.
- `git diff --check`.

## What was observed

- All 15 startup-module tests pass.
- OpenCode invokes the no-clobber SMMR migration once per plugin-module
  lifetime and records its status/diagnostics through the startup logger.
- Existing legacy startup migration behavior remains green.
- Adapter typecheck passes.

## Why it is enough

The migration primitive is now connected to the actual OpenCode startup seam,
with dependency injection preserving deterministic tests and existing startup
behavior.

## What was omitted

The repository-wide preload build was not used because its vendored LSP setup
is independently unavailable in this environment; the focused test config
exercised the changed module directly. No real user config was touched.
