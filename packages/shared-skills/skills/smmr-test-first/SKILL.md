---
name: smmr-test-first
description: Turn a behavior into a focused failing or boundary test before implementation.
---

# Test first

Translate the request into observable behavior and edge cases. Add the narrowest
test that would fail before the change, then implement only enough behavior to
pass it. Include permission boundaries, malformed input, compatibility paths,
and default behavior when they are relevant.

Run the focused test, then the touched package typecheck and broader regression
tests appropriate to the blast radius. Report skipped checks explicitly.
