import type { ResearchBudget, ResearchEvidence, ResearchProvider, ResearchRequest, ResearchResult, SearchHit } from "./types"

export const DEFAULT_RESEARCH_BUDGET: ResearchBudget = { maxQueries: 3, maxResultsPerQuery: 5, maxEvidenceBytes: 16_000 }

export class ResearchSession {
  readonly budget: ResearchBudget
  #provider: ResearchProvider
  #queriesUsed = 0
  #evidenceBytes = 0

  constructor(provider: ResearchProvider, budget: Partial<ResearchBudget> = {}) {
    this.#provider = provider
    this.budget = { ...DEFAULT_RESEARCH_BUDGET, ...budget }
    for (const [name, value] of Object.entries(this.budget)) {
      if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid research budget: ${name}`)
    }
  }

  async search(request: ResearchRequest): Promise<ResearchResult> {
    if (request.query.trim().length === 0) throw new Error("Research query must not be blank")
    if (this.#queriesUsed >= this.budget.maxQueries) throw new Error("Research query budget exhausted")
    this.#queriesUsed += 1
    const requestedLimit = Math.min(request.budget?.maxResultsPerQuery ?? this.budget.maxResultsPerQuery, this.budget.maxResultsPerQuery)
    const rawHits = await this.#provider.search(request.query, requestedLimit)
    const hits = deduplicateHits(rawHits).slice(0, requestedLimit)
    const evidence: ResearchEvidence[] = []
    let truncated = false
    for (const hit of hits) {
      const excerpt = hit.content ?? hit.snippet
      const remaining = this.budget.maxEvidenceBytes - this.#evidenceBytes
      if (remaining <= 0) { truncated = true; break }
      const bounded = excerpt.slice(0, remaining)
      if (bounded.length < excerpt.length) truncated = true
      this.#evidenceBytes += bounded.length
      evidence.push({ claim: request.query, source: hit, excerpt: bounded, confidence: hit.content ? 0.8 : 0.6, retrievedAt: new Date().toISOString() })
    }
    return { query: request.query, hits, evidence, queriesUsed: this.#queriesUsed, truncated }
  }
}

function deduplicateHits(hits: readonly SearchHit[]): readonly SearchHit[] {
  const seen = new Set<string>()
  return hits.filter((hit) => {
    if (seen.has(hit.url)) return false
    seen.add(hit.url)
    return true
  })
}
