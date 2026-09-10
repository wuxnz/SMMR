---
name: smmr-debug-and-repair
description: Diagnose failures with bounded hypotheses, repairs, and retests.
---

# Debug and repair

Capture the exact failure and classify it as environment, input, dependency,
logic, integration, or verification. Form one falsifiable hypothesis at a
time. Make the smallest repair, rerun the reproducer, and preserve the failure
and repair as evidence. Count repeated attempts; stop as `BLOCKED` when the
retry or repeated-action budget is exhausted.

Do not hide a failing check by weakening the assertion or replacing the real
runtime with an unrepresentative mock.
