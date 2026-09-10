---
name: smmr-repository-analysis
description: Build a bounded repository map before editing code.
---

# Repository analysis

Identify the project instructions, package boundary, entry point, call path,
tests, build command, and adjacent implementations. Search by symbol and
behavior, not only by filename. Record the files that constrain the change and
the smallest verification surface that can prove it.

Do not edit until the target path and its consumers are understood. Treat
generated files, vendored assets, and unrelated dirty changes as protected.
