# SMMR bounded evidence content evidence

## What was tested

- Focused OpenCode lifecycle tests.
- `bun run --cwd packages/omo-opencode typecheck`.
- `git diff --check`.

## What was observed

- Successful tool evidence contains a bounded output excerpt.
- The excerpt is capped at 2,000 characters before entering controller state.
- Failed output still records neither progress nor evidence.

## Why it is enough

This preserves useful verification context while enforcing a deterministic
retention bound at the adapter boundary.

## What was omitted

No live provider request or credentials were used.
