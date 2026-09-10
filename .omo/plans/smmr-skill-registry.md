# SMMR skill registry plan

1. Define the canonical six foundational SMMR skills and their required
   runtime operation in `@smmr/core`.
2. Expose the registry through `SmmrRuntimeSession` without loading harness
   APIs or skill files at runtime.
3. Add registry/session tests and document the contract in README.
4. Run focused tests/typecheck, record evidence, and merge.
