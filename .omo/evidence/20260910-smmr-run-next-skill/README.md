# SMMR bounded next-skill execution evidence

## What was tested

- `bun test src` from `packages/smmr-core`.
- `bun run --cwd packages/smmr-core typecheck`.
- `git diff --check`.

## What was observed

- All 11 core tests pass.
- `runNextSkill` executes the controller-selected skill and advances from
  `DISCOVER` to `UNDERSTAND` after success.
- A rejected adapter action leaves the session at `DISCOVER`.
- Permission and unknown-skill checks remain covered by the existing runtime
  tests.
- README documents the new bounded execution primitive and remaining adapter
  wiring work.

## Why it is enough

The primitive centralizes the critical success invariant: workflow advancement
cannot occur before the adapter action resolves. It is harness-neutral and
delegates the actual action to the host adapter.

## What was omitted

No live harness was started because this PR changes only `@smmr/core` and
README documentation. No secrets or environment dumps were captured.
