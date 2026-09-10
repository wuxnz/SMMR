import { describe, expect, test } from "bun:test"
import { SmmrRuntimeSession } from "@smmr/core"
import {
  advanceSmmrSessionAfterTool,
  assertSmmrSessionCanRunNextSkill,
  removeDeletedSmmrSession,
} from "./smmr-session-lifecycle"

describe("removeDeletedSmmrSession", () => {
  test("removes a session using the current event shape", () => {
    const sessions = new Map([
      ["s1", new SmmrRuntimeSession({ objective: "x", settings: { enabled: true } })],
    ])
    expect(
      removeDeletedSmmrSession(
        { event: { type: "session.deleted", properties: { sessionID: "s1" } } },
        sessions,
      ),
    ).toBe(true)
    expect(sessions.has("s1")).toBe(false)
  })

  test("supports the legacy info.id shape and ignores other events", () => {
    const sessions = new Map([
      ["s2", new SmmrRuntimeSession({ objective: "x", settings: { enabled: true } })],
    ])
    expect(
      removeDeletedSmmrSession(
        { event: { type: "session.created", properties: { info: { id: "s2" } } } },
        sessions,
      ),
    ).toBe(false)
    expect(
      removeDeletedSmmrSession(
        { event: { type: "session.deleted", properties: { info: { id: "s2" } } } },
        sessions,
      ),
    ).toBe(true)
  })
})

describe("advanceSmmrSessionAfterTool", () => {
  test("advances after successful tool output and ignores failed output", async () => {
    const sessions = new Map([
      ["s1", new SmmrRuntimeSession({ objective: "x", settings: { enabled: true } })],
    ])
    await expect(advanceSmmrSessionAfterTool({ sessionID: "s1", tool: "glob" }, { output: "ok" }, sessions)).resolves.toBe(true)
    expect(sessions.get("s1")?.snapshot()?.state).toBe("UNDERSTAND")
    expect(sessions.get("s1")?.snapshot()?.evidence).toHaveLength(1)
    expect(sessions.get("s1")?.snapshot()?.evidence[0]?.content).toContain("ok")
    await expect(advanceSmmrSessionAfterTool({ sessionID: "s1", tool: "glob" }, undefined, sessions)).resolves.toBe(false)
  })

  test("redacts credential-shaped values from retained output", async () => {
    const sessions = new Map([["s1", new SmmrRuntimeSession({ objective: "inspect", settings: { enabled: true } })]])
    await expect(
      advanceSmmrSessionAfterTool(
        { sessionID: "s1", tool: "glob" },
        { output: "Authorization: Bearer secret-token api_key=abc123 password: hunter2" },
        sessions,
      ),
    ).resolves.toBe(true)
    const content = sessions.get("s1")?.snapshot()?.evidence[0]?.content ?? ""
    expect(content).toContain("[redacted]")
    expect(content).not.toContain("secret-token")
    expect(content).not.toContain("abc123")
    expect(content).not.toContain("hunter2")
  })
})

describe("assertSmmrSessionCanRunNextSkill", () => {
  test("allows local work and rejects disabled research before execution", async () => {
    const session = new SmmrRuntimeSession({ objective: "inspect", settings: { enabled: true } })
    await expect(assertSmmrSessionCanRunNextSkill(session)).resolves.toBeUndefined()
    session.advance()
    session.advance()
    expect(session.nextSkill()?.name).toBe("smmr-research-first")
    await expect(assertSmmrSessionCanRunNextSkill(session)).rejects.toThrow("research permission is disabled")
  })

  test("allows research when explicitly enabled", async () => {
    const session = new SmmrRuntimeSession({
      objective: "research",
      settings: { enabled: true, allow_research: true },
    })
    session.advance()
    session.advance()
    await expect(assertSmmrSessionCanRunNextSkill(session)).resolves.toBeUndefined()
  })
})
