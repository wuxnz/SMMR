# SMMR OpenCode next-skill planning evidence

## What was tested

- Focused system-policy test with an isolated preload.
- `bun run --cwd packages/omo-opencode typecheck`.
- `git diff --check`.
- `bun run build`.

## What was observed

- Policy test: 1 passed, 0 failed.
- Adapter typecheck passed.
- Full build completed successfully.
- The OpenCode policy now reports `Next skill: smmr-repository-analysis` for
  a new session at `DISCOVER`, and chat-session creation logs the same planned
  skill from `SmmrRuntimeSession.nextSkill()`.

## Why it is enough

This proves the host adapter consumes the core planner rather than merely
listing the registry. The policy remains session-scoped and permission-aware;
actual external skill work is still delegated to later adapter steps.

## What was omitted

No real provider request or credentials were used. No claim is made that the
full multi-step pipeline is complete yet.
