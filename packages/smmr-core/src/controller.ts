import { isTerminalState, nextWorkflowState, type Reflection, type WorkflowState, type WorkflowTransition } from "./workflow"
import { createEvidenceBundle, type EvidenceBundle } from "./evidence-bundle"
import type { Evidence } from "./evidence"

export interface ControllerBudget { readonly maxSteps: number; readonly maxRetries: number; readonly maxRepeatedActions: number }
export interface ControllerSnapshot {
  readonly state: WorkflowState
  readonly steps: number
  readonly retries: number
  readonly reflections: readonly Reflection[]
  readonly transitions: readonly WorkflowTransition[]
  readonly evidence: readonly Evidence[]
  readonly evidenceBundles: readonly EvidenceBundle[]
  readonly exhausted: boolean
}
export interface ControllerOptions { readonly objective: string; readonly budget?: Partial<ControllerBudget>; readonly clock?: () => string }

const DEFAULT_BUDGET: ControllerBudget = { maxSteps: 64, maxRetries: 3, maxRepeatedActions: 2 }

export class SmmrController {
  readonly objective: string
  readonly budget: ControllerBudget
  #state: WorkflowState = "DISCOVER"
  #steps = 0
  #retries = 0
  #actionCounts = new Map<string, number>()
  #reflections: Reflection[] = []
  #transitions: WorkflowTransition[] = []
  #evidence: Evidence[] = []
  #evidenceBundles: EvidenceBundle[] = []
  #clock: () => string

  constructor(options: ControllerOptions) {
    this.objective = options.objective
    this.budget = { ...DEFAULT_BUDGET, ...options.budget }
    for (const [name, value] of Object.entries(this.budget)) {
      if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid controller budget: ${name}`)
    }
    this.#clock = options.clock ?? (() => new Date().toISOString())
  }
  get state(): WorkflowState { return this.#state }
  recordEvidence(evidence: Evidence): void { this.#evidence.push(evidence) }
  recordEvidenceBundle(bundle: EvidenceBundle): void { this.#evidenceBundles.push(createEvidenceBundle(bundle)) }

  reflect(reflection: Omit<Reflection, "state">): Reflection {
    const result = { ...reflection, state: this.#state }
    if (result.confidence < 0 || result.confidence > 1) throw new Error("Reflection confidence must be between 0 and 1")
    this.#reflections.push(result)
    return result
  }

  advance(): WorkflowState {
    if (isTerminalState(this.#state)) return this.#state
    if (this.#steps >= this.budget.maxSteps) return this.#transition("BLOCKED", "budget_exhausted")
    const next = nextWorkflowState(this.#state)
    if (next === "COMPLETE") this.requireVerifiedEvidence()
    this.#steps += 1
    return this.#transition(next, "advance")
  }

  retry(action: string): WorkflowState {
    if (isTerminalState(this.#state)) return this.#state
    const count = (this.#actionCounts.get(action) ?? 0) + 1
    this.#actionCounts.set(action, count)
    this.#retries += 1
    if (count > this.budget.maxRepeatedActions) return this.#transition("BLOCKED", "repeated_action")
    if (this.#retries > this.budget.maxRetries) return this.#transition("BLOCKED", "budget_exhausted")
    return this.#state
  }

  complete(): WorkflowState {
    if (this.#state === "VERIFY" || this.#state === "REVIEW" || this.#state === "MEMORIZE") {
      this.requireVerifiedEvidence()
      return this.#transition("COMPLETE", "advance")
    }
    throw new Error(`Cannot complete from ${this.#state}`)
  }

  private requireVerifiedEvidence(): void {
    if (this.#evidence.some((evidence) => evidence.verified) || this.#evidenceBundles.length > 0) return
    throw new Error("Cannot complete without verified evidence")
  }

  snapshot(): ControllerSnapshot {
    return { state: this.#state, steps: this.#steps, retries: this.#retries, reflections: [...this.#reflections], transitions: [...this.#transitions], evidence: [...this.#evidence], evidenceBundles: this.#evidenceBundles.map((bundle) => createEvidenceBundle(bundle)), exhausted: this.#state === "BLOCKED" || this.#steps >= this.budget.maxSteps }
  }

  #transition(to: WorkflowState, reason: WorkflowTransition["reason"]): WorkflowState {
    this.#transitions.push({ from: this.#state, to, reason, at: this.#clock() })
    this.#state = to
    return to
  }
}
