# Live OpenCode runtime-session evidence

## What was tested

Inside the disposable `omo-qa` container:

- loaded the branch-built plugin through an absolute `file:///.../dist/index.js`
  project plugin entry;
- configured `.smmr/smmr.jsonc` with SMMR enabled and
  `model: "openai:gpt-fake"`;
- started the repository fake local model server with no real credentials;
- ran the real OpenCode CLI with `--model openai/gpt-fake` and the prompt
  `inspect the repository`.

## What was observed

The isolated `/tmp/oh-my-openagent.log` recorded:

```text
[smmr] runtime session created
{"sessionID":"ses_f7391c227ffeygqkV9BSzNEDXp","state":"DISCOVER","model":"openai:gpt-fake","allowNetwork":false,"allowMemoryWrites":false,"allowResearch":false}
```

The plugin loaded in the real OpenCode process and the chat lifecycle reached
the new session bridge. The fake server used no provider credentials.

## Why it is enough

This proves the adapter creates one SMMR runtime session from a real chat
objective, initializes the deterministic controller at `DISCOVER`, and carries
the configured model and permission boundary through the live lifecycle.

## What was omitted

No real network model call, credentials, or external provider was used. Fake
model output was not treated as evidence of model quality.
