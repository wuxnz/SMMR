# SMMR model routing evidence

## What was tested

- Focused model-routing tests.
- `bun run --cwd packages/omo-opencode typecheck`.
- `git diff --check`.

## What was observed

- Configured `ollama:qwen3.5:4b` routes to provider `ollama` and model
  `qwen3.5:4b` for an active SMMR session.
- Canonical `provider/model` syntax is accepted; malformed or unknown sessions
  are left unchanged.
- README now describes the actual routing behavior.

## Why it is enough

The override is gated by the active SMMR session map and never affects legacy
sessions or disabled SMMR configuration.

## What was omitted

No live provider request was made; no credentials or network access were used.
