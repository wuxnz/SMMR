# SMMR README configuration evidence

## What was tested

- `bun test packages/omo-config-core/src/schema/smmr-config.test.ts`.
- `bun test packages/omo-opencode/src/config/schema/smmr.test.ts`.
- Reviewed the README example against `SmmrSettingsLayerSchema` and
  `SmmrSettingsSchema`.

## What was observed

- Both schema test files pass.
- The documented keys are strict-schema keys: `enabled`, `model`,
  `allow_network`, `allow_research`, and `allow_memory_writes`.
- Resolved defaults keep all permissions disabled.

## Why it is enough

This is a documentation-only change, and the existing schema tests validate the
machine-readable contract used by the example.

## What was omitted

No live harness was started because no runtime code changed.
