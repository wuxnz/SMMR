import { classifyFailure } from "./failure"
import type { CommandExecutor, VerificationCheck, VerificationResult } from "./types"

export async function verify(executor: CommandExecutor, checks: readonly VerificationCheck[]): Promise<VerificationResult> {
  const results: { readonly check: VerificationCheck; readonly result: Awaited<ReturnType<CommandExecutor["execute"]>>; readonly failure: ReturnType<typeof classifyFailure> }[] = []
  for (const check of checks) {
    const result = await executor.execute(check.command)
    const failure = classifyFailure(result, check.kind)
    results.push({ check, result, failure })
    if (failure !== undefined && check.required !== false) break
  }
  return {
    passed: results.every(({ check, failure }) => failure === undefined || check.required === false),
    checks: results.map(({ check, result, failure }) => failure === undefined ? { check, result } : { check, result, failure }),
  }
}

export function repairHint(failure: ReturnType<typeof classifyFailure>): string {
  if (!failure) return "No repair is required."
  if (failure.kind === "test") return "Inspect the failing assertion and reproduce the smallest failing case before editing."
  if (failure.kind === "typecheck") return "Inspect the first type error and trace its input/output contract before changing callers."
  if (failure.kind === "lint") return "Apply the smallest style or static-analysis correction, then rerun the same check."
  if (failure.kind === "dependency") return "Confirm the dependency or generated input exists before retrying the command."
  if (failure.kind === "timeout") return "Reduce the command scope or raise the bounded timeout only with evidence."
  if (failure.kind === "permission") return "Stop and request an explicit permission or change the execution environment."
  return "Inspect the captured output and form a new failure hypothesis before retrying."
}
