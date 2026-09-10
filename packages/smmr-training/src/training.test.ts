import { describe, expect, test } from "bun:test"
import type { Trajectory } from "@smmr/eval"
import { exportJsonl, exportTrainingRecords, selectTrajectories, trajectoryToTrainingRecord } from "./export"

const trajectory = (overrides: Partial<Trajectory> = {}): Trajectory => ({
  id: "run-1",
  task: "fix the bug",
  model: "qwen3.5:4b",
  startedAt: "2026-09-10T00:00:00.000Z",
  success: true,
  events: [
    { kind: "state", name: "PLAN", timestamp: "2026-09-10T00:00:01.000Z", payload: {} },
    { kind: "tool", name: "edit", timestamp: "2026-09-10T00:00:02.000Z", payload: { text: "apply patch" } },
    { kind: "evidence", name: "tests", timestamp: "2026-09-10T00:00:03.000Z", payload: {} },
    { kind: "verification", name: "tests", timestamp: "2026-09-10T00:00:04.000Z", payload: { passed: true } },
  ],
  ...overrides,
})

describe("SMMR training scaffolds", () => {
  test("converts a trajectory into ordered SFT messages", () => {
    const record = trajectoryToTrainingRecord(trajectory())
    expect(record.messages).toEqual([
      { role: "user", content: "fix the bug" },
      { role: "assistant", content: "[PLAN]" },
      { role: "tool", content: "[edit] apply patch" },
      { role: "assistant", content: "[tests]" },
      { role: "assistant", content: "[tests]" },
    ])
  })

  test("filters by success, model, and evidence thresholds", () => {
    const failed = trajectory({ id: "run-2", success: false, model: "other" })
    expect(selectTrajectories([trajectory(), failed], { success: true, model: "qwen3.5:4b", minEvidenceEvents: 1 })).toHaveLength(1)
    expect(exportTrainingRecords([failed])).toEqual([])
    expect(exportTrainingRecords([failed], { includeFailed: true })[0]?.success).toBe(false)
  })

  test("exports stable newline-delimited JSON", () => {
    const records = exportTrainingRecords([trajectory()])
    expect(exportJsonl(records)).toBe(`${JSON.stringify(records[0])}\n`)
    expect(exportJsonl([])).toBe("")
  })

  test("preserves bounded evidence-bundle payloads in training messages", () => {
    const record = trajectoryToTrainingRecord(trajectory({
      events: [{
        kind: "evidence",
        name: "evidence-bundle",
        timestamp: "2026-09-10T00:00:03.000Z",
        payload: { retrievalContext: "verified repository context", retrievedSources: ["src/index.ts"] },
      }],
    }))
    expect(record.messages[1]?.content).toContain("verified repository context")
    expect(record.messages[1]?.content).toContain("src/index.ts")
  })
})
