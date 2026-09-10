import { describe, expect, test } from "bun:test"
import { getSmmrSkill, getSmmrSkillForState, SMMR_FOUNDATIONAL_SKILLS, SMMR_SKILL_REGISTRY } from "./skills"

describe("SMMR skill registry", () => {
  test("contains the six canonical foundational skills", () => {
    expect(SMMR_SKILL_REGISTRY.map((skill) => skill.name)).toEqual([...SMMR_FOUNDATIONAL_SKILLS])
    expect(getSmmrSkill("smmr-research-first")?.operation).toBe("research")
    expect(getSmmrSkill("unknown")).toBeUndefined()
  })

  test("maps workflow states to deterministic skills and leaves terminal states unmapped", () => {
    expect(getSmmrSkillForState("DISCOVER")?.name).toBe("smmr-repository-analysis")
    expect(getSmmrSkillForState("RESEARCH")?.operation).toBe("research")
    expect(getSmmrSkillForState("DIAGNOSE")?.name).toBe("smmr-debug-and-repair")
    expect(getSmmrSkillForState("COMPLETE")).toBeUndefined()
    expect(getSmmrSkillForState("BLOCKED")).toBeUndefined()
  })
})
