# README adapter-status evidence

## What was checked

- `packages/omo-config-core/src/schema/config.ts` and `schema/smmr.ts` confirm
  the typed `smmr` block is part of the shared resolved configuration.
- `packages/omo-codex/plugin/shared/src/config-loader.ts` confirms Codex calls
  `loadOmoConfig({ harness: "codex" })` and returns the resolved config.
- `packages/omo-senpi/src/components/config-resolution/index.ts` confirms
  Senpi calls `loadOmoConfig({ harness: "senpi" })` and returns the resolved
  config after model resolution.
- `rg` audit found no Codex or Senpi construction of `SmmrRuntimeSession`.
- `git diff --check` passed.

## Conclusion

README now distinguishes shared-config loading from runtime activation. It no
longer claims Codex/Senpi ignore the SMMR block, and it continues to document
their missing runtime operation wiring as unfinished.

## What was omitted

No adapter code was changed, so no live Codex, Senpi, or OpenCode harness QA was
required for this documentation-only correction.
