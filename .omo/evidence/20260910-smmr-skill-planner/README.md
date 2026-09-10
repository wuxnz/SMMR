# SMMR state-to-skill planning evidence

## What was tested

- `bun test src` from `packages/smmr-core`.
- `bun run --cwd packages/smmr-core typecheck`.
- `git diff --check`.

## What was observed

- All 10 core tests pass.
- `DISCOVER` deterministically selects repository analysis, `RESEARCH`
  selects research-first, `DIAGNOSE` selects debug-and-repair, and terminal
  states select no skill.
- `SmmrRuntimeSession.nextSkill()` exposes the controller-selected skill at
  the current state.
- README status now distinguishes planning/dispatch from full execution.

## Why it is enough

The mapping is pure core logic, covers every non-terminal workflow state, and
is consumed through the runtime session rather than duplicated by adapters.
Focused tests cover representative local, permissioned, repair, and terminal
states.

## What was omitted

No live harness was started because this change is confined to `@smmr/core`
and README documentation. No secrets or environment dumps were captured.
