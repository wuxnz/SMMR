import type { EvidenceBundle } from "@smmr/core"
import type { TrajectoryRecorder } from "./recorder"

export function recordEvidenceBundle(
  recorder: TrajectoryRecorder,
  bundle: EvidenceBundle,
  timestamp = new Date().toISOString(),
): void {
  recorder.record({
    kind: "evidence",
    timestamp,
    name: "evidence-bundle",
    payload: {
      task: bundle.task,
      repository: bundle.repository,
      relevantFiles: bundle.relevantFiles,
      localExamples: bundle.localExamples,
      externalDocs: bundle.externalDocs,
      similarIssues: bundle.similarIssues,
      previousExperiences: bundle.previousExperiences,
      constraints: bundle.constraints,
      retrievalContext: bundle.retrievalContext,
      retrievedSources: bundle.retrievedSources,
    },
  })
}
