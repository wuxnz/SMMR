import { createEvidenceBundle, type EvidenceBundle as SmmrEvidenceBundle } from "@smmr/core"
import type { ResearchResult } from "./types"

export function toSmmrEvidenceBundle(
  result: ResearchResult,
  taskDescription = result.query,
): SmmrEvidenceBundle {
  const externalDocs = result.evidence.map(({ source }) => `${source.title} — ${source.url}`)
  const retrievedSources = result.evidence.map(({ source }) => source.url)
  const retrievalContext = result.evidence
    .map((evidence) => `### ${evidence.source.title}\nClaim: ${evidence.claim}\n${evidence.excerpt}`)
    .join("\n\n")
  return createEvidenceBundle({
    task: { description: taskDescription },
    externalDocs,
    retrievalContext,
    retrievedSources,
  })
}
