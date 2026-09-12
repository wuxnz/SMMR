# Plan: SMMR specialized operation bridges

1. Map OpenCode tool names to the SMMR operation boundary for research,
   network, memory writes, and local work.
2. Enforce the mapped operation before tool execution and classify successful
   tool evidence into the corresponding Evidence Bundle section.
3. Add focused adapter tests for permission enforcement and evidence routing.
4. Run the focused OpenCode tests, typecheck, and diff validation; record
   reviewer-readable evidence before committing and opening a PR.

## Scope

This slice adds the host-side operation/evidence bridge. It does not claim to
implement provider-specific retrieval, research, verification, or durable
memory backends; those remain adapter work beyond the generic OpenCode hook.
