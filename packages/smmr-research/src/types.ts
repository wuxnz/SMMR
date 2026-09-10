export type ResearchSourceKind = "web" | "documentation" | "repository" | "browser"

export interface SearchHit {
  readonly url: string
  readonly title: string
  readonly snippet: string
  readonly content?: string
  readonly sourceKind: ResearchSourceKind
}

export interface ResearchBudget {
  readonly maxQueries: number
  readonly maxResultsPerQuery: number
  readonly maxEvidenceBytes: number
}

export interface ResearchRequest {
  readonly query: string
  readonly budget?: Partial<ResearchBudget>
}

export interface ResearchProvider {
  search(query: string, limit: number): Promise<readonly SearchHit[]>
}

export interface ResearchEvidence {
  readonly claim: string
  readonly source: SearchHit
  readonly excerpt: string
  readonly confidence: number
  readonly retrievedAt: string
}

export interface ResearchResult {
  readonly query: string
  readonly hits: readonly SearchHit[]
  readonly evidence: readonly ResearchEvidence[]
  readonly queriesUsed: number
  readonly truncated: boolean
}
