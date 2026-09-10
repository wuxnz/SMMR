import { measureTrajectory } from "@smmr/eval"
import type { Trajectory } from "@smmr/eval"
import type { TrainingExportOptions, TrainingMessage, TrainingRecord, TrajectoryFilter, TrajectorySelector } from "./types"

function eventContent(name: string, payload: Readonly<Record<string, unknown>>): string {
  const text = typeof payload.text === "string" ? payload.text : undefined
  return text === undefined ? `[${name}]` : `[${name}] ${text}`
}

export function trajectoryToTrainingRecord(trajectory: Trajectory): TrainingRecord {
  const messages: TrainingMessage[] = [{ role: "user", content: trajectory.task }]
  for (const event of trajectory.events) {
    messages.push({
      role: event.kind === "tool" ? "tool" : "assistant",
      content: eventContent(event.name, event.payload),
    })
  }
  return { trajectoryId: trajectory.id, task: trajectory.task, model: trajectory.model, success: trajectory.success === true, messages }
}

export function selectTrajectories(trajectories: readonly Trajectory[], filter: TrajectoryFilter = {}): readonly Trajectory[] {
  return trajectories.filter((trajectory) => {
    const metrics = measureTrajectory(trajectory)
    return (filter.success === undefined || metrics.success === filter.success)
      && (filter.model === undefined || trajectory.model === filter.model)
      && (filter.minEvidenceEvents === undefined || metrics.evidenceEvents >= filter.minEvidenceEvents)
      && (filter.minVerificationPasses === undefined || metrics.verificationPasses >= filter.minVerificationPasses)
  })
}

export function exportTrainingRecords(trajectories: readonly Trajectory[], options: TrainingExportOptions = {}): readonly TrainingRecord[] {
  const selected = selectTrajectories(trajectories, options)
  return selected.filter((trajectory) => options.includeFailed === true || trajectory.success === true).map(trajectoryToTrainingRecord)
}

export function exportJsonl(records: readonly TrainingRecord[]): string {
  return records.map((record) => JSON.stringify(record)).join("\n") + (records.length === 0 ? "" : "\n")
}

export function createSelector(filter: TrajectoryFilter = {}): TrajectorySelector {
  return (trajectory) => selectTrajectories([trajectory], filter).length === 1
}
