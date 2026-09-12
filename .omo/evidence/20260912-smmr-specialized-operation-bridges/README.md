# SMMR specialized operation bridge evidence

## What was tested

- `bun test packages/omo-opencode/src/plugin/smmr-session-lifecycle.test.ts`
- `bun run --cwd packages/omo-opencode typecheck`
- `git diff --check`
- Isolated OpenCode QA container self-check via `script/agent/qa-docker.sh`.

The focused adapter tests exercised explicit classification for research,
network, memory-write, and local tools; permission rejection; successful-tool
advancement; redacted output capture; and structured evidence routing.

## What was observed

- 11 focused tests passed with 0 failures.
- Research and memory-write tools are rejected unless their SMMR permissions
  are enabled.
- Successful research/network evidence is stored in `externalDocs`, memory
  writes in `previousExperiences`, and local tools in `relevantFiles`.
- Typecheck and diff validation passed.
- The container self-check passed all dependency and XDG-isolation assertions.

## Why it is enough

The OpenCode lifecycle now makes specialized operation permissions and evidence
sections explicit at the host boundary, while preserving the existing
controller/session workflow. Provider-specific backends remain intentionally
outside this generic hook and are documented as residual work.

## What was omitted

No external provider, browser, or durable-memory backend was invoked. The
isolated SSE hook self-test did not reach a terminal result because its
temporary OpenCode server remained hung; its process was stopped and no live
hook result is claimed here. No real user configuration or database was used.
