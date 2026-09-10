import { describe, expect, test } from "bun:test"
import { SmmrRuntimeSession } from "./runtime-session"

describe("SmmrRuntimeSession", () => {
  test("keeps absent configuration inert and denies permissions", () => {
    const session = new SmmrRuntimeSession({ objective: "inspect the repository" })
    expect(session.enabled).toBe(false)
    expect(session.controller).toBeUndefined()
    expect(session.allowNetwork).toBe(false)
    expect(session.allowMemoryWrites).toBe(false)
    expect(session.allowResearch).toBe(false)
  })

  test("creates a deterministic controller only when explicitly enabled", () => {
    const session = new SmmrRuntimeSession({
      objective: "repair the failing test",
      settings: {
        enabled: true,
        model: "ollama:qwen3.5:4b",
        allow_memory_writes: true,
      },
      clock: () => "2026-01-01T00:00:00.000Z",
    })

    expect(session.controller?.state).toBe("DISCOVER")
    expect(session.model).toBe("ollama:qwen3.5:4b")
    expect(session.allowMemoryWrites).toBe(true)
    expect(session.allowNetwork).toBe(false)
    expect(session.snapshot()?.state).toBe("DISCOVER")
  })

  test("enforces operation permissions before running adapter work", async () => {
    const session = new SmmrRuntimeSession({
      objective: "research a provider",
      settings: { enabled: true, allow_research: true },
    })
    await expect(session.execute("research", () => "source-result")).resolves.toBe("source-result")
    await expect(session.execute("network", () => "should-not-run")).rejects.toThrow("network permission")
    expect(session.advance()).toBe("UNDERSTAND")
  })
})
