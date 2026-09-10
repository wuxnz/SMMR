# SMMR training evidence adapter evidence

## What was tested

- Training package tests and typecheck, including structured evidence-bundle export.
- Evaluation typecheck and diff validation.

## What was observed

- Evidence-bundle trajectory payloads are retained in training messages.
- Serialized bundle content is bounded before SFT/JSONL export.
- Existing message ordering and trajectory filters remain passing.

## Why it is enough

Training exports no longer discard the evidence that evaluation and controller layers use to justify a trajectory.

## What was omitted

No model fine-tuning or external training run was executed.
