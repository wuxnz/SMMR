import { describe, expect, test } from "bun:test"
import { OhMyOpenCodeConfigSchema } from "./oh-my-opencode-config"

describe("OpenCode SMMR config", () => {
  test("keeps SMMR opt-in and accepts the canonical permission fields", () => {
    const result = OhMyOpenCodeConfigSchema.safeParse({
      smmr: {
        enabled: true,
        model: "ollama:qwen3.5:4b",
        allow_network: false,
        allow_memory_writes: true,
        allow_research: false,
      },
    })

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.smmr?.enabled).toBe(true)
  })

  test("rejects unknown SMMR fields", () => {
    expect(OhMyOpenCodeConfigSchema.safeParse({ smmr: { controller: "custom" } }).success).toBe(false)
  })
})
