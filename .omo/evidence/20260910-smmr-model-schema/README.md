# SMMR model-schema evidence

## What was tested

- Shared SMMR schema tests.
- OpenCode SMMR schema tests.
- `bun run --cwd packages/omo-opencode typecheck`.
- `git diff --check`.

## What was observed

- Valid `provider:model` and `provider/model` identifiers pass.
- A model without a provider separator is rejected before runtime routing.
- OpenCode and shared schemas enforce the same contract.
- README documents the early validation behavior.

## Why it is enough

The schema is the configuration boundary consumed by both the shared loader
and OpenCode adapter; both corresponding test suites cover the new rule.

## What was omitted

No live provider or harness request was made.
