# SMMR config contract evidence

## What was tested

- `bun install --frozen-lockfile` in the isolated worktree.
- `bun test packages/omo-config-core/src/schema/smmr-config.test.ts packages/omo-config-core/src/schema/unified-config-schema.test.ts`
- `bun run --cwd packages/omo-config-core typecheck`

## What was observed

- 8 focused schema tests passed with 23 assertions.
- The new root `smmr` block accepts explicit opt-in, model selection, and
  permission settings.
- Resolved defaults keep SMMR disabled and deny network, memory writes, and
  research.
- Unknown SMMR settings are rejected by the strict schema.
- Existing unified config schema tests continue to pass.

## Why it is enough

This change adds only the shared typed contract and documentation. It does
not claim controller startup integration; the README explicitly leaves that
work in the host-integration phase.

## What was omitted

No live host QA was run because no adapter lifecycle or runtime hook changed.
No secrets or environment dumps were captured.
