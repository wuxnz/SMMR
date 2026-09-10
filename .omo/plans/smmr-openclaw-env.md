# OpenClaw SMMR environment plan

1. Replace OpenClaw core's direct `OMO_OPENCLAW_*` reads with the canonical
   `SMMR_OPENCLAW_*` resolver while retaining OMO fallback.
2. Add focused tests proving canonical precedence and legacy compatibility for
   timeout and startup-token environment names.
3. Run OpenClaw core tests, typecheck, and a repository grep audit.
4. Record evidence and deliver the change through a merge-commit PR.
