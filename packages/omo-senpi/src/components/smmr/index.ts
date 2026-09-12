import { mkdir, readFile, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
type SmmrRuntimeSettings = { readonly enabled?: boolean; readonly model?: string; readonly allow_network?: boolean; readonly allow_memory_writes?: boolean; readonly allow_research?: boolean }
type SmmrRuntimeSession = { readonly objective: string; readonly allowNetwork: boolean; readonly allowMemoryWrites: boolean; readonly allowResearch: boolean; snapshot(): Snapshot; nextSkill(): { name: string }; runNextSkill<T>(action: (skill: { name: string }) => T | Promise<T>): Promise<T>; recordEvidence(value: unknown): void; recordEvidenceBundle(value: unknown): void }
type Snapshot = { readonly state: string; readonly steps: number; readonly retries: number; readonly reflections: readonly unknown[]; readonly transitions: readonly unknown[]; readonly evidence: readonly unknown[]; readonly evidenceBundles: readonly unknown[]; readonly exhausted: boolean }

import type { ComponentContext, OmoSenpiComponent, SenpiExtensionAPI } from "../../extension/types"

type SessionContext = { readonly sessionManager?: { readonly getSessionId?: () => unknown } }
type InputEvent = { readonly type?: unknown; readonly text?: unknown }
type ToolResultEvent = { readonly type?: unknown; readonly toolName?: unknown; readonly isError?: unknown; readonly content?: unknown }
type PersistedSession = { readonly objective: string; readonly settings: SmmrRuntimeSettings; readonly snapshot: NonNullable<ReturnType<SmmrRuntimeSession["snapshot"]>> }
type RuntimeModule = typeof import("./runtime")

let runtimeModule: Promise<RuntimeModule> | undefined
function loadRuntime(): Promise<RuntimeModule> {
  return runtimeModule ??= import("./runtime")
}

function sessionId(context: unknown): string | undefined {
  const manager = (context as SessionContext | undefined)?.sessionManager
  const value = manager?.getSessionId?.()
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function redact(value: string): string {
  return value
    .replace(/(authorization\s*:\s*bearer\s+)[^\s,;]+/gi, "$1[redacted]")
    .replace(/(\bbearer\s+)[A-Za-z0-9._~-]+/gi, "$1[redacted]")
    .replace(/(\b(?:api[-_ ]?key|token|secret|password)\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]")
}

function runtimePath(cwd: string, id: string): string {
  return join(cwd, ".smmr", "runtime", "senpi", `${encodeURIComponent(id)}.json`)
}

async function readSettings(path: string): Promise<SmmrRuntimeSettings | undefined> {
  try {
    const source = await readFile(path, "utf8")
    const json = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1").replace(/,\s*([}\]])/g, "$1")
    const parsed = JSON.parse(json) as Record<string, unknown>
    const value = parsed["smmr"]
    return typeof value === "object" && value !== null ? value as SmmrRuntimeSettings : undefined
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return undefined
    return undefined
  }
}

async function settingsFor(cwd: string): Promise<SmmrRuntimeSettings> {
  const home = process.env["HOME"] ?? homedir()
  const candidates = [
    join(home, ".smmr", "smmr.jsonc"),
    join(home, ".smmr", "smmr.json"),
    join(cwd, ".smmr", "smmr.jsonc"),
    join(cwd, ".smmr", "smmr.json"),
    join(cwd, ".omo", "omo.jsonc"),
    join(cwd, ".omo", "omo.json"),
  ]
  let settings: SmmrRuntimeSettings = {}
  for (const path of candidates) {
    const loaded = await readSettings(path)
    if (loaded !== undefined) settings = { ...settings, ...loaded }
  }
  return settings
}

async function loadSession(cwd: string, id: string, objective?: string): Promise<SmmrRuntimeSession | undefined> {
  const settings = await settingsFor(cwd)
  if (settings.enabled !== true) return undefined
  try {
    const persisted = JSON.parse(await readFile(runtimePath(cwd, id), "utf8")) as PersistedSession
    return new (await loadRuntime()).SmmrRuntimeSession({ objective: persisted.objective, settings: persisted.settings, snapshot: persisted.snapshot })
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error
  }
  return new (await loadRuntime()).SmmrRuntimeSession({ objective: objective?.trim() || "Continue the current coding task", settings })
}

async function saveSession(cwd: string, id: string, session: SmmrRuntimeSession): Promise<void> {
  const snapshot = session.snapshot()
  if (snapshot === undefined) return
  await mkdir(join(cwd, ".smmr", "runtime", "senpi"), { recursive: true })
  await writeFile(runtimePath(cwd, id), `${JSON.stringify({ objective: session.objective, settings: await settingsFor(cwd), snapshot }, null, 2)}\n`, "utf8")
}

function policy(session: SmmrRuntimeSession): string {
  return `<smmr-mode>\nSMMR is enabled for this Senpi session. State: ${session.snapshot()?.state ?? "DISCOVER"}. Next skill: ${session.nextSkill()?.name ?? "none"}. Use only permitted operations and require evidence before verification or memory writes.\n</smmr-mode>`
}

function outputText(content: unknown): string {
  if (typeof content === "string") return content
  if (!Array.isArray(content)) return JSON.stringify(content ?? "")
  return content.map((part) => typeof part === "object" && part !== null && "text" in part && typeof part.text === "string" ? part.text : JSON.stringify(part)).join("\n")
}

export function createSmmrComponent(options: { readonly resolveCwd?: () => string } = {}): OmoSenpiComponent {
  const resolveCwd = options.resolveCwd ?? (() => process.cwd())
  return {
    name: "smmr",
    register(pi: SenpiExtensionAPI, ctx: ComponentContext): void {
      const cwd = pi.cwd ?? resolveCwd()
      const sessions = new Map<string, SmmrRuntimeSession>()
      pi.on("input", async (payload: unknown, eventCtx: unknown) => {
        const event = payload as InputEvent
        if (event.type !== "input") return
        const id = sessionId(eventCtx)
        if (id === undefined) return
        const session = await loadSession(cwd, id, typeof event.text === "string" ? event.text : undefined)
        if (session === undefined) return
        sessions.set(id, session)
        await saveSession(cwd, id, session)
        await pi.sendMessage({ customType: "omo-smmr:policy", content: policy(session), display: false })
      })
      pi.on("tool_result", async (payload: unknown, eventCtx: unknown) => {
        const event = payload as ToolResultEvent
        if (event.type !== "tool_result" || event.isError === true) return
        const id = sessionId(eventCtx)
        if (id === undefined) return
        const session = sessions.get(id) ?? await loadSession(cwd, id)
        if (session === undefined) return
        try {
          await session.runNextSkill(() => typeof event.toolName === "string" ? event.toolName : "tool")
          const tool = typeof event.toolName === "string" ? event.toolName : "tool"
          const excerpt = redact(outputText(event.content).slice(0, 2_000))
          const { createEvidence, createEvidenceBundle } = await loadRuntime()
          session.recordEvidence(createEvidence({ id: `senpi-tool:${id}:${tool}:${Date.now()}`, kind: "observation", claim: `Senpi tool ${tool} completed successfully`, content: excerpt || "Senpi tool completed successfully.", source: tool, confidence: 1, verified: true }))
          session.recordEvidenceBundle(createEvidenceBundle({ task: { description: session.objective }, relevantFiles: [tool], retrievalContext: excerpt, retrievedSources: [tool] }))
          sessions.set(id, session)
          await saveSession(cwd, id, session)
        } catch (error) {
          ctx.logger.warn("omo-senpi SMMR tool completion did not advance", { error })
        }
      })
      pi.on("session_shutdown", (_payload: unknown, eventCtx: unknown) => {
        const id = sessionId(eventCtx)
        if (id !== undefined) sessions.delete(id)
      })
    },
  }
}
