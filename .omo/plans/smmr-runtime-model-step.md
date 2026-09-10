# SMMR runtime model step plan

- Add a normalized model-completion helper to `SmmrRuntimeSession`.
- Require an enabled session and configured model, then route completion through the local operation boundary.
- Add deterministic mock-adapter coverage and update README/evidence.
