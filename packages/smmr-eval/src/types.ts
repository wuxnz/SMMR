export type TrajectoryEventKind = "state" | "model" | "tool" | "evidence" | "verification"

export interface TrajectoryEvent {
  readonly kind: TrajectoryEventKind
  readonly timestamp: string
  readonly name: string
  readonly payload: Readonly<Record<string, unknown>>
}

export interface Trajectory {
  readonly id: string
  readonly task: string
  readonly model: string
  readonly startedAt: string
  readonly endedAt?: string
  readonly success?: boolean
  readonly events: readonly TrajectoryEvent[]
}

export interface TrajectoryMetrics {
  readonly success: boolean
  readonly eventCount: number
  readonly toolCalls: number
  readonly retries: number
  readonly evidenceEvents: number
  readonly verificationPasses: number
  readonly verificationFailures: number
  readonly durationMs: number
}

export interface BenchmarkTask {
  readonly id: string
  readonly prompt: string
  readonly successCriteria: readonly string[]
  readonly tags?: readonly string[]
}
