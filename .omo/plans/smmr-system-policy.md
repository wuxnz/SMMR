# SMMR system policy

1. Add a session-scoped operating-policy renderer using the canonical SMMR
   skill registry.
2. Inject the policy through OpenCode's existing system transform hook only for
   active SMMR sessions, with duplicate protection.
3. Add focused behavior coverage and revise README host-integration status.
4. Run adapter typecheck, full build, and isolated OpenCode loading QA; record
   evidence before merging.
