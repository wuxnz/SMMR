import { describe, expect, test } from "bun:test"
import { SmmrRuntimeSession } from "@smmr/core"
import { applySmmrModelOverride } from "./smmr-model-routing"

describe("applySmmrModelOverride", () => {
  test("applies the configured provider and model only to active SMMR sessions", () => {
    const sessions = new Map([
      ["s1", new SmmrRuntimeSession({ objective: "x", settings: { enabled: true, model: "ollama:qwen3.5:4b" } })],
    ])
    const output = {} as { model?: { providerID: string; modelID: string } }
    expect(applySmmrModelOverride("s1", output, sessions)).toBe(true)
    expect(output.model).toEqual({ providerID: "ollama", modelID: "qwen3.5:4b" })
    expect(applySmmrModelOverride("missing", {}, sessions)).toBe(false)
  })

  test("accepts canonical slash syntax and rejects malformed settings", () => {
    const sessions = new Map([
      ["s1", new SmmrRuntimeSession({ objective: "x", settings: { enabled: true, model: "ollama/qwen3.5:4b" } })],
      ["s2", new SmmrRuntimeSession({ objective: "x", settings: { enabled: true, model: "invalid" } })],
    ])
    const output = {} as { model?: { providerID: string; modelID: string } }
    expect(applySmmrModelOverride("s1", output, sessions)).toBe(true)
    expect(output.model).toEqual({ providerID: "ollama", modelID: "qwen3.5:4b" })
    expect(applySmmrModelOverride("s2", {}, sessions)).toBe(false)
  })
})
