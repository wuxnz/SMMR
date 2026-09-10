import { describe, expect, test } from "bun:test"
import { classifyFailure } from "./failure"
import { repairHint, verify } from "./verify"
import { toSmmrEvidenceBundle } from "./core-bundle"
import type { CommandExecutor, CommandResult, VerificationCheck } from "./types"

const check = (kind: VerificationCheck["kind"], name?: string): VerificationCheck => ({ name: name ?? kind, kind, command: { command: name ?? kind } })
const result = (overrides: Partial<CommandResult> = {}): CommandResult => ({ exitCode: 0, stdout: "", stderr: "", durationMs: 1, timedOut: false, ...overrides })

describe("SMMR execution", () => {
  test("classifies failures from bounded command results", () => {
    expect(classifyFailure(result({ timedOut: true, exitCode: null }))).toMatchObject({ kind: "timeout", retryable: true })
    expect(classifyFailure(result({ exitCode: 1, stderr: "Type error: missing property" }))).toMatchObject({ kind: "typecheck", retryable: true })
    expect(classifyFailure(result({ exitCode: 1, stderr: "permission denied" }))).toMatchObject({ kind: "permission", retryable: false })
  })

  test("stops after a required verification failure", async () => {
    const calls: string[] = []
    const executor: CommandExecutor = { execute: async (spec) => { calls.push(spec.command); return spec.command === "test" ? result({ exitCode: 1, stderr: "expected true to be false" }) : result() } }
    const verification = await verify(executor, [check("test"), check("typecheck")])
    expect(verification.passed).toBe(false)
    expect(calls).toEqual(["test"])
    expect(verification.checks[0]?.failure?.kind).toBe("test")
  })

  test("allows optional checks to fail while required checks pass", async () => {
    const executor: CommandExecutor = { execute: async (spec) => spec.command === "lint" ? result({ exitCode: 1, stderr: "lint error" }) : result() }
    const verification = await verify(executor, [{ ...check("lint"), required: false }, check("typecheck")])
    expect(verification.passed).toBe(true)
    expect(verification.checks).toHaveLength(2)
  })

  test("returns a targeted repair hint", () => {
    expect(repairHint(classifyFailure(result({ exitCode: 1, stderr: "test assertion failed" })))).toContain("failing assertion")
    expect(repairHint(undefined)).toBe("No repair is required.")
  })

  test("converts verification results into bounded execution evidence", async () => {
    const verification = await verify(
      { execute: async () => result({ stdout: "all tests passed" }) },
      [check("test", "unit-tests")],
    )
    const bundle = toSmmrEvidenceBundle(verification, "Verify the change")
    expect(bundle.retrievedSources).toEqual(["unit-tests"])
    expect(bundle.retrievalContext).toContain("Status: passed")
    expect(bundle.retrievalContext).toContain("all tests passed")
  })
})
