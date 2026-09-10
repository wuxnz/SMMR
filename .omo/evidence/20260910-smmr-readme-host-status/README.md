# SMMR README host-status evidence

## What was tested

- Inspected merged origin/dev state after PRs #20, #21, and #23.
- `git diff --check`.
- Searched README for host-integration, opt-in, per-chat session, and legacy
  compatibility claims.

## What was observed

- Host integration is documented as `In progress`, not planned.
- README states that OpenCode creates an enabled per-chat runtime session at
  `DISCOVER` while Codex/Senpi consumption remains future work.
- README no longer claims that OpenCode host integration is entirely pending.
- The remaining full skill-pipeline work is explicitly called out.

## Why it is enough

This is a documentation-only reconciliation against merged implementation and
live evidence already recorded by the adapter PRs. No runtime behavior changes.

## What was omitted

No harness was started for this documentation-only change. No secrets or
environment dumps were captured.
