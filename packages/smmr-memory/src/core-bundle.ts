import { createEvidenceBundle, type EvidenceBundle as SmmrEvidenceBundle } from "@smmr/core"
import type { MemoryCandidate } from "./types"

export function toSmmrEvidenceBundle(
  entries: readonly MemoryCandidate[],
  taskDescription: string,
): SmmrEvidenceBundle {
  const priorExperiences = entries.map((entry) => `${entry.kind}:${entry.id} — ${entry.content}`)
  const retrievalContext = entries
    .map((entry) => `### ${entry.kind}:${entry.id}\nTags: ${entry.tags.join(", ")}\nConfidence: ${entry.confidence}\n${entry.content}`)
    .join("\n\n")
  return createEvidenceBundle({
    task: { description: taskDescription },
    previousExperiences: priorExperiences,
    retrievalContext,
    retrievedSources: entries.map((entry) => entry.id),
  })
}
