# SMMR snapshot bundle isolation evidence

## What was tested

- Core controller tests covering nested Evidence Bundle snapshot isolation.
- Core typecheck and diff validation.

## What was observed

- Mutating snapshot-owned arrays or repository metadata does not change controller state.

## Why it is enough

Controller snapshots are the public inspection boundary used by host adapters, so nested bundle state must be isolated there as well as at record time.

## What was omitted

No host adapter or live provider was exercised.
