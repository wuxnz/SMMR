# SMMR OpenCode config bootstrap evidence

## What was tested

- `bun install --frozen-lockfile` in the isolated worktree.
- `bun test packages/omo-opencode/src/config/schema/smmr.test.ts packages/omo-opencode/src/config/validate.test.ts`
- `bun run --cwd packages/omo-opencode typecheck`

## What was observed

- 12 focused OpenCode config tests passed with 34 assertions.
- The OpenCode-facing schema accepts the strict `smmr` block and rejects
  unknown SMMR fields.
- Existing plugin config validation tests continue to pass.
- Startup now logs the explicit SMMR opt-in and permission boundary only when
  `smmr.enabled` is true; disabled or absent configuration remains inert.
- TypeScript typecheck passed.

## Why it is enough

This is the adapter bootstrap boundary: it proves configuration reaches the
OpenCode schema and startup lifecycle without enabling controller execution by
default. The remaining controller/skill wiring is intentionally documented as
unfinished rather than implied by this slice.

## What was omitted

Full live OpenCode QA was not run because this change adds no hook behavior or
controller execution; it only validates config and startup logging. No secrets
or environment dumps were captured.
