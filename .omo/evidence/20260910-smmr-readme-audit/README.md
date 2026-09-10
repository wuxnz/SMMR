# SMMR README consistency evidence

## What was tested

- Audited README implementation claims against the merged SMMR core and
  OpenCode adapter surfaces on `origin/dev`.
- Ran `bun test packages/smmr-core/src`.
- Ran `git diff --check`.

## What was observed

- README now states that OpenCode consumes the opt-in policy and next-skill
  selection rather than calling startup recognition entirely staged.
- README names `runNextSkill` and successful-tool advancement.
- README roadmap stage 9 reflects the current host integration boundary while
  retaining the remaining specialized adapter work.
- Core package tests pass.

## Why it is enough

This is a documentation-only consistency correction. The statements are
anchored to the merged runtime-session and OpenCode lifecycle implementations.

## What was omitted

No runtime code changed, so no live harness QA was required.
