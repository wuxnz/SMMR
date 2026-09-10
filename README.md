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

## Current status

SMMR is under active implementation. The first intelligence-layer slice is
merged:

| Layer | Status | Current surface |
| --- | --- | --- |
| Controller | Implemented | `@smmr/core` deterministic workflow, budgets, loop detection, reflections, evidence |
| Models | In progress | `@smmr/models` normalized protocol, Ollama adapter, deterministic mock adapter |
| Memory | In progress | `@smmr/memory` policy, scoring, decay, bounded store; backed by existing memory foundation |
| RAG | In progress | `@smmr/rag` lexical ranking, document graph, related-test mapping, and bounded evidence context |
| Execution | In progress | `@smmr/execution` verification checks, failure taxonomy, bounded retries, and repair hints |
| Research | In progress | `@smmr/research` bounded provider contract, deduplication, citations, and evidence budgets |
| Evaluation | Planned | trajectory metrics and SMMR-Bench |
| Host integration | Planned | opt-in SMMR configuration and OpenCode adapter wiring |

The SMMR packages are intentionally harness-neutral. They do not import
OpenCode, Codex, Senpi, or another host API. Host adapters will be added after
the core contracts are stable.

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

These commands install the compatibility runtime; they do not yet enable the
SMMR controller automatically. SMMR host integration is an explicit roadmap
item so the existing OmO behavior remains safe while the new contracts mature.

## Local-first design goals

The SMMR target defaults are:

- local model endpoint first;
- no telemetry by default;
- no network, browser, research, or memory write without explicit permission;
- provider-independent request and response contracts;
- evidence required before a task is considered verified;
- compatibility names retained during the migration window.

The current compatibility runtime predates these defaults and still has its
existing OmO telemetry/configuration behavior. Do not interpret the target
policy above as claiming that the legacy adapter has already been migrated.

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
```

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
6. evaluation, trajectory export, and training scaffolds;
7. opt-in host integration and local-first identity migration.

Each stage is delivered as a small, independently tested change. The old OmO
surface remains readable until the SMMR replacement has equivalent coverage.

## License and lineage

SMMR inherits the repository's existing licensing and third-party component
obligations. Review [`LICENSE.md`](LICENSE.md) and the notices for bundled
components before redistributing a modified build.

SMMR is based on oh-my-openagent, but it is not affiliated with OpenCode,
Ollama, OpenAI, Anthropic, or any model provider.
