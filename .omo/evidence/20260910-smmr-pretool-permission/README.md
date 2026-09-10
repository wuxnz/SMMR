# SMMR pre-tool permission evidence

## What was tested

- Focused OpenCode session-lifecycle tests for the pre-tool permission check.
- OpenCode adapter typecheck and full repository build.

## What was observed

- Local planned skills pass the pre-tool check.
- Research and memory-write planned skills fail before host tool execution when their permissions are disabled.
- Enabling the corresponding permission allows the check to pass.

## Why it is enough

The guard runs before the legacy OpenCode `tool.execute.before` handler, closing the previous post-execution-only permission gap for the active SMMR skill.

## What was omitted

No live provider request or external research operation was used.
