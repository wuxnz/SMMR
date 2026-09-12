import { describe, expect, test } from "bun:test"
import { SmmrController } from "./controller"
import { createEvidence } from "./evidence"
import { createEvidenceBundle } from "./evidence-bundle"

describe("SmmrController", () => {
  test("preserves structured evidence bundles in snapshots", () => {
    const controller = new SmmrController({ objective: "inspect" })
    controller.recordEvidenceBundle(createEvidenceBundle({
      task: { description: "inspect" },
      relevantFiles: ["src/index.ts"],
    }))
    expect(controller.snapshot().evidenceBundles[0]?.relevantFiles).toEqual(["src/index.ts"])
  })

  test("rejects structurally invalid evidence", () => {
    const controller = new SmmrController({ objective: "inspect" })
    const valid = createEvidence({ id: "e1", kind: "test", claim: "verified", content: "ok", confidence: 1, verified: true })
    expect(() => controller.recordEvidence({ ...valid, id: "" })).toThrow("Evidence id")
    expect(() => controller.recordEvidence({ ...valid, claim: " " })).toThrow("Evidence claim")
    expect(() => controller.recordEvidence({ ...valid, content: " " })).toThrow("Evidence content")
    expect(() => controller.recordEvidence({ ...valid, confidence: 2 })).toThrow("confidence")
    expect(() => controller.recordEvidence({ ...valid, confidence: Number.NaN })).toThrow("confidence")
    controller.recordEvidence(valid)
    expect(controller.snapshot().evidence).toHaveLength(1)
  })

  test("isolates nested bundle state in snapshots", () => {
    const controller = new SmmrController({ objective: "inspect" })
    controller.recordEvidenceBundle(createEvidenceBundle({
      task: { description: "inspect" },
      repository: { framework: "Bun" },
      relevantFiles: ["src/index.ts"],
    }))
    const snapshot = controller.snapshot()
    ;(snapshot.evidenceBundles[0]?.relevantFiles as string[]).push("src/other.ts")
    ;(snapshot.evidenceBundles[0]?.repository as Record<string, string>).framework = "Node"
    const fresh = controller.snapshot().evidenceBundles[0]
    expect(fresh?.relevantFiles).toEqual(["src/index.ts"])
    expect(fresh?.repository).toEqual({ framework: "Bun" })
  })

  test("isolates flat evidence state in snapshots", () => {
    const controller = new SmmrController({ objective: "inspect" })
    controller.recordEvidence(createEvidence({ id: "e1", kind: "test", claim: "verified", content: "ok", confidence: 1, verified: true }))
    const snapshot = controller.snapshot()
    ;(snapshot.evidence[0] as { content: string }).content = "tampered"
    expect(controller.snapshot().evidence[0]?.content).toBe("ok")
  })

  test("restores workflow counters and evidence from a snapshot", () => {
    const original = new SmmrController({ objective: "resume" })
    original.recordEvidence(createEvidence({ id: "e1", kind: "test", claim: "verified", content: "ok", confidence: 1, verified: true }))
    original.advance()
    const restored = SmmrController.fromSnapshot({ objective: "resume" }, original.snapshot())
    expect(restored.snapshot().state).toBe("UNDERSTAND")
    expect(restored.snapshot().steps).toBe(1)
    expect(restored.snapshot().evidence[0]?.content).toBe("ok")
    restored.advance()
    expect(restored.snapshot().state).toBe("RESEARCH")
  })

  test("walks the deterministic workflow and preserves evidence", () => {
    const controller = new SmmrController({ objective: "fix the bug", clock: () => "now" })
    controller.recordEvidence(createEvidence({ id: "e1", kind: "test", claim: "test exists", content: "ok", confidence: 1, verified: true, recordedAt: "now" }))
    for (let i = 0; i < 13; i += 1) controller.advance()
    expect(controller.state).toBe("COMPLETE")
    expect(controller.snapshot().evidence).toHaveLength(1)
    expect(controller.snapshot().transitions).toHaveLength(13)
  })

  test("blocks repeated actions before a weak model can loop forever", () => {
    const controller = new SmmrController({ objective: "repair", budget: { maxRepeatedActions: 2 } })
    expect(controller.retry("run-tests")).toBe("DISCOVER")
    expect(controller.retry("run-tests")).toBe("DISCOVER")
    expect(controller.retry("run-tests")).toBe("BLOCKED")
    expect(controller.retry("run-tests")).toBe("BLOCKED")
    expect(controller.snapshot().transitions.at(-1)?.reason).toBe("repeated_action")
  })

  test("enforces step and retry budgets", () => {
    const steps = new SmmrController({ objective: "bounded", budget: { maxSteps: 1 } })
    steps.advance()
    expect(steps.advance()).toBe("BLOCKED")
    expect(steps.snapshot().exhausted).toBe(true)
    const retries = new SmmrController({ objective: "bounded", budget: { maxRetries: 1, maxRepeatedActions: 10 } })
    retries.retry("a")
    expect(retries.retry("b")).toBe("BLOCKED")
  })

  test("requires verification before completion", () => {
    const controller = new SmmrController({ objective: "safe" })
    expect(() => controller.complete()).toThrow("Cannot complete from DISCOVER")
  })

  test("requires verified evidence before explicit completion", () => {
    const controller = new SmmrController({ objective: "safe" })
    for (let i = 0; i < 12; i += 1) controller.advance()
    expect(controller.state).toBe("MEMORIZE")
    expect(() => controller.complete()).toThrow("Cannot complete without verified evidence")
    controller.recordEvidence(createEvidence({ id: "verified", kind: "test", claim: "verified", content: "ok", confidence: 1, verified: true }))
    expect(controller.complete()).toBe("COMPLETE")
  })

  test("does not automatically enter COMPLETE without evidence", () => {
    const controller = new SmmrController({ objective: "safe" })
    for (let i = 0; i < 12; i += 1) controller.advance()
    expect(() => controller.advance()).toThrow("Cannot complete without verified evidence")
    expect(controller.state).toBe("MEMORIZE")
    expect(controller.snapshot().steps).toBe(12)
    expect(controller.snapshot().transitions).toHaveLength(12)
  })
})
