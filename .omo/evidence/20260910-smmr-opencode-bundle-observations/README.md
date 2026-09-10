# SMMR OpenCode bundle observations evidence

## What was tested

- Focused OpenCode session-lifecycle tests for successful tool bundle recording.
- OpenCode adapter typecheck and full repository build.

## What was observed

- Successful tool completions record both the existing flat observation and a structured controller-owned Evidence Bundle.
- Bundle task description comes from the session objective; tool name and bounded output are retained as source/context.
- Failed completions still record neither progress nor evidence.

## Why it is enough

Live OpenCode sessions now populate the same bundle contract consumed by RAG, research, memory, verification, evaluation, and training layers.

## What was omitted

No live provider request was used; the adapter-boundary lifecycle fixture is deterministic.
