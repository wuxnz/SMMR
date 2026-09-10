import type { Trajectory, TrajectoryMetrics } from "./types"

export function measureTrajectory(trajectory: Trajectory): TrajectoryMetrics {
  const verification = trajectory.events.filter((event) => event.kind === "verification")
  const verificationPasses = verification.filter((event) => event.payload.passed === true).length
  const verificationFailures = verification.filter((event) => event.payload.passed === false).length
  const retries = trajectory.events.filter((event) => event.kind === "state" && (event.name === "retry" || event.name === "repair")).length
  return {
    success: trajectory.success === true,
    eventCount: trajectory.events.length,
    toolCalls: trajectory.events.filter((event) => event.kind === "tool").length,
    retries,
    evidenceEvents: trajectory.events.filter((event) => event.kind === "evidence").length,
    verificationPasses,
    verificationFailures,
    durationMs: trajectory.endedAt === undefined ? 0 : Math.max(0, Date.parse(trajectory.endedAt) - Date.parse(trajectory.startedAt)),
  }
}

export function aggregateMetrics(trajectories: readonly Trajectory[]): { readonly runs: number; readonly successes: number; readonly successRate: number; readonly averageRetries: number; readonly averageEvidenceEvents: number } {
  if (trajectories.length === 0) return { runs: 0, successes: 0, successRate: 0, averageRetries: 0, averageEvidenceEvents: 0 }
  const metrics = trajectories.map(measureTrajectory)
  return {
    runs: metrics.length,
    successes: metrics.filter((metric) => metric.success).length,
    successRate: metrics.filter((metric) => metric.success).length / metrics.length,
    averageRetries: metrics.reduce((sum, metric) => sum + metric.retries, 0) / metrics.length,
    averageEvidenceEvents: metrics.reduce((sum, metric) => sum + metric.evidenceEvents, 0) / metrics.length,
  }
}
