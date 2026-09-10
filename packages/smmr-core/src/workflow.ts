export const WORKFLOW_STATES = [
  "DISCOVER", "UNDERSTAND", "RESEARCH", "RETRIEVE", "PLAN", "TEST_FIRST",
  "IMPLEMENT", "EXECUTE", "DIAGNOSE", "REPAIR", "VERIFY", "REVIEW", "MEMORIZE",
  "COMPLETE", "BLOCKED",
] as const

export type WorkflowState = (typeof WORKFLOW_STATES)[number]
export type TransitionReason = "advance" | "retry" | "budget_exhausted" | "repeated_action" | "verification_failed" | "blocked"

export interface WorkflowTransition {
  readonly from: WorkflowState
  readonly to: WorkflowState
  readonly reason: TransitionReason
  readonly at: string
}

export interface Reflection {
  readonly state: WorkflowState
  readonly objective: string
  readonly observation: string
  readonly hypothesis?: string
  readonly nextAction?: string
  readonly confidence: number
}

export function isTerminalState(state: WorkflowState): boolean {
  return state === "COMPLETE" || state === "BLOCKED"
}

export function nextWorkflowState(state: WorkflowState): WorkflowState {
  const index = WORKFLOW_STATES.indexOf(state)
  if (index < 0 || index >= 13) return state
  return WORKFLOW_STATES[index + 1] ?? "COMPLETE"
}
