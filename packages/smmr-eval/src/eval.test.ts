import { describe, expect, test } from "bun:test"
import { aggregateMetrics, measureTrajectory } from "./metrics"
import { TrajectoryRecorder } from "./recorder"
import { recordEvidenceBundle } from "./evidence-bundle"
import { createEvidenceBundle } from "@smmr/core"
import type { TrajectoryEvent } from "./types"

const event = (kind: TrajectoryEvent["kind"], name: string, payload: Record<string, unknown> = {}): TrajectoryEvent => ({ kind, name, payload, timestamp: "2026-09-10T00:00:01.000Z" })

describe("SMMR evaluation", () => {
  test("records an immutable completion boundary", () => {
    const recorder = new TrajectoryRecorder({ id: "run-1", task: "fix bug", model: "qwen3.5:4b", startedAt: "2026-09-10T00:00:00.000Z" })
    recorder.record(event("state", "PLAN"))
    const trajectory = recorder.complete(true, "2026-09-10T00:00:02.000Z")
    expect(trajectory.events).toHaveLength(1)
    expect(() => recorder.record(event("tool", "test"))).toThrow("after trajectory completion")
  })

  test("measures success, verification, evidence, retries, and duration", () => {
    const trajectory = { id: "run", task: "task", model: "mock", startedAt: "2026-09-10T00:00:00.000Z", endedAt: "2026-09-10T00:00:05.000Z", success: true, events: [event("tool", "edit"), event("state", "repair"), event("evidence", "test-proof"), event("verification", "tests", { passed: true }), event("verification", "lint", { passed: false })] }
    expect(measureTrajectory(trajectory)).toMatchObject({ success: true, toolCalls: 1, retries: 1, evidenceEvents: 1, verificationPasses: 1, verificationFailures: 1, durationMs: 5000 })
  })

  test("aggregates runs without hiding an empty benchmark", () => {
    expect(aggregateMetrics([])).toMatchObject({ runs: 0, successRate: 0 })
    const trajectory = { id: "run", task: "task", model: "mock", startedAt: "2026-09-10T00:00:00.000Z", success: false, events: [] }
    expect(aggregateMetrics([trajectory, { ...trajectory, id: "run-2", success: true }])).toMatchObject({ runs: 2, successes: 1, successRate: 0.5 })
  })

  test("rejects duplicate completion", () => {
    const recorder = new TrajectoryRecorder({ id: "run", task: "task", model: "mock" })
    recorder.complete(false)
    expect(() => recorder.complete(true)).toThrow("already complete")
  })

  test("records a core evidence bundle as a trajectory event", () => {
    const recorder = new TrajectoryRecorder({ id: "run", task: "task", model: "mock" })
    recordEvidenceBundle(
      recorder,
      createEvidenceBundle({
        task: { description: "task" },
        previousExperiences: ["semantic:auth-fact"],
        retrievalContext: "verified context",
        retrievedSources: ["auth-fact"],
      }),
      "2026-09-10T00:00:01.000Z",
    )
    const trajectory = recorder.snapshot()
    expect(trajectory.events[0]?.name).toBe("evidence-bundle")
    expect(trajectory.events[0]?.payload.retrievalContext).toBe("verified context")
    expect(measureTrajectory(trajectory).evidenceEvents).toBe(1)
  })
})
