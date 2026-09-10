import { describe, expect, test } from "bun:test"
import { getSmmrSkill, SMMR_FOUNDATIONAL_SKILLS, SMMR_SKILL_REGISTRY } from "./skills"

describe("SMMR skill registry", () => {
  test("contains the six canonical foundational skills", () => {
    expect(SMMR_SKILL_REGISTRY.map((skill) => skill.name)).toEqual([...SMMR_FOUNDATIONAL_SKILLS])
    expect(getSmmrSkill("smmr-research-first")?.operation).toBe("research")
    expect(getSmmrSkill("unknown")).toBeUndefined()
  })
})
