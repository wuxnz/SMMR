import { describe, expect, test } from "bun:test"
import { compileContext, retrieveEvidence } from "./context"
import { toSmmrEvidenceBundle } from "./core-bundle"
import { rankLexical } from "./lexical"
import { DocumentGraph } from "./structure"
import type { RetrievalDocument } from "./types"

const documents: readonly RetrievalDocument[] = [
  { id: "auth", path: "src/auth/login.ts", kind: "code", content: "export function login() { return clerk.session() }", symbols: ["login", "clerk"] },
  { id: "auth-test", path: "src/auth/login.test.ts", kind: "test", content: "test login redirects unauthenticated users", testFor: ["auth"] },
  { id: "route", path: "src/routes.ts", kind: "code", content: "import { login } from './auth/login'", imports: ["auth"] },
  { id: "readme", path: "README.md", kind: "documentation", content: "Authentication uses Clerk." },
]

describe("SMMR retrieval", () => {
  test("ranks exact paths and symbols ahead of incidental matches", () => {
    const matches = rankLexical(documents, { text: "login", limit: 3 })
    expect(matches[0]?.document.id).toBe("auth")
    expect(matches[0]?.reasons).toContain("1/1 query terms")
  })

  test("connects code to imports and related tests", () => {
    const graph = new DocumentGraph(documents)
    expect(graph.related("auth").map((document) => document.id)).toEqual(["auth-test", "route"])
    expect(graph.testsFor("auth").map((document) => document.id)).toEqual(["auth-test"])
  })

  test("returns a bounded evidence bundle with lexical and structural context", () => {
    const bundle = retrieveEvidence(documents, { text: "login", limit: 3 })
    expect(bundle.sources).toContain("src/auth/login.ts")
    expect(bundle.sources).toContain("src/auth/login.test.ts")
    expect(bundle.context.length).toBeGreaterThan(0)
    expect(bundle.context.length).toBeLessThanOrEqual(12_000)
  })

  test("compiles context without splitting a document", () => {
    const context = compileContext([{ document: documents[0]!, score: 1, reasons: [] }], 20)
    expect(context).toBe("")
  })

  test("converts retrieval results into the core evidence bundle", () => {
    const bundle = toSmmrEvidenceBundle(retrieveEvidence(documents, { text: "login", limit: 4 }), "Fix login")
    expect(bundle.task.description).toBe("Fix login")
    expect(bundle.relevantFiles).toContain("src/auth/login.ts")
    expect(bundle.localExamples).toContain("src/auth/login.test.ts")
    expect(bundle.retrievalContext).toContain("src/auth/login.ts")
    expect(bundle.retrievedSources).toContain("src/routes.ts")
  })
})
