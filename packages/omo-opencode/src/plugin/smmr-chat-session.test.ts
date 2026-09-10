import { describe, expect, test } from "bun:test"
import { SmmrRuntimeSession } from "@smmr/core"
import { OhMyOpenCodeConfigSchema } from "../config/schema"
import { createSmmrChatSession } from "./smmr-chat-session"

const enabledConfig = OhMyOpenCodeConfigSchema.parse({ smmr: { enabled: true, model: "ollama:qwen3.5:4b" } })

describe("createSmmrChatSession", () => {
  test("creates one enabled session from the first objective", () => {
    const sessions = new Map<string, SmmrRuntimeSession>()
    const session = createSmmrChatSession(enabledConfig, "ses-1", [{ type: "text", text: "Fix the failing test" }], sessions)
    expect(session?.snapshot()?.state).toBe("DISCOVER")
    expect(session?.model).toBe("ollama:qwen3.5:4b")
    expect(sessions.size).toBe(1)
  })

  test("does nothing when disabled, empty, or already initialized", () => {
    const sessions = new Map<string, SmmrRuntimeSession>()
    expect(createSmmrChatSession({}, "ses-1", [{ type: "text", text: "Fix it" }], sessions)).toBeUndefined()
    expect(createSmmrChatSession(enabledConfig, "ses-2", [{ type: "text", text: "   " }], sessions)).toBeUndefined()
    const first = createSmmrChatSession(enabledConfig, "ses-3", [{ type: "text", text: "First" }], sessions)
    const second = createSmmrChatSession(enabledConfig, "ses-3", [{ type: "text", text: "Second" }], sessions)
    expect(first).toBeDefined()
    expect(second).toBeUndefined()
    expect(sessions.size).toBe(1)
  })
})
