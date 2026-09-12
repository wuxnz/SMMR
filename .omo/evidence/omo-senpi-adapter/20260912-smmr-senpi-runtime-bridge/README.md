# SMMR Senpi runtime bridge QA

## What was tested

- `node packages/omo-senpi/scripts/qa/drive.mjs --self-test` tested the live-driver isolation harness.
- `node packages/omo-senpi/scripts/qa/drive.mjs` attempted the real Senpi adapter lane with output rooted here.
- Focused component tests covered disabled-session inertness, policy injection, resumable state, and successful-tool evidence.
- The aggregate `omo.js` artifact measured 1,026,706 bytes after the SMMR bridge was split into the separately loaded `smmr.js` extension; the 1,100,000-byte aggregate budget remained unchanged.

## What was observed

- Driver self-test: `SELF-TEST OK`.
- Live driver: `SKIP`, reason `senpi-binary-unavailable`; this is not a live pass.
- `realSenpiUntouched: true`, `realSenpiChangedPaths: []`, `realOmoUntouched: true`, `realOmoChangedPaths: []`.
- Sandbox agent directory: `/tmp/omo-senpi-qa-dGQOQe/agent`.
- Raw final-driver captures: `self-test.txt` and `live-result.json` in this evidence directory.

## Why it is enough

The self-test proves the QA harness and isolation contract. Focused tests cover the new component's deterministic behavior. Provider-level compatibility remains unverified because the required Senpi binary is unavailable.

## What was omitted

No live Senpi transcript was captured because the binary was absent. Secret-bearing configuration and environment contents were omitted.
