# Install SMMR

SMMR is an opt-in intelligence layer for local software-engineering agents. It
adds a bounded workflow, retrieval, memory, research permissions, and evidence
collection around the existing compatibility runtime.

The supported end-to-end path today is OpenCode. The Codex CLI and Senpi
editions remain available as compatibility runtimes, but they do not consume
the SMMR configuration block yet.

## For humans: ask an agent to install SMMR

Paste this prompt into the coding-agent session where you want SMMR installed:

```text
Install and configure SMMR for this project by following the canonical
instructions here:
https://raw.githubusercontent.com/wuxnz/SMMR/dev/docs/guide/smmr-installation.md

Use the existing repository and preserve unrelated user changes. Before
editing, inspect the repository and determine whether OpenCode is available.
Install the compatibility runtime only if it is missing, enable SMMR explicitly
for this project, and verify the installation without exposing credentials.
Report the commands you ran, the files changed, and any remaining user action.
```

An agent should ask before enabling network-backed research or durable memory
writes. Those permissions are disabled by default.

## For agents

If a user asks you to install SMMR, fetch this document directly instead of
relying on a summary:

```bash
curl -fsSL https://raw.githubusercontent.com/wuxnz/SMMR/dev/docs/guide/smmr-installation.md
```

Follow this sequence:

1. Inspect the repository, its `AGENTS.md` files, and the current OpenCode
   installation. Preserve unrelated changes and existing credentials.
2. Install the compatibility runtime if it is not already available:

   ```bash
   bunx oh-my-openagent install
   ```

   Do not install the package globally with `npm -g`, `bun add -g`, or
   `bun install -g`. The supported installer is `bunx`.
3. Enable SMMR explicitly in the project. Create `.smmr/smmr.jsonc`:

   ```jsonc
   {
     "smmr": {
       "enabled": true,
       "model": "ollama:qwen3.5:4b",
       "allow_network": false,
       "allow_research": false,
       "allow_memory_writes": false
     }
   }
   ```

   Preserve an existing file and merge only the required `smmr` block. If the
   project intentionally uses the compatibility `.omo/omo.jsonc` location,
   the same block may be placed there instead.
4. Verify that OpenCode can load the installed runtime and that the SMMR block
   is enabled. Use the repository's available doctor or diagnostic command;
   never print API keys, auth files, or full environment dumps.
5. Explain what was installed, which configuration file was changed, what was
   verified, and whether the user must restart OpenCode.

Do not silently enable `allow_network`, `allow_research`, or
`allow_memory_writes`. Ask the user first because these permissions change what
the agent may access or persist.

## Manual installation

Install the compatibility runtime:

```bash
bunx oh-my-openagent install
```

Then create `.smmr/smmr.jsonc` in the project with an explicit opt-in:

```jsonc
{
  "smmr": {
    "enabled": true,
    "model": "ollama:qwen3.5:4b",
    "allow_network": false,
    "allow_research": false,
    "allow_memory_writes": false
  }
}
```

The model identifier uses `provider:model` or `provider/model` syntax. SMMR
does not silently fall back to a network provider. Remove the block or set
`enabled` to `false` to return to legacy host-only behavior.

## Verification checklist

- OpenCode starts with the compatibility runtime installed.
- The project contains an explicit `smmr.enabled: true` block.
- The configured local model is available, or the user knows what provider
  setup remains.
- Network, research, and memory-write permissions are still disabled unless the
  user explicitly approved them.
- No credentials or private configuration contents were copied into reports.

For background on the runtime and current feature boundaries, see the
[repository README](../../README.md) and the existing
[compatibility installation guide](./installation.md).
