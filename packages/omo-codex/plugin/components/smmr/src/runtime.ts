import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { createEvidence, createEvidenceBundle, SmmrRuntimeSession, type SmmrRuntimeSettings } from "../../../../../smmr-core/src/index.ts"
import { getCodexOmoConfig } from "../../../shared/src/config-loader.ts"

export interface CodexHookPayload {
  readonly cwd: string
  readonly hook_event_name: string
  readonly session_id: string
  readonly prompt?: string
  readonly tool_name?: string
  readonly tool_response?: unknown
}

interface PersistedSession {
  readonly objective: string
  readonly settings: SmmrRuntimeSettings
  readonly snapshot: ReturnType<NonNullable<SmmrRuntimeSession["controller"]>["snapshot"]>
}

const NETWORK_TOOL_PATTERN = /(?:^|[_:.\-])(webfetch|web[-_]?search|browser|open[-_]?url|fetch[-_]?url)(?:$|[_:.\-])/i
const RESEARCH_TOOL_PATTERN = /(?:^|[_:.\-])(research|cite|citation|web[-_]?search)(?:$|[_:.\-])/i
const MEMORY_WRITE_TOOL_PATTERN = /(?:^|[_:.\-])(memory|remember|memorize|save[-_]?memory|store[-_]?memory)(?:$|[_:.\-])/i

export type SmmrCodexOperation = "local" | "network" | "research" | "memory-write"

export function classifyOperation(toolName: string | undefined): SmmrCodexOperation {
  if (typeof toolName !== "string") return "local"
  if (MEMORY_WRITE_TOOL_PATTERN.test(toolName)) return "memory-write"
  if (RESEARCH_TOOL_PATTERN.test(toolName)) return "research"
  if (NETWORK_TOOL_PATTERN.test(toolName)) return "network"
  return "local"
}

function statePath(cwd: string, sessionID: string): string {
  return join(cwd, ".smmr", "runtime", "codex", `${encodeURIComponent(sessionID)}.json`)
}

function settingsFor(cwd: string): SmmrRuntimeSettings {
  const config = getCodexOmoConfig({ cwd })
  return config["smmr"] ?? {}
}

async function loadSession(payload: CodexHookPayload, objective?: string): Promise<SmmrRuntimeSession | undefined> {
  const settings = settingsFor(payload.cwd)
  if (settings.enabled !== true) return undefined
  const path = statePath(payload.cwd, payload.session_id)
  try {
    const persisted = JSON.parse(await readFile(path, "utf8")) as PersistedSession
    return new SmmrRuntimeSession({ objective: persisted.objective, settings: persisted.settings, snapshot: persisted.snapshot })
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error
  }
  return new SmmrRuntimeSession({ objective: objective?.trim() || "Continue the current coding task", settings })
}

async function saveSession(payload: CodexHookPayload, session: SmmrRuntimeSession): Promise<void> {
  const snapshot = session.snapshot()
  if (snapshot === undefined) return
  const path = statePath(payload.cwd, payload.session_id)
  await mkdir(join(payload.cwd, ".smmr", "runtime", "codex"), { recursive: true })
  await writeFile(path, `${JSON.stringify({ objective: session.objective, settings: settingsFor(payload.cwd), snapshot }, null, 2)}\n`, "utf8")
}

function policy(session: SmmrRuntimeSession): string {
  const snapshot = session.snapshot()
  const next = session.nextSkill()
  return `<smmr-mode>\nSMMR is enabled for this Codex session. State: ${snapshot?.state ?? "DISCOVER"}. Next skill: ${next?.name ?? "none"}. Use only permitted operations. Require evidence before verification or memory writes.\n</smmr-mode>`
}

function redact(value: string): string {
  return value
    .replace(/(authorization\s*:\s*bearer\s+)[^\s,;]+/gi, "$1[redacted]")
    .replace(/(\bbearer\s+)[A-Za-z0-9._~-]+/gi, "$1[redacted]")
    .replace(/(\b(?:api[-_ ]?key|token|secret|password)\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]")
}

export async function handleUserPrompt(payload: CodexHookPayload): Promise<string> {
  const session = await loadSession(payload, payload.prompt)
  if (session === undefined) return ""
  await saveSession(payload, session)
  return JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: policy(session) } })
}

export async function handlePreToolUse(payload: CodexHookPayload): Promise<string> {
  const session = await loadSession(payload)
  if (session === undefined) return ""
  try {
    const skill = session.nextSkill()
    if (skill !== undefined) await session.execute(skill.operation, () => undefined)
    await session.execute(classifyOperation(payload.tool_name), () => undefined)
    await saveSession(payload, session)
    return ""
  } catch (error) {
    return JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: error instanceof Error ? error.message : String(error), additionalContext: "SMMR denied this operation because its permission is disabled." } })
  }
}

export async function handlePostToolUse(payload: CodexHookPayload): Promise<string> {
  const session = await loadSession(payload)
  if (session === undefined) return ""
  const output = typeof payload.tool_response === "string" ? payload.tool_response : JSON.stringify(payload.tool_response ?? "")
  await session.runNextSkill(() => payload.tool_name ?? "tool")
  const excerpt = redact(output.slice(0, 2_000))
  const evidenceInput = { id: `codex-tool:${payload.session_id}:${payload.tool_name ?? "tool"}:${Date.now()}`, kind: "observation" as const, claim: `Codex tool ${payload.tool_name ?? "tool"} completed successfully`, content: excerpt || "Codex tool completed successfully.", confidence: 1, verified: true }
  if (payload.tool_name !== undefined) session.recordEvidence(createEvidence({ ...evidenceInput, source: payload.tool_name }))
  else session.recordEvidence(createEvidence(evidenceInput))
  session.recordEvidenceBundle(createEvidenceBundle({ task: { description: session.objective }, relevantFiles: classifyOperation(payload.tool_name) === "local" ? [payload.tool_name ?? "tool"] : [], externalDocs: ["network", "research"].includes(classifyOperation(payload.tool_name)) ? [payload.tool_name ?? "tool"] : [], previousExperiences: classifyOperation(payload.tool_name) === "memory-write" ? [payload.tool_name ?? "tool"] : [], retrievalContext: excerpt, retrievedSources: [payload.tool_name ?? "tool"] }))
  await saveSession(payload, session)
  return ""
}
