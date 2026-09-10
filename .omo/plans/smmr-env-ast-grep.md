# SMMR ast-grep environment plan

1. Route ast-grep MCP project-cwd environment lookup through the canonical
   `SMMR_*` resolver with legacy OMO fallback.
2. Run the ast-grep MCP tests/typecheck and a direct precedence audit.
3. Record evidence and merge the focused identity-migration PR.
