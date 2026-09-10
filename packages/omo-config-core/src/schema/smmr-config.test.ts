import { describe, expect, test } from "bun:test"
import { OmoConfigSchema, SmmrSettingsSchema } from "./index"

describe("SMMR configuration contract", () => {
  test("defaults to disabled with all external permissions denied", () => {
    expect(SmmrSettingsSchema.parse({})).toEqual({
      enabled: false,
      allow_network: false,
      allow_memory_writes: false,
      allow_research: false,
    })
  })

  test("accepts explicit opt-in and local model selection in the root config", () => {
    const result = OmoConfigSchema.safeParse({
      smmr: {
        enabled: true,
        model: "ollama:qwen3.5:4b",
        allow_network: false,
        allow_memory_writes: true,
        allow_research: false,
      },
    })

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.smmr).toMatchObject({ enabled: true, model: "ollama:qwen3.5:4b" })
  })

  test("rejects unknown SMMR settings", () => {
    expect(SmmrSettingsSchema.safeParse({ enabled: true, controller: "custom" }).success).toBe(false)
  })
})
