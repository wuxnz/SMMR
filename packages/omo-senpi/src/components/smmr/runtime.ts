type Snapshot = { state: string; steps: number; retries: number; reflections: readonly unknown[]; transitions: readonly unknown[]; evidence: readonly unknown[]; evidenceBundles: readonly unknown[]; exhausted: boolean }
type Settings = { allow_network?: boolean; allow_memory_writes?: boolean; allow_research?: boolean }

export function createEvidence(value: Record<string, unknown>): Record<string, unknown> { return value }
export function createEvidenceBundle(value: Record<string, unknown>): Record<string, unknown> { return value }

export class SmmrRuntimeSession {
  readonly objective: string
  readonly allowNetwork: boolean
  readonly allowMemoryWrites: boolean
  readonly allowResearch: boolean
  private current: Snapshot

  constructor(options: { objective: string; settings: Settings; snapshot?: Snapshot }) {
    this.objective = options.objective
    this.allowNetwork = options.settings.allow_network === true
    this.allowMemoryWrites = options.settings.allow_memory_writes === true
    this.allowResearch = options.settings.allow_research === true
    this.current = options.snapshot ?? { state: "DISCOVER", steps: 0, retries: 0, reflections: [], transitions: [], evidence: [], evidenceBundles: [], exhausted: false }
  }

  snapshot(): Snapshot { return this.current }
  nextSkill(): { name: string } { return { name: ({ DISCOVER: "smmr-repository-analysis", UNDERSTAND: "smmr-repository-analysis", RESEARCH: "smmr-research-first", RETRIEVE: "smmr-repository-analysis", PLAN: "smmr-operating", TEST_FIRST: "smmr-test-first", IMPLEMENT: "smmr-operating", EXECUTE: "smmr-operating", DIAGNOSE: "smmr-debug-and-repair", REPAIR: "smmr-debug-and-repair", VERIFY: "smmr-test-first", REVIEW: "smmr-operating", MEMORIZE: "smmr-memory-management" } as Record<string, string>)[this.current.state] ?? "smmr-operating" }
  }
  async runNextSkill<T>(action: (skill: { name: string }) => T | Promise<T>): Promise<T> {
    const skill = this.nextSkill()
    const result = await action(skill)
    this.current = { ...this.current, state: this.current.state === "DISCOVER" ? "UNDERSTAND" : this.current.state, steps: this.current.steps + 1 }
    return result
  }
  recordEvidence(evidence: unknown): void { this.current = { ...this.current, evidence: [...this.current.evidence, evidence] } }
  recordEvidenceBundle(bundle: unknown): void { this.current = { ...this.current, evidenceBundles: [...this.current.evidenceBundles, bundle] }
  }
}
