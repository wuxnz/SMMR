import { SmmrController, type ControllerBudget, type ControllerSnapshot } from "./controller"

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

/** A harness-neutral session boundary for adapters to own and drive. */
export class SmmrRuntimeSession {
  readonly enabled: boolean
  readonly model: string | undefined
  readonly allowNetwork: boolean
  readonly allowMemoryWrites: boolean
  readonly allowResearch: boolean
  readonly controller: SmmrController | undefined

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
}
