import type { RetrievalDocument } from "./types"

export class DocumentGraph {
  readonly documents: readonly RetrievalDocument[]
  #byId: ReadonlyMap<string, RetrievalDocument>

  constructor(documents: readonly RetrievalDocument[]) {
    this.documents = documents
    this.#byId = new Map(documents.map((document) => [document.id, document]))
  }

  related(documentId: string): readonly RetrievalDocument[] {
    const document = this.#byId.get(documentId)
    if (!document) return []
    const relatedIds = new Set([...(document.imports ?? []), ...(document.testFor ?? [])])
    for (const candidate of this.documents) {
      if (candidate.imports?.includes(documentId) || candidate.testFor?.includes(documentId)) relatedIds.add(candidate.id)
    }
    return [...relatedIds].map((id) => this.#byId.get(id)).filter((candidate): candidate is RetrievalDocument => candidate !== undefined)
  }

  testsFor(documentId: string): readonly RetrievalDocument[] {
    const document = this.#byId.get(documentId)
    if (!document) return []
    return this.documents.filter((candidate) => candidate.kind === "test" && (candidate.testFor?.includes(documentId) || candidate.testFor?.includes(document.path) || candidate.path.includes(document.path.replace(/\.[^.]+$/u, ""))))
  }
}
