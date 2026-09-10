# SMMR config contract plan

1. Add a typed root `smmr` configuration contract with disabled-by-default
   controller activation and explicit local/network/memory/research permissions.
2. Include the contract in layered, profile, and resolved config schemas without
   changing legacy OmO defaults.
3. Add schema tests for opt-in behavior, defaults, and malformed values.
4. Run focused config tests and typecheck, record evidence, and merge by PR.
