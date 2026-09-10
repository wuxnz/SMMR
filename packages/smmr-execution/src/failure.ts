import type { CommandResult, FailureClassification, FailureKind } from "./types"

export function classifyFailure(result: CommandResult, expectedKind?: FailureKind): FailureClassification | undefined {
  if (result.exitCode === 0 && !result.timedOut) return undefined
  const output = `${result.stderr}\n${result.stdout}`.toLocaleLowerCase()
  if (result.timedOut) return { kind: "timeout", summary: "command exceeded its execution budget", retryable: true }
  if (/permission denied|operation not permitted|eacces/iu.test(output)) return { kind: "permission", summary: "command was denied by the operating system", retryable: false }
  if (/cannot find module|module not found|no such file|could not resolve|install .*dependenc/iu.test(output)) return { kind: "dependency", summary: "the command is missing a dependency or input", retryable: false }
  const kind = expectedKind ?? (/type error|tsgo|typescript/iu.test(output) ? "typecheck" : /lint|eslint|format/iu.test(output) ? "lint" : /test|assert|expect/iu.test(output) ? "test" : "unknown")
  return { kind, summary: output.trim().split(/\r?\n/u).find(Boolean) ?? "command failed", retryable: kind === "test" || kind === "typecheck" || kind === "lint" }
}
