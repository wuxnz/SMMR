# SMMR

**Skills, MCP, Memory, and Retrieval for local software engineering agents.**

SMMR is a model-agnostic intelligence layer for coding agents. Its primary
goal is to make small local models—especially Ollama-compatible 4B models—more
reliable on real repository work by moving workflow discipline out of the
model and into deterministic software.

> SMMR does not claim to turn a 4B model into a frontier model. It gives a
> small model a better operating loop: discover, retrieve, research, plan,
> implement, execute, diagnose, verify, and remember.

This repository is an active SMMR fork of oh-my-openagent. The existing OmO
runtime remains available while the SMMR layer is built incrementally behind
stable package and adapter boundaries.

## Why SMMR exists

Small coding models usually fail less because they cannot emit code and more
because they lose the task process: they skip repository discovery, invent
APIs, write code before tests, repeat a failed repair, or declare success
without evidence.

SMMR makes those responsibilities explicit:

```text
user task
   │
   ▼
deterministic controller
   │  budgets · state · loop detection · reflection
   ├── skills       procedural workflows
   ├── retrieval    repository, tests, docs, experience
   ├── memory       episodic, semantic, procedural knowledge
   └── research     external sources and citations
   │
   ▼
normalized model protocol
   │  Ollama, other local endpoints, or frontier escalation
   ▼
execution and verification
   │  edit · build · test · diagnose · repair · retest
   ▼
evidence and trajectory
```

The controller owns the process. The model makes judgments inside the current
bounded step.

The shared skill bundle now includes the six foundational policies used by
future host adapters:

- `smmr-operating` — bounded state transitions, permissions, and evidence;
- `smmr-research-first` — cited, budgeted external research;
- `smmr-repository-analysis` — repository mapping before edits;
- `smmr-test-first` — observable behavior and focused verification;
- `smmr-debug-and-repair` — classified failures and bounded retries;
- `smmr-memory-management` — evidence-gated episodic, semantic, and procedural memory.

These are harness-neutral skill assets. OpenCode recognizes them through the
opt-in session policy and consumes the controller's next-skill selection;
specialized host operations still need to be wired to each skill.
The canonical registry in `@smmr/core` maps each skill to its required
operation: research requires `research` permission, memory management requires
`memory-write`, and the remaining four are local operations.

The harness-neutral runtime boundary is now available as
`SmmrRuntimeSession` in `@smmr/core`. It combines the opt-in settings with a
deterministic controller, exposes the selected model and permission decisions,
and remains inert until `smmr.enabled` is explicitly true. Host adapters can
own this session without importing a harness API.

The session exposes bounded `advance`, `retry`, `reflect`, and `recordEvidence`
operations, plus `runNextSkill` for permission-checked execution of the current
skill with post-success advancement. Adapters must pass external work through
this boundary instead of silently bypassing SMMR permissions.

## Current status

SMMR is under active implementation. The harness-neutral intelligence-layer
slices are merged and independently testable:

| Layer | Status | Current surface |
| --- | --- | --- |
| Controller | Implemented | `@smmr/core` deterministic workflow, budgets, loop detection, reflections, evidence |
| Models | Implemented | `@smmr/models` normalized protocol, Ollama adapter, deterministic mock adapter |
| Memory | Implemented | `@smmr/memory` policy, scoring, decay, bounded store; backed by existing memory foundation |
| RAG | Implemented | `@smmr/rag` lexical ranking, document graph, related-test mapping, and bounded evidence context |
| Execution | Implemented | `@smmr/execution` verification checks, failure taxonomy, bounded retries, and repair hints |
| Research | Implemented | `@smmr/research` bounded provider contract, deduplication, citations, and evidence budgets |
| Evaluation | Implemented | `@smmr/eval` trajectory recording, verification metrics, and aggregate run statistics |
| Training | Implemented | `@smmr/training` deterministic filtering, SFT message conversion, and JSONL export scaffolds |
| Identity foundation | In progress | additive launcher/env identity, canonical config reads, startup-wired no-clobber migration, `.smmr/rules`, boulder-state, and team paths |
| Host integration | In progress | opt-in `smmr` config, OpenCode startup boundary, per-chat `SmmrRuntimeSession` creation, deterministic next-skill planning, permission-checked execution and evidence capture after successful tool completions, and per-session operating-policy injection; host adapters still need to wire specialized external operations |

The SMMR packages remain harness-neutral. The OpenCode adapter now consumes the
contract without changing legacy behavior when SMMR is disabled; Codex and
Senpi adapter consumption remains future work.

The implementation boundary is intentionally split:

