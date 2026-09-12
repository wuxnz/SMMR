import { SmmrController, type ControllerBudget, type ControllerSnapshot } from "./controller"
import { createEvidence, type Evidence } from "./evidence"
import { createEvidenceBundle, type EvidenceBundle } from "./evidence-bundle"
import type { ModelAdapter, ModelRequest, ModelResponse } from "@smmr/models"
import type { Reflection, WorkflowState } from "./workflow"
import { getSmmrSkillForState, SMMR_SKILL_REGISTRY, type SmmrSkillDescriptor } from "./skills"

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
  readonly objective: string
  readonly enabled: boolean
  readonly model: string | undefined
  readonly allowNetwork: boolean
  readonly allowMemoryWrites: boolean
  readonly allowResearch: boolean
  readonly controller: SmmrController | undefined
  readonly skills: readonly SmmrSkillDescriptor[] = SMMR_SKILL_REGISTRY

  constructor(options: SmmrRuntimeSessionOptions) {
    this.objective = options.objective
    const settings = options.settings ?? {}
    this.enabled = settings.enabled === true
    this.model = settings.model
    this.allowNetwork = settings.allow_network === true
    this.allowMemoryWrites = settings.allow_memory_writes === true
    this.allowResearch = settings.allow_research === true
    if (!this.enabled) {
      this.controller = undefined
    } else {
      const controllerOptions = { objective: options.objective } as {
        objective: string
        budget?: Partial<ControllerBudget>
        clock?: () => string
      }
      if (options.budget !== undefined) controllerOptions.budget = options.budget
      if (options.clock !== undefined) controllerOptions.clock = options.clock
      this.controller = new SmmrController(controllerOptions)
    }
  }

  snapshot(): ControllerSnapshot | undefined {
    return this.controller?.snapshot()
  }

  nextSkill(): SmmrSkillDescriptor | undefined {
    const state = this.snapshot()?.state
    return state === undefined ? undefined : getSmmrSkillForState(state)
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

  recordEvidenceBundle(bundle: EvidenceBundle): void {
    this.requireController().recordEvidenceBundle(bundle)
  }

  async completeModel(
    adapter: ModelAdapter,
    request: Omit<ModelRequest, "model">,
  ): Promise<ModelResponse> {
    const model = this.model
    if (model === undefined) throw new Error("SMMR model is not configured")
    const response = await this.execute("local", () => adapter.complete({ ...request, model }))
    const content = response.content.slice(0, 12_000)
    this.recordEvidence(createEvidence({
      id: `model:${response.id}`,
      kind: "observation",
      claim: `Model ${response.model} completed a normalized request`,
      content,
      source: response.model,
      confidence: 1,
      verified: true,
    }))
    this.recordEvidenceBundle(createEvidenceBundle({
      task: { description: this.objective },
      retrievalContext: `### model:${response.model}\n${content}`,
      retrievedSources: [response.model],
    }))
    return response
  }

  async execute<T>(operation: SmmrOperation, action: () => T | Promise<T>): Promise<T> {
    this.requireOperation(operation)
    return action()
  }

  async runSkill<T>(name: string, action: () => T | Promise<T>): Promise<T> {
    const skill = this.skills.find((candidate) => candidate.name === name)
    if (!skill) throw new Error(`Unknown SMMR skill: ${name}`)
    return this.execute(skill.operation, action)
  }

  async runNextSkill<T>(action: (skill: SmmrSkillDescriptor) => T | Promise<T>): Promise<T> {
    const skill = this.nextSkill()
    if (!skill) throw new Error("SMMR runtime session has no executable skill")
    const result = await this.runSkill(skill.name, () => action(skill))
    this.advance()
    return result
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
