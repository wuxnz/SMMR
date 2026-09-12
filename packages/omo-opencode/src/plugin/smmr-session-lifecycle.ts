import { createEvidence, createEvidenceBundle, type SmmrRuntimeSession } from "@smmr/core"

function sanitizeEvidenceExcerpt(value: string): string {
  return value
    .replace(/(authorization\s*:\s*bearer\s+)[^\s,;]+/gi, "$1[redacted]")
    .replace(/(\bbearer\s+)[A-Za-z0-9._~-]+/gi, "$1[redacted]")
    .replace(/(\b(?:api[-_ ]?key|token|secret|password)\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]")
}

export async function assertSmmrSessionCanRunNextSkill(session: SmmrRuntimeSession): Promise<void> {
  await assertSmmrToolCanRun(session)
}

const NETWORK_TOOL_PATTERN = /(?:^|[_:-])(webfetch|web[-_]?search|browser|open[-_]?url|fetch[-_]?url)(?:$|[_:-])/i
const RESEARCH_TOOL_PATTERN = /(?:^|[_:-])(research|cite|citation|web[-_]?search)(?:$|[_:-])/i
const MEMORY_WRITE_TOOL_PATTERN = /(?:^|[_:-])(memory|remember|memorize|save[-_]?memory|store[-_]?memory)(?:$|[_:-])/i

export type SmmrToolEvidenceSection = "local" | "external" | "memory"

export function getSmmrToolOperation(tool?: string): "local" | "network" | "research" | "memory-write" {
  if (typeof tool !== "string") return "local"
  if (MEMORY_WRITE_TOOL_PATTERN.test(tool)) return "memory-write"
  if (RESEARCH_TOOL_PATTERN.test(tool)) return "research"
  if (NETWORK_TOOL_PATTERN.test(tool)) return "network"
  return "local"
}

function getSmmrToolEvidenceSection(tool: string): SmmrToolEvidenceSection {
  const operation = getSmmrToolOperation(tool)
  if (operation === "research" || operation === "network") return "external"
  if (operation === "memory-write") return "memory"
  return "local"
}

export async function assertSmmrToolCanRun(
  session: SmmrRuntimeSession,
  tool?: string,
): Promise<void> {
  const skill = session.nextSkill()
  if (skill !== undefined) await session.execute(skill.operation, () => undefined)
  await session.execute(getSmmrToolOperation(tool), () => undefined)
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
  const evidenceSection = getSmmrToolEvidenceSection(input.tool)
  session.recordEvidenceBundle(createEvidenceBundle({
    task: { description: session.objective },
    relevantFiles: evidenceSection === "local" ? [input.tool] : [],
    externalDocs: evidenceSection === "external" ? [input.tool] : [],
    previousExperiences: evidenceSection === "memory" ? [input.tool] : [],
    retrievalContext: excerpt,
    retrievedSources: [input.tool],
  }))
  return true
}