| Surface | Current state |
| --- | --- |
| Harness-neutral SMMR packages | Core controller, model, memory, retrieval, execution, research, evaluation, training, and snapshot-isolated Evidence Bundle contracts are implemented and independently tested; RAG, research, memory, and verification convert results into controller-owned bundles, evaluation trajectories, and bounded training exports. |
| OpenCode runtime | Opt-in sessions, model routing, policy injection, pre-tool permission checks, successful-tool advancement, and bounded redacted flat and structured evidence are wired. |
| OpenCode specialized operations | Direct retrieval, research-provider, verification, and durable-memory adapters remain in progress. |
| Codex and Senpi | Existing compatibility runtimes remain available, but they do not consume the SMMR config block yet. |

## Architecture

The target v0.1 flow is:

```text
DISCOVER → UNDERSTAND → RESEARCH → RETRIEVE → PLAN → TEST_FIRST
    → IMPLEMENT → EXECUTE → DIAGNOSE → REPAIR → VERIFY → REVIEW → MEMORIZE
```

The controller can terminate with `COMPLETE` or `BLOCKED`. Step budgets,
retry budgets, and repeated-action detection prevent an underpowered model
from spending an unbounded run on the same failing action.

### Model protocol

`@smmr/models` gives every provider the same request/response shape:

- ordered system, user, assistant, and tool messages;
- normalized tool calls and finish reasons;
- capability descriptors for tool calling, vision, streaming, and context;
- usage accounting when the provider supplies token counts;
- injectable fetch and deterministic mock adapters for tests.

The first runtime adapter targets the native Ollama `/api/chat` endpoint. A
local model can therefore be tested without requiring a cloud account:

```text
Ollama endpoint → normalized SMMR response → controller step
```

The adapter does not silently fall back to a network provider.

### Memory and retrieval

SMMR separates three kinds of durable knowledge:

- **Episodic:** what happened during a task, including failures and repairs.
- **Semantic:** reusable facts about a repository, tool, or API.
- **Procedural:** verified workflows that should become skills.

Memory writes require stronger evidence than memory reads. Retrieval will
combine lexical matches, code structure, related tests, external examples, and
previous successful trajectories rather than relying on embeddings alone.

## Compatibility runtime

Until host integration is complete, the original oh-my-openagent runtime is
still the supported end-to-end installation surface. It provides OpenCode,
Codex CLI, and Senpi editions with the existing OmO commands and configuration
names.

### OpenCode / Ultimate edition

```bash
bunx oh-my-openagent install
```

### Codex CLI / Light edition

```bash
npx lazycodex-ai install
```

### Senpi / native beta edition

```bash
npm i -g omo-ai@beta
omo
```

The compatibility package also exposes an additive `smmr` launcher alias. The
alias does not rename or remove the existing OmO commands.

These commands install the compatibility runtime. SMMR remains opt-in: add a
root `smmr` block with `enabled: true` to activate the OpenCode per-chat
session bridge. Codex and Senpi do not consume this block yet.

For a project-local OpenCode opt-in, create `.smmr/smmr.jsonc` (or place the
same block in the compatible `.omo/omo.jsonc` configuration):

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

All permissions default to `false`, even when SMMR is enabled. Local
repository work remains available; set `allow_research` for external research,
`allow_network` for network-backed operations, and `allow_memory_writes` only
when verified experience may be persisted. The configured model is applied to
enabled OpenCode SMMR chat requests using `provider:model` or `provider/model`
syntax; it does not silently fall back to a network provider. Malformed model
identifiers are rejected by the configuration schema. Remove the block or set
`enabled: false` to restore the
legacy host-only behavior.

## Local-first design goals

The SMMR target defaults are:

- local model endpoint first;
- no telemetry by default;
- no network, browser, research, or memory write without explicit permission;
- provider-independent request and response contracts;
- evidence required before a task is considered verified;
- compatibility names retained during the migration window.

The compatibility runtime now keeps telemetry disabled unless configuration
explicitly enables it or `SMMR_SEND_ANONYMOUS_TELEMETRY=1/yes` is set. Legacy
`OMO_*` telemetry variables remain readable during migration.

