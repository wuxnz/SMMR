export type MemoryKind = "episodic" | "semantic" | "procedural"

export interface MemoryCandidate {
  readonly id: string
  readonly kind: MemoryKind
  readonly content: string
  readonly tags: readonly string[]
  readonly importance: number
  readonly confidence: number
  readonly evidenceIds: readonly string[]
  readonly createdAt: string
  readonly lastAccessedAt?: string
}

export interface MemoryPolicy {
  readonly minimumConfidence: number
  readonly requireEvidence: boolean
  readonly maximumEntries?: number
  readonly halfLifeDays: number
}

export interface MemoryValidation {
  readonly accepted: boolean
  readonly reasons: readonly string[]
}

export interface MemoryMatch {
  readonly entry: MemoryCandidate
  readonly score: number
}

export const DEFAULT_MEMORY_POLICY: MemoryPolicy = {
  minimumConfidence: 0.7,
  requireEvidence: true,
  halfLifeDays: 30,
}
