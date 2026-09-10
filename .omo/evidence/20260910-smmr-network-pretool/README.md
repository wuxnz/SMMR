# SMMR network pre-tool evidence

## What was tested

- Focused OpenCode lifecycle tests for network-capable tool classification and permission checks.
- OpenCode adapter typecheck and full repository build.

## What was observed

- Known web/browser tool names are rejected before execution when `allow_network` is false.
- The same tools pass when network permission is explicitly enabled.
- Non-network local tools continue to use the active-skill permission check.

## Why it is enough

This closes the previously unused network permission at the OpenCode pre-tool boundary while keeping the classifier conservative and explicit.

## What was omitted

No live browser, network request, or external provider was used.
