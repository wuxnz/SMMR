# SMMR ast-grep environment evidence

## What was tested

- `bun install --frozen-lockfile` in the isolated worktree.
- `bun test packages/ast-grep-mcp/src`.
- `bun run --cwd packages/ast-grep-mcp typecheck`.
- source audit confirming no direct `OMO_AST_GREP_PROJECT_CWD` reads remain in
  the two runtime tool modules.

## What was observed

- 289 ast-grep tests passed, 26 environment-dependent tests were skipped, and
  701 assertions passed.
- TypeScript typecheck passed.
- Both scan and rewrite now resolve canonical `SMMR_AST_GREP_PROJECT_CWD`
  first, with the shared legacy `OMO_*` fallback preserved.

## Why it is enough

The change is limited to a harness-neutral MCP runtime and its two project-cwd
consumers. The complete package suite and source audit cover the migration
surface without requiring a host harness.

## What was omitted

Skipped tests are the package's pre-existing live-binary/fixture cases. No
secrets or environment dumps were captured.
