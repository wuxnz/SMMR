import { describe, expect, test } from "bun:test"
import { memoryScore, validateMemoryCandidate } from "./policy"
import { MemoryStore } from "./store"
import type { MemoryCandidate } from "./types"

const base: MemoryCandidate = {
  id: "auth-fact",
  kind: "semantic",
  content: "Authentication uses Clerk middleware.",
  tags: ["auth", "clerk"],
  importance: 0.9,
  confidence: 0.95,
  evidenceIds: ["test-1"],
  createdAt: "2026-09-10T00:00:00.000Z",
}

describe("SMMR memory policy", () => {
  test("rejects low-confidence or unsupported memory", () => {
    const result = validateMemoryCandidate({ ...base, confidence: 0.2, evidenceIds: [] }, { minimumConfidence: 0.7, requireEvidence: true, halfLifeDays: 30 })
    expect(result.accepted).toBe(false)
    expect(result.reasons).toEqual(expect.arrayContaining(["confidence is below the memory policy threshold", "memory requires at least one evidence reference"]))
  })

  test("scores evidence-backed memory with time decay", () => {
    const fresh = memoryScore(base, { minimumConfidence: 0.7, requireEvidence: true, halfLifeDays: 30 }, new Date("2026-09-10T00:00:00.000Z"))
    const old = memoryScore(base, { minimumConfidence: 0.7, requireEvidence: true, halfLifeDays: 30 }, new Date("2026-11-09T00:00:00.000Z"))
    expect(fresh).toBeCloseTo(0.855)
    expect(old).toBeCloseTo(0.21375)
  })

  test("searches across content and tags, then updates access time", () => {
    const store = new MemoryStore()
    store.write(base)
    store.write({ ...base, id: "workflow", kind: "procedural", content: "Run the auth integration test before changing middleware.", tags: ["testing"], evidenceIds: ["test-2"] })
    expect(store.search("auth middleware").map((match) => match.entry.id)).toEqual(["auth-fact", "workflow"])
    expect(store.search("integration", { kind: "procedural" })[0]?.entry.id).toBe("workflow")
    expect(store.read("auth-fact", new Date("2026-09-11T00:00:00.000Z"))?.lastAccessedAt).toBe("2026-09-11T00:00:00.000Z")
  })

  test("evicts the lowest-scoring entry when bounded", () => {
    const store = new MemoryStore({ maximumEntries: 1 })
    store.write({ ...base, id: "low", importance: 0.1 })
    store.write({ ...base, id: "high", importance: 1 })
    expect(store.size).toBe(1)
    expect(store.read("low")).toBeUndefined()
    expect(store.read("high")).toBeDefined()
  })
})
