# SMMR runtime session evidence

## What was tested

- `bun install --frozen-lockfile` in the isolated worktree.
- `bun test src` from `packages/smmr-core` using its package-local Bun test
  config.
- `bun run --cwd packages/smmr-core typecheck`.
- `git diff --check`.

## What was observed

- 6 SMMR core tests passed with 22 assertions.
- Disabled or absent settings create no controller and deny all external
  permissions.
- Explicit opt-in creates a controller at `DISCOVER`, preserves the selected
  model, and exposes permission decisions.
- TypeScript typecheck and whitespace validation passed.

## Why it is enough

The runtime session is harness-neutral and directly composes the existing
deterministic controller. Its tests cover the safety boundary and enabled
construction without claiming host-specific lifecycle wiring.

## What was omitted

No live harness QA was run because this PR changes only `@smmr/core` and its
README contract. No secrets or environment dumps were captured.
