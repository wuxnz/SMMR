import { createEvidence, type SmmrRuntimeSession } from "@smmr/core"

function sanitizeEvidenceExcerpt(value: string): string {
  return value
    .replace(/(authorization\s*:\s*bearer\s+)[^\s,;]+/gi, "$1[redacted]")
    .replace(/(\bbearer\s+)[A-Za-z0-9._~-]+/gi, "$1[redacted]")
    .replace(/(\b(?:api[-_ ]?key|token|secret|password)\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]")
}

export function removeDeletedSmmrSession(
  input: unknown,
  sessions: Map<string, SmmrRuntimeSession>,
): boolean {
  const event = (input as { event?: { type?: unknown; properties?: unknown } } | undefined)?.event
  if (event?.type !== "session.deleted") return false

  const properties = event.properties as
    | { sessionID?: unknown; info?: { id?: unknown } }
    | undefined
  const sessionID =
    typeof properties?.sessionID === "string"
      ? properties.sessionID
      : typeof properties?.info?.id === "string"
        ? properties.info.id
        : undefined
  return sessionID !== undefined && sessions.delete(sessionID)
}

export async function advanceSmmrSessionAfterTool(
  input: { sessionID?: unknown; tool?: unknown },
  output: unknown,
  sessions: Map<string, SmmrRuntimeSession>,
): Promise<boolean> {
  if (output === undefined || typeof input.sessionID !== "string") return false
  const session = sessions.get(input.sessionID)
  if (!session || typeof input.tool !== "string") return false
  await session.runNextSkill(() => input.tool as string)
  const rawOutput = (output as { output?: unknown } | undefined)?.output
  const excerpt = typeof rawOutput === "string"
    ? sanitizeEvidenceExcerpt(rawOutput.slice(0, 2_000))
    : ""
  session.recordEvidence(
    createEvidence({
      id: `opencode-tool:${input.sessionID}:${input.tool}:${Date.now()}`,
      kind: "observation",
      claim: `OpenCode tool ${input.tool} completed successfully`,
      content: excerpt.length > 0
        ? `OpenCode tool output excerpt:\n${excerpt}`
        : "The OpenCode tool-execute-after lifecycle completed with output.",
      source: input.tool,
      confidence: 1,
      verified: true,
    }),
  )
  return true
}
