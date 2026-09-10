import { describe, expect, test } from "bun:test"
import { resolveSmmrEnv } from "./smmr-env"

describe("resolveSmmrEnv", () => {
  test("prefers the canonical SMMR variable", () => {
    expect(resolveSmmrEnv("MODE", { SMMR_MODE: "local", OMO_MODE: "legacy" })).toBe("local")
  })

  test("falls back to the legacy OMO variable", () => {
    expect(resolveSmmrEnv("MODE", { OMO_MODE: "legacy" })).toBe("legacy")
  })

  test("preserves an explicitly empty canonical value", () => {
    expect(resolveSmmrEnv("MODE", { SMMR_MODE: "", OMO_MODE: "legacy" })).toBe("")
  })
})
