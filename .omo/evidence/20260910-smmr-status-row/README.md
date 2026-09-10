# SMMR status-row documentation evidence

## What was tested

- Compared the README identity-foundation row with the merged
  `create-plugin-module.ts` startup migration wiring.
- Ran `bun test src` from `packages/smmr-core`.
- Ran `git diff --check`.

## What was observed

- The status row now says startup-wired migration, matching the merged
  OpenCode startup implementation.
- Core tests pass: 11 tests, 0 failures.

## Why it is enough

This is a documentation-only correction anchored to the implementation and
existing focused tests.

## What was omitted

No runtime code or harness configuration changed.
