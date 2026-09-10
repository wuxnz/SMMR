export type EvidenceKind = "observation" | "command" | "test" | "source" | "artifact"

export interface Evidence {
  readonly id: string
  readonly kind: EvidenceKind
  readonly claim: string
  readonly content: string
  readonly source?: string
  readonly confidence: number
  readonly verified: boolean
  readonly recordedAt: string
}

export function createEvidence(input: Omit<Evidence, "recordedAt"> & { recordedAt?: string }): Evidence {
  return { ...input, recordedAt: input.recordedAt ?? new Date().toISOString() }
}
