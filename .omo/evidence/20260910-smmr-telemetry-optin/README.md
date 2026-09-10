# SMMR telemetry opt-in evidence

## What was tested

- `bun install --frozen-lockfile` in the isolated worktree.
- `bun test packages/omo-opencode/src/shared/posthog.test.ts`.
- `bun run --cwd packages/omo-opencode typecheck`.
- `bun run build`.
- Disposable OpenCode run loading the branch-built plugin with isolated HOME/XDG
  directories and `smmr.enabled=false`.

## What was observed

- 22 telemetry tests passed with 37 assertions.
- Omitted telemetry configuration produces no captured event.
- Canonical `SMMR_SEND_ANONYMOUS_TELEMETRY=1` enables telemetry; legacy OMO
  disable/opt-in behavior remains covered.
- Typecheck and full build passed.
- Real OpenCode loaded the branch plugin in the disposable run; the isolated
  plugin log recorded `plugin loading` and no provider credentials were used.

## Why it is enough

The focused suite directly tests the policy decision and transport boundary;
the live run proves the changed adapter still loads in OpenCode without
touching the host configuration or database. No telemetry was sent to a real
endpoint.

## What was omitted

No external provider or real PostHog endpoint was contacted. No secrets or
environment dumps were captured.
