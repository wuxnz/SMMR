import type { Trajectory, TrajectoryEvent } from "./types"

export class TrajectoryRecorder {
  readonly id: string
  readonly task: string
  readonly model: string
  readonly startedAt: string
  #events: TrajectoryEvent[] = []
  #endedAt?: string
  #success?: boolean

  constructor(options: { readonly id: string; readonly task: string; readonly model: string; readonly startedAt?: string }) {
    this.id = options.id
    this.task = options.task
    this.model = options.model
    this.startedAt = options.startedAt ?? new Date().toISOString()
  }

  record(event: TrajectoryEvent): void {
    if (this.#endedAt) throw new Error("Cannot record after trajectory completion")
    this.#events.push(event)
  }

  complete(success: boolean, endedAt = new Date().toISOString()): Trajectory {
    if (this.#endedAt) throw new Error("Trajectory is already complete")
    this.#endedAt = endedAt
    this.#success = success
    return this.snapshot()
  }

  snapshot(): Trajectory {
    return { id: this.id, task: this.task, model: this.model, startedAt: this.startedAt, ...(this.#endedAt === undefined ? {} : { endedAt: this.#endedAt }), ...(this.#success === undefined ? {} : { success: this.#success }), events: [...this.#events] }
  }
}
