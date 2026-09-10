import { describe, expect, test } from "bun:test"
import { createEvidenceBundle, MAX_EVIDENCE_BUNDLE_CONTEXT_CHARS } from "./evidence-bundle"

describe("createEvidenceBundle", () => {
  test("normalizes the structured evidence sections", () => {
    const bundle = createEvidenceBundle({
      task: { description: "  Fix the refresh race  " },
      repository: { framework: "Next.js" },
      relevantFiles: ["src/auth/session.ts"],
      constraints: ["preserve API"],
      retrievalContext: "### src/auth/session.ts",
      retrievedSources: ["src/auth/session.ts"],
    })
    expect(bundle.task.description).toBe("Fix the refresh race")
    expect(bundle.repository).toEqual({ framework: "Next.js" })
    expect(bundle.relevantFiles).toEqual(["src/auth/session.ts"])
    expect(bundle.externalDocs).toEqual([])
    expect(bundle.constraints).toEqual(["preserve API"])
    expect(bundle.retrievalContext).toContain("session.ts")
    expect(bundle.retrievedSources).toEqual(["src/auth/session.ts"])
  })

  test("rejects an empty task description", () => {
    expect(() => createEvidenceBundle({ task: { description: "  " } })).toThrow(
      "task description must not be empty",
    )
  })

  test("copies caller-owned collections", () => {
    const files = ["src/index.ts"]
    const repository = { framework: "Bun" }
    const bundle = createEvidenceBundle({ task: { description: "Inspect" }, relevantFiles: files, repository })
    files.push("src/other.ts")
    repository.framework = "Node"
    expect(bundle.relevantFiles).toEqual(["src/index.ts"])
    expect(bundle.repository).toEqual({ framework: "Bun" })
  })

  test("bounds retrieval context at the shared contract", () => {
    const bundle = createEvidenceBundle({
      task: { description: "Inspect" },
      retrievalContext: "x".repeat(MAX_EVIDENCE_BUNDLE_CONTEXT_CHARS + 100),
    })
    expect(bundle.retrievalContext).toHaveLength(MAX_EVIDENCE_BUNDLE_CONTEXT_CHARS)
  })
})
