# SMMR tool-evidence documentation evidence

## What was tested

- Compared the README execution paragraph with the merged OpenCode lifecycle
  implementation in `smmr-session-lifecycle.ts`.
- Ran the existing focused lifecycle test suite.
- Ran `git diff --check`.

## What was observed

- README now states the actual invariant: successful tool completion advances
  and records controller-owned evidence; failed completion records neither.
- The focused adapter tests remain green: 3 passed, 0 failures.

## Why it is enough

This is documentation-only and directly reflects the already-tested adapter
behavior.

## What was omitted

No runtime code or harness configuration changed.
