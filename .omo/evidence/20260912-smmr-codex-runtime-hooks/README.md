# SMMR Codex runtime hook evidence

## What was tested

- `npm run --workspace components/smmr test`
- `npm run --workspace components/smmr build`
- `npm run build` from `packages/omo-codex/plugin`
- `npm test` from `packages/omo-codex/plugin`
- Isolated Codex QA in the disposable `omo-qa` container with
  `OMO_SKIP_MATERIALIZE=1`:
  - `hook-unit-probe.sh --self-test`
  - `install-verify.sh --self-test`
  - `app-server-drive.sh --plugin`

## What was observed

- Component tests: 4 passed.
- Aggregate Codex plugin tests: 337 passed, 0 failed.
- The local component bundled successfully into `components/smmr/dist/cli.js`.
- Install verification passed: the isolated config enabled `omo@sisyphuslabs`,
  linked component bins and agent TOMLs, and reported the real `~/.codex` as
  unchanged/absent.
- The first-party app-server turn completed against the local mock model and
  reported `hook/started` and `hook/completed` for
  `user-prompt-submit-smmr.json`.
- Raw captured outputs are in `install-verify.txt` and
  `app-server-drive.json` in this directory.

## Why it is enough

The component contract, aggregate packaging, isolated installation, and live
Codex hook dispatch are all covered. The hook remains opt-in because it exits
inertly when the resolved `smmr.enabled` setting is false.

## What was omitted

The live mock turn used the default disabled SMMR config, so it proves hook
dispatch rather than an enabled model/tool sequence. Provider-specific
retrieval, research, verification, and durable-memory backends remain outside
this generic Codex bridge.
