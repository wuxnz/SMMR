export type DocumentKind = "code" | "test" | "documentation" | "memory" | "external"

export interface RetrievalDocument {
  readonly id: string
  readonly path: string
  readonly content: string
  readonly kind: DocumentKind
  readonly symbols?: readonly string[]
  readonly imports?: readonly string[]
  readonly testFor?: readonly string[]
}

export interface RetrievalQuery {
  readonly text: string
  readonly limit?: number
  readonly kinds?: readonly DocumentKind[]
}

export interface RetrievalMatch {
  readonly document: RetrievalDocument
  readonly score: number
  readonly reasons: readonly string[]
}

export interface EvidenceBundle {
  readonly query: RetrievalQuery
  readonly matches: readonly RetrievalMatch[]
  readonly context: string
  readonly sources: readonly string[]
}
