import type { SmmrOperation } from "./runtime-session"

export const SMMR_FOUNDATIONAL_SKILLS = [
  "smmr-operating",
  "smmr-research-first",
  "smmr-repository-analysis",
  "smmr-test-first",
  "smmr-debug-and-repair",
  "smmr-memory-management",
] as const

export type SmmrFoundationalSkill = (typeof SMMR_FOUNDATIONAL_SKILLS)[number]

export interface SmmrSkillDescriptor {
  readonly name: SmmrFoundationalSkill
  readonly operation: SmmrOperation
}

export const SMMR_SKILL_REGISTRY: readonly SmmrSkillDescriptor[] = [
  { name: "smmr-operating", operation: "local" },
  { name: "smmr-research-first", operation: "research" },
  { name: "smmr-repository-analysis", operation: "local" },
  { name: "smmr-test-first", operation: "local" },
  { name: "smmr-debug-and-repair", operation: "local" },
  { name: "smmr-memory-management", operation: "memory-write" },
]

export function getSmmrSkill(name: string): SmmrSkillDescriptor | undefined {
  return SMMR_SKILL_REGISTRY.find((skill) => skill.name === name)
}
