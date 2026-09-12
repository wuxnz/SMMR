# Plan: resumable SMMR controller snapshots

1. Add a validated `SmmrController.fromSnapshot` constructor that restores
   workflow state, counters, reflections, transitions, and evidence.
2. Expose the same restoration boundary through `SmmrRuntimeSession` so host
   adapters can persist and resume per-session state.
3. Add regression tests proving restored sessions continue from the saved state
   and preserve evidence isolation.
4. Run core tests/typecheck and record evidence before review.
