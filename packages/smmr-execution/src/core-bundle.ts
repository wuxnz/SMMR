import { createEvidenceBundle, type EvidenceBundle as SmmrEvidenceBundle } from "@smmr/core"
import type { VerificationResult } from "./types"

const MAX_OUTPUT_CHARS = 12_000

export function toSmmrEvidenceBundle(
  result: VerificationResult,
  taskDescription: string,
): SmmrEvidenceBundle {
  const context = result.checks
    .map(({ check, result: commandResult, failure }) => {
      const output = `${commandResult.stdout}\n${commandResult.stderr}`.trim().slice(0, MAX_OUTPUT_CHARS)
      const status = failure === undefined ? "passed" : `failed: ${failure.kind} — ${failure.summary}`
      return `### ${check.name}\nCommand: ${check.command.command}\nStatus: ${status}\n${output}`
    })
    .join("\n\n")
  return createEvidenceBundle({
    task: { description: taskDescription },
    retrievalContext: context,
    retrievedSources: result.checks.map(({ check }) => check.name),
  })
}
