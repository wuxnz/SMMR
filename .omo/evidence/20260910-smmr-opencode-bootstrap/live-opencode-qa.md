# Live OpenCode QA evidence

## What was tested

Inside the disposable `omo-qa` container:

- built branch plugin: `dist/index.js`;
- configured project plugin with an absolute `file:///.../dist/index.js` path;
- configured `/tmp/p/.smmr/smmr.jsonc` with `smmr.enabled=true`, model
  `ollama:qwen3.5:4b`, and all three permissions false;
- ran `opencode run --print-logs --format json "say hello"` with isolated
  HOME/XDG directories.

## What was observed

The isolated `/tmp/oh-my-opencode.log` recorded:

```text
[smmr] opt-in configuration detected; controller startup integration is staged
{"model":"ollama:qwen3.5:4b","allowNetwork":false,"allowMemoryWrites":false,"allowResearch":false}
```

The same run recorded plugin loading, config migration completion, tool
registry construction, and normal disposal. The model request ended with the
expected `ProviderModelNotFoundError` because the disposable container had no
configured provider; no plugin startup failure occurred.

## Why it is enough

This proves the branch-built plugin is loaded by the real OpenCode executable,
reads the project SMMR config, and executes the new opt-in startup boundary in
an isolated filesystem. The existing focused tests cover schema validation and
disabled behavior.

## What was omitted

No real provider credentials or network model call was used. The provider
error was intentionally retained as an environment limitation, not treated as
an SMMR startup failure.
