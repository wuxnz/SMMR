import type { Trajectory } from "@smmr/eval"

export type TrainingRole = "system" | "user" | "assistant" | "tool"

export interface TrainingMessage {
  readonly role: TrainingRole
  readonly content: string
}

export interface TrainingRecord {
  readonly trajectoryId: string
  readonly task: string
  readonly model: string
  readonly success: boolean
  readonly messages: readonly TrainingMessage[]
}

export interface TrajectoryFilter {
  readonly success?: boolean
  readonly model?: string
  readonly minEvidenceEvents?: number
  readonly minVerificationPasses?: number
}

export interface TrainingExportOptions extends TrajectoryFilter {
  readonly includeFailed?: boolean
}

export type TrajectorySelector = (trajectory: Trajectory) => boolean
