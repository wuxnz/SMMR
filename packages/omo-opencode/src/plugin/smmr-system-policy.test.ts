import { describe, expect, test } from "bun:test"
import { SmmrRuntimeSession } from "@smmr/core"
import { getSmmrSystemPolicy, SMMR_MODE_TAG } from "./smmr-system-policy"

describe("getSmmrSystemPolicy", () => {
  test("returns policy only for an active session", () => {
    const sessions = new Map([
      ["s1", new SmmrRuntimeSession({ objective: "repair", settings: { enabled: true } })],
    ])
    const policy = getSmmrSystemPolicy("s1", sessions)
    expect(policy).toContain(SMMR_MODE_TAG)
    expect(policy).toContain("State: DISCOVER")
    expect(policy).toContain("smmr-research-first")
    expect(getSmmrSystemPolicy("missing", sessions)).toBeUndefined()
  })
})
