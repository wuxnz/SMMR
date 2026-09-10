import { describe, expect, test } from "bun:test"
import { SmmrController } from "./controller"
import { createEvidence } from "./evidence"

describe("SmmrController", () => {
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
})
