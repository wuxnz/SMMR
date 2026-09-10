# SMMR telemetry opt-in plan

1. Resolve telemetry disable/opt-in variables through canonical SMMR names with
   OMO fallback.
2. Make omitted compatibility-runtime telemetry configuration disabled by
   default while preserving explicit config and legacy opt-in behavior.
3. Run focused telemetry tests, typecheck, and live isolated OpenCode QA with
   a fake provider.
4. Record evidence, revise README, and merge by PR.
