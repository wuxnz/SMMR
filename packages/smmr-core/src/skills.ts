import type { SmmrOperation } from "./runtime-session"
import type { WorkflowState } from "./workflow"

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

const WORKFLOW_SKILLS: Readonly<Partial<Record<WorkflowState, SmmrFoundationalSkill>>> = {
  DISCOVER: "smmr-repository-analysis",
  UNDERSTAND: "smmr-repository-analysis",
  RESEARCH: "smmr-research-first",
  RETRIEVE: "smmr-repository-analysis",
  PLAN: "smmr-operating",
  TEST_FIRST: "smmr-test-first",
  IMPLEMENT: "smmr-operating",
  EXECUTE: "smmr-operating",
  DIAGNOSE: "smmr-debug-and-repair",
  REPAIR: "smmr-debug-and-repair",
  VERIFY: "smmr-test-first",
  REVIEW: "smmr-operating",
  MEMORIZE: "smmr-memory-management",
}

export function getSmmrSkillForState(state: WorkflowState): SmmrSkillDescriptor | undefined {
  const name = WORKFLOW_SKILLS[state]
  return name === undefined ? undefined : getSmmrSkill(name)
}
