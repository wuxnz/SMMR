# SMMR README capability audit evidence

## What was tested

- Compared README capability statements with the current package manifests and OpenCode adapter wiring on `origin/dev`.
- Ran `git diff --check` after the documentation revision.

## What was observed

- The model configuration paragraph is grammatically complete.
- The new matrix distinguishes harness-neutral packages, OpenCode integration, and future Codex/Senpi integration.

## Why it is enough

The README now states the implementation boundary without presenting package-level primitives as complete host behavior.

## What was omitted

No source behavior changed in this documentation-only revision.
