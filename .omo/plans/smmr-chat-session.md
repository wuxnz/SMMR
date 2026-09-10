# SMMR chat session plan

1. Add `@smmr/core` as an OpenCode adapter dependency.
2. Create one harness-neutral runtime session per enabled OpenCode chat session
   from the first non-empty user objective.
3. Preserve disabled behavior and avoid duplicate session creation.
4. Typecheck, run focused adapter tests, record live QA evidence, and merge by
   PR.
