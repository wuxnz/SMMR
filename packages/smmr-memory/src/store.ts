import { DEFAULT_MEMORY_POLICY, type MemoryCandidate, type MemoryKind, type MemoryMatch, type MemoryPolicy } from "./types"
import { memoryScore, validateMemoryCandidate } from "./policy"

export class MemoryStore {
  readonly policy: MemoryPolicy
  #entries = new Map<string, MemoryCandidate>()

  constructor(policy: Partial<MemoryPolicy> = {}) {
    this.policy = { ...DEFAULT_MEMORY_POLICY, ...policy }
  }

  write(candidate: MemoryCandidate): MemoryCandidate {
    const validation = validateMemoryCandidate(candidate, this.policy)
    if (!validation.accepted) throw new Error(`Memory candidate rejected: ${validation.reasons.join("; ")}`)
    if (this.policy.maximumEntries !== undefined && !this.#entries.has(candidate.id) && this.#entries.size >= this.policy.maximumEntries) {
      this.#evictLowestScore()
    }
    this.#entries.set(candidate.id, candidate)
    return candidate
  }

  read(id: string, now = new Date()): MemoryCandidate | undefined {
    const entry = this.#entries.get(id)
    if (!entry) return undefined
    const accessed = now.toISOString()
    const updated = { ...entry, lastAccessedAt: accessed }
    this.#entries.set(id, updated)
    return updated
  }

  search(query: string, options: { readonly kind?: MemoryKind; readonly limit?: number; readonly now?: Date } = {}): readonly MemoryMatch[] {
    const terms = query.toLocaleLowerCase().split(/\s+/u).filter(Boolean)
    if (terms.length === 0) return []
    const now = options.now ?? new Date()
    return [...this.#entries.values()]
      .filter((entry) => options.kind === undefined || entry.kind === options.kind)
      .map((entry) => {
        const haystack = `${entry.content} ${entry.tags.join(" ")}`.toLocaleLowerCase()
        const matches = terms.filter((term) => haystack.includes(term)).length
        return { entry, score: matches / terms.length * memoryScore(entry, this.policy, now) }
      })
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, options.limit ?? 10)
  }

  get size(): number { return this.#entries.size }

  #evictLowestScore(): void {
    const lowest = [...this.#entries.values()].sort((a, b) => memoryScore(a, this.policy) - memoryScore(b, this.policy))[0]
    if (lowest) this.#entries.delete(lowest.id)
  }
}
