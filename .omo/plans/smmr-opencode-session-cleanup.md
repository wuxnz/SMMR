# SMMR OpenCode session cleanup

1. Add a pure helper that removes deleted SMMR sessions across supported
   OpenCode event payload shapes.
2. Wrap the OpenCode event handler so cleanup runs after normal event handling.
3. Add focused tests for current, legacy, and ignored event shapes.
4. Run core adapter tests, typecheck, build, and isolated OpenCode QA; record
   evidence before opening the PR.
