import { createEvidenceBundle, type EvidenceBundle as SmmrEvidenceBundle } from "@smmr/core"
import type { EvidenceBundle as RetrievalEvidenceBundle } from "./types"

export function toSmmrEvidenceBundle(
  retrieval: RetrievalEvidenceBundle,
  taskDescription: string,
): SmmrEvidenceBundle {
  const paths = retrieval.matches.map((match) => match.document.path)
  return createEvidenceBundle({
    task: { description: taskDescription },
    relevantFiles: retrieval.matches
      .filter((match) => match.document.kind === "code" || match.document.kind === "test")
      .map((match) => match.document.path),
    localExamples: retrieval.matches
      .filter((match) => match.document.kind === "test")
      .map((match) => match.document.path),
    externalDocs: retrieval.matches
      .filter((match) => match.document.kind === "documentation" || match.document.kind === "external")
      .map((match) => match.document.path),
    previousExperiences: retrieval.matches
      .filter((match) => match.document.kind === "memory")
      .map((match) => match.document.path),
    retrievalContext: retrieval.context,
    retrievedSources: paths,
  })
}