The canonical SMMR config locations are `~/.smmr/smmr.json[c]` and project
`.smmr/smmr.json[c]` files. The compatibility runtime continues to read the
corresponding `.omo/omo.json[c]` files when no canonical file is present.
The shared config core also exposes a no-clobber, journaled migration primitive
for moving a legacy user file into `~/.smmr/smmr.jsonc`. OpenCode checks this
no-clobber migration during startup and records the result; an existing
canonical SMMR file is preserved.
Workspace rule discovery likewise prefers project and user `.smmr/rules`
directories, while retaining `.omo/rules` as a readable legacy source.
Boulder state now writes to `.smmr/boulder.json` and reads `.omo/boulder.json`
when no canonical state exists, preserving active work during migration.
Team specifications now use `.smmr/teams` and the canonical user `~/.smmr`
base by default, while discovery falls back to existing `.omo/teams` data.
Harness-neutral OpenClaw and ast-grep MCP runtime settings now prefer
`SMMR_*` environment names while retaining their `OMO_*` fallbacks.
These path changes are compatibility-aware library behavior; they do not yet
make the SMMR controller the default host runtime.

The config contract now reserves an opt-in root `smmr` block. Its resolved
defaults are `enabled: false`, `allow_network: false`,
`allow_memory_writes: false`, and `allow_research: false`; an optional
`model` selects the normalized SMMR provider. The block is accepted by the
shared config schema and surfaced by the OpenCode adapter. When enabled,
startup records the opt-in and permission boundary, and each enabled OpenCode
chat creates a deterministic runtime session at `DISCOVER`. The runtime can
now dispatch registered foundational skills through a pre-tool permission
boundary
and inject the bounded operating policy into that session's system context,
and deterministically selects the next foundational skill from the controller
state. `runNextSkill` gives adapters a bounded execution primitive that advances
only after success. OpenCode tool completions consume it and record a verified,
bounded, credential-redacted output excerpt in the controller-owned observation
for the active session; restricted research, memory-write, and known
network-capable tools are rejected before host tool execution, and failed
completions record neither progress nor evidence.
Specialized research, retrieval, verification, and memory operations still need
dedicated adapter wiring.

## Development

Install the repository dependencies with Bun:

```bash
bun install
```

Run the focused SMMR package checks:

```bash
bun test packages/smmr-core/src
bun run --cwd packages/smmr-core typecheck
bun test packages/smmr-models/src
bun run --cwd packages/smmr-models typecheck
bun test packages/smmr-memory/src
bun run --cwd packages/smmr-memory typecheck
bun test packages/smmr-rag/src
bun run --cwd packages/smmr-rag typecheck
bun test packages/smmr-execution/src
bun run --cwd packages/smmr-execution typecheck
bun test packages/smmr-research/src
bun run --cwd packages/smmr-research typecheck
bun test packages/smmr-eval/src
bun run --cwd packages/smmr-eval typecheck
bun test packages/smmr-training/src
bun run --cwd packages/smmr-training typecheck
```

The focused commands cover the merged harness-neutral packages. Run them from
the repository root after `bun install`; each package owns its public contract
and can be tested without starting an agent host.

The repository-wide test preload builds additional vendored harness assets.
When working on a harness-neutral SMMR package, use a package-local Bun config
for focused tests so unrelated host setup cannot mask package behavior.

Before modifying an adapter, read its `AGENTS.md` and run the matching live
QA skill. Changes under `packages/omo-opencode/`, `packages/omo-codex/`, or
`packages/omo-senpi/` require isolated harness evidence before merge.

## Roadmap

The detailed staged plan is in [`.omo/plans/smmr-refactor-master.md`](.omo/plans/smmr-refactor-master.md).
The public architectural direction is in [`ROADMAP.md`](ROADMAP.md), and the
system design rationale is in [`SMMR_PROJECT_OUTLINE.md`](SMMR_PROJECT_OUTLINE.md).

The implementation sequence is:

1. deterministic controller and normalized model protocol;
2. tripartite memory and write policy (`@smmr/memory`);
3. repository RAG and evidence bundles (`@smmr/rag`);
4. execution, diagnostics, and repair policies (`@smmr/execution`);
5. bounded research and citation capture (`@smmr/research`);
6. evaluation and trajectory metrics (`@smmr/eval`);
7. training scaffolds and trajectory export (`@smmr/training`);
8. additive identity foundation and local-first migration;
9. opt-in host integration, state-to-skill planning, and successful-tool
   advancement; specialized adapter operations remain in progress.

Each stage is delivered as a small, independently tested change. The old OmO
surface remains readable until the SMMR replacement has equivalent coverage.

## License and lineage

SMMR inherits the repository's existing licensing and third-party component
obligations. Review [`LICENSE.md`](LICENSE.md) and the notices for bundled
components before redistributing a modified build.

SMMR is based on oh-my-openagent, but it is not affiliated with OpenCode,
Ollama, OpenAI, Anthropic, or any model provider.
