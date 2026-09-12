import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, test } from "bun:test"

import { FakeExtensionAPI } from "../../../test-support/fake-extension-api"
import { createSmmrComponent } from "."

describe("createSmmrComponent", () => {
  test("stays inert when SMMR is disabled", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "smmr-senpi-disabled-"))
    const pi = new FakeExtensionAPI()
    pi.cwd = cwd
    createSmmrComponent().register(pi, { logger: { warn() {}, info() {}, error() {} }, config: { getFlag: () => undefined } })
    const result = await pi.dispatch("input", { type: "input", text: "inspect" }, { sessionManager: { getSessionId: () => "s1" } })
    expect(result).toEqual([undefined])
    expect(pi.messages).toHaveLength(0)
  })

  test("injects policy and persists evidence for an enabled session", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "smmr-senpi-enabled-"))
    await mkdir(join(cwd, ".omo"), { recursive: true })
    await writeFile(join(cwd, ".omo", "omo.jsonc"), JSON.stringify({ smmr: { enabled: true, model: "ollama:qwen3.5:4b" } }))
    const pi = new FakeExtensionAPI()
    pi.cwd = cwd
    createSmmrComponent().register(pi, { logger: { warn() {}, info() {}, error() {} }, config: { getFlag: () => undefined } })
    const context = { sessionManager: { getSessionId: () => "s1" } }
    await pi.dispatch("input", { type: "input", text: "inspect" }, context)
    expect(pi.messages[0]?.message.content).toContain("smmr-repository-analysis")
    await pi.dispatch("tool_result", { type: "tool_result", toolName: "read", content: [{ type: "text", text: "ok" }] }, context)
    const state = JSON.parse(await readFile(join(cwd, ".smmr", "runtime", "senpi", "s1.json"), "utf8")) as { snapshot: { state: string; evidence: unknown[] } }
    expect(state.snapshot.state).toBe("UNDERSTAND")
    expect(state.snapshot.evidence).toHaveLength(1)
  })
})
