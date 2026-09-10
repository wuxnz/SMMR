# SMMR pre-tool permission plan

- Add a harness-neutral helper that checks the active planned skill's operation before host execution.
- Invoke it from the OpenCode `tool.execute.before` boundary before legacy handlers run.
- Add focused tests for local, research, and memory-write permissions.
- Revise README status wording and record focused QA evidence.
