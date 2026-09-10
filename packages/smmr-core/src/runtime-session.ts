import { SmmrController, type ControllerBudget, type ControllerSnapshot } from "./controller"
import type { Evidence } from "./evidence"
import type { Reflection, WorkflowState } from "./workflow"
import { SMMR_SKILL_REGISTRY, type SmmrSkillDescriptor } from "./skills"

export interface SmmrRuntimeSettings {
  readonly enabled?: boolean
  readonly model?: string
  readonly allow_network?: boolean
  readonly allow_memory_writes?: boolean
  readonly allow_research?: boolean
}

export interface SmmrRuntimeSessionOptions {
  readonly objective: string
  readonly settings?: SmmrRuntimeSettings
  readonly budget?: Partial<ControllerBudget>
  readonly clock?: () => string
}

export type SmmrOperation = "local" | "network" | "research" | "memory-write"

/** A harness-neutral session boundary for adapters to own and drive. */
export class SmmrRuntimeSession {
  readonly enabled: boolean
  readonly model: string | undefined
  readonly allowNetwork: boolean
  readonly allowMemoryWrites: boolean
  readonly allowResearch: boolean
  readonly controller: SmmrController | undefined
  readonly skills: readonly SmmrSkillDescriptor[] = SMMR_SKILL_REGISTRY

  constructor(options: SmmrRuntimeSessionOptions) {
    const settings = options.settings ?? {}
    this.enabled = settings.enabled === true
    this.model = settings.model
    this.allowNetwork = settings.allow_network === true
    this.allowMemoryWrites = settings.allow_memory_writes === true
    this.allowResearch = settings.allow_research === true
    this.controller = this.enabled
      ? new SmmrController({ objective: options.objective, budget: options.budget, clock: options.clock })
      : undefined
  }

  snapshot(): ControllerSnapshot | undefined {
    return this.controller?.snapshot()
  }

  advance(): WorkflowState {
    return this.requireController().advance()
  }

  retry(action: string): WorkflowState {
    return this.requireController().retry(action)
  }

  reflect(reflection: Omit<Reflection, "state">): Reflection {
    return this.requireController().reflect(reflection)
  }

  recordEvidence(evidence: Evidence): void {
    this.requireController().recordEvidence(evidence)
  }

  async execute<T>(operation: SmmrOperation, action: () => T | Promise<T>): Promise<T> {
    this.requireOperation(operation)
    return action()
  }

  private requireController(): SmmrController {
    if (this.controller === undefined) throw new Error("SMMR runtime session is disabled")
    return this.controller
  }

  private requireOperation(operation: SmmrOperation): void {
    this.requireController()
    if (operation === "network" && !this.allowNetwork) throw new Error("SMMR network permission is disabled")
    if (operation === "research" && !this.allowResearch) throw new Error("SMMR research permission is disabled")
    if (operation === "memory-write" && !this.allowMemoryWrites) throw new Error("SMMR memory-write permission is disabled")
  }
}
