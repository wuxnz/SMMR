# SMMR evidence redaction evidence

## What was tested

- Focused OpenCode lifecycle tests covering bearer and key-shaped output.
- OpenCode adapter typecheck and full repository build.

## What was observed

- Credential-shaped values are replaced before successful tool output enters controller evidence.
- The existing 2,000-character excerpt bound remains in force.

## Why it is enough

This protects the new evidence retention path at the adapter boundary while preserving bounded diagnostic context.

## What was omitted

No live provider request or real credential was used.
