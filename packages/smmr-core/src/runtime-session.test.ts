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
    expect(session.nextSkill()?.name).toBe("smmr-repository-analysis")
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

  test("routes registered skills through their operation permissions", async () => {
    const session = new SmmrRuntimeSession({
      objective: "research",
      settings: { enabled: true, allow_research: true },
    })

    await expect(session.runSkill("smmr-research-first", () => "researched")).resolves.toBe("researched")
    await expect(session.runSkill("smmr-memory-management", () => "written")).rejects.toThrow(
      "memory-write permission",
    )
    await expect(session.runSkill("missing-skill", () => "never")).rejects.toThrow(
      "Unknown SMMR skill: missing-skill",
    )
  })

  test("runs the planned skill and advances only after successful completion", async () => {
    const session = new SmmrRuntimeSession({
      objective: "inspect repository",
      settings: { enabled: true },
    })
    await expect(session.runNextSkill((skill) => skill.name)).resolves.toBe("smmr-repository-analysis")
    expect(session.snapshot()?.state).toBe("UNDERSTAND")

    const failing = new SmmrRuntimeSession({ objective: "inspect repository", settings: { enabled: true } })
    await expect(failing.runNextSkill(() => Promise.reject(new Error("adapter failed")))).rejects.toThrow(
      "adapter failed",
    )
    expect(failing.snapshot()?.state).toBe("DISCOVER")
  })
})
