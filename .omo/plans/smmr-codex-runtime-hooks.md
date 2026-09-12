# Plan: Codex SMMR runtime hooks

1. Add a Codex plugin component that loads the unified `smmr` settings and
   persists one `SmmrRuntimeSession` snapshot per Codex session.
2. Inject the current bounded SMMR policy on `UserPromptSubmit`.
3. Enforce SMMR operation permissions on `PreToolUse` and advance/record
   bounded redacted evidence on successful `PostToolUse`.
4. Register the component in the aggregate Codex plugin build and hook manifest.
5. Add component tests, run the Codex unit gate and isolated codex-qa, update
   README status, and record evidence before merge.
