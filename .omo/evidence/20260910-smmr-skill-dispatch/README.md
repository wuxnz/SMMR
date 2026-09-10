# SMMR skill dispatch evidence

## What was tested

- `bun test src` from `packages/smmr-core`.
- `bun run --cwd packages/smmr-core typecheck`.
- `git diff --check`.

## What was observed

- All 9 core tests pass.
- `SmmrRuntimeSession.runSkill` resolves registered skills and routes their
  declared operation through the existing permission checks.
- Research succeeds only when research permission is enabled; memory writes
  remain blocked without memory-write permission; unknown skills are rejected.
- README status now describes registry dispatch accurately.

## Why it is enough

The new method is a narrow harness-neutral boundary: adapters provide the
action, while SMMR owns skill identity and permission enforcement. Focused
tests cover success, denied operation, and unknown lookup.

## What was omitted

No live harness was started because this change is limited to `@smmr/core` and
README documentation. No secrets or environment dumps were captured.
