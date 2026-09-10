import { describe, expect, test } from "bun:test"
import { ResearchSession } from "./session"
import type { ResearchProvider, SearchHit } from "./types"

const hits: readonly SearchHit[] = [
  { url: "https://docs.example/auth", title: "Auth docs", snippet: "Use the callback API.", content: "The callback API validates the state parameter before exchanging the code.", sourceKind: "documentation" },
  { url: "https://docs.example/auth", title: "Duplicate", snippet: "duplicate", sourceKind: "web" },
  { url: "https://repo.example/example", title: "Working example", snippet: "example", sourceKind: "repository" },
]

const provider: ResearchProvider = { search: async () => hits }

describe("SMMR research", () => {
  test("deduplicates hits and records bounded evidence", async () => {
    const session = new ResearchSession(provider, { maxEvidenceBytes: 40 })
    const result = await session.search({ query: "callback API" })
    expect(result.hits).toHaveLength(2)
    expect(result.evidence[0]?.confidence).toBe(0.8)
    expect(result.evidence[0]?.excerpt.length).toBe(40)
    expect(result.truncated).toBe(true)
  })

  test("enforces the query budget", async () => {
    const session = new ResearchSession(provider, { maxQueries: 1 })
    await session.search({ query: "first" })
    await expect(session.search({ query: "second" })).rejects.toThrow("budget exhausted")
  })

  test("rejects blank research and invalid budgets", async () => {
    expect(() => new ResearchSession(provider, { maxQueries: 0 })).toThrow("Invalid research budget")
    const session = new ResearchSession(provider)
    await expect(session.search({ query: "   " })).rejects.toThrow("must not be blank")
  })

  test("respects per-request result limits without exceeding session limits", async () => {
    const calls: number[] = []
    const limited: ResearchProvider = { search: async (_query, limit) => { calls.push(limit); return hits } }
    const session = new ResearchSession(limited, { maxResultsPerQuery: 2 })
    const result = await session.search({ query: "docs", budget: { maxResultsPerQuery: 1 } })
    expect(calls).toEqual([1])
    expect(result.hits).toHaveLength(1)
  })
})
