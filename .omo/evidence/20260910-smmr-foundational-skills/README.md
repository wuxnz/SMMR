# SMMR foundational skills evidence

## What was tested

- Frontmatter and directory audit for the six new shared skills.
- `git diff --check`.
- Existing shared-skills packaging tests were inspected; the source pipeline
  copies `packages/shared-skills/skills` literally and parses each skill's
  frontmatter at the consumer boundary.

## What was observed

- Six new `SKILL.md` files have valid single-line `name` and `description`
  frontmatter and unique directory names.
- The operating loop, research, repository analysis, test-first,
  debug/repair, and memory-management policies are represented.
- README names each skill and explicitly states that controller invocation is
  still a later host-integration step.
- No generated or harness-specific files were added.

## Why it is enough

This PR adds prose-only, harness-neutral skill assets. The existing build
pipeline is a literal shared-skill copy, so validating the source shape and
diff cleanliness covers the changed packaging surface without starting a host.

## What was omitted

No live OpenCode, Codex, or Senpi harness was started because no adapter code
or lifecycle hook changed. No secrets or environment dumps were captured.
