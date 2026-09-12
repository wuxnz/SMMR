import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { classifyOperation, handlePreToolUse, handleUserPrompt } from "../src/runtime.js"

test("classifies Codex tools at the SMMR operation boundary", () => {
  expect(classifyOperation("webfetch")).toBe("network")
  expect(classifyOperation("research_search")).toBe("research")
  expect(classifyOperation("memory_store")).toBe("memory-write")
  expect(classifyOperation("apply_patch")).toBe("local")
})

test("stays inert when the unified SMMR config is disabled", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "smmr-codex-disabled-"))
  expect(await handleUserPrompt({ cwd, hook_event_name: "UserPromptSubmit", session_id: "s1", prompt: "inspect" })).toBe("")
})

test("injects policy and persists a session when SMMR is enabled", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "smmr-codex-enabled-"))
  await mkdir(join(cwd, ".omo"), { recursive: true })
  await writeFile(join(cwd, ".omo", "omo.jsonc"), JSON.stringify({ smmr: { enabled: true, model: "ollama:qwen3.5:4b" } }))
  const output = await handleUserPrompt({ cwd, hook_event_name: "UserPromptSubmit", session_id: "s1", prompt: "inspect" })
  expect(output).toContain("UserPromptSubmit")
  expect(output).toContain("smmr-repository-analysis")
  const persisted = JSON.parse(await readFile(join(cwd, ".smmr", "runtime", "codex", "s1.json"), "utf8")) as { objective: string }
  expect(persisted.objective).toBe("inspect")
})

test("denies research tools when research permission is disabled", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "smmr-codex-permission-"))
  await mkdir(join(cwd, ".omo"), { recursive: true })
  await writeFile(join(cwd, ".omo", "omo.jsonc"), JSON.stringify({ smmr: { enabled: true, model: "ollama:qwen3.5:4b" } }))
  await handleUserPrompt({ cwd, hook_event_name: "UserPromptSubmit", session_id: "s1", prompt: "inspect" })
  const output = await handlePreToolUse({ cwd, hook_event_name: "PreToolUse", session_id: "s1", tool_name: "research_search" })
  expect(output).toContain('"permissionDecision":"deny"')
  expect(output).toContain("research permission")
})
