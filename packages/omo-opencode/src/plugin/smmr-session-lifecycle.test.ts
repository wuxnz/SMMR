import { describe, expect, test } from "bun:test"
import { SmmrRuntimeSession } from "@smmr/core"
import { removeDeletedSmmrSession } from "./smmr-session-lifecycle"

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
