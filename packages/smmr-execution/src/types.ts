export interface CommandSpec {
  readonly command: string
  readonly args?: readonly string[]
  readonly cwd?: string
  readonly timeoutMs?: number
}

export interface CommandResult {
  readonly exitCode: number | null
  readonly stdout: string
  readonly stderr: string
  readonly durationMs: number
  readonly timedOut: boolean
}

export interface CommandExecutor {
  execute(spec: CommandSpec): Promise<CommandResult>
}

export type FailureKind = "test" | "typecheck" | "lint" | "dependency" | "timeout" | "permission" | "unknown"

export interface FailureClassification {
  readonly kind: FailureKind
  readonly summary: string
  readonly retryable: boolean
}

export interface VerificationCheck {
  readonly name: string
  readonly kind: Exclude<FailureKind, "unknown" | "permission" | "dependency">
  readonly command: CommandSpec
  readonly required?: boolean
}

export interface VerificationResult {
  readonly passed: boolean
  readonly checks: readonly { readonly check: VerificationCheck; readonly result: CommandResult; readonly failure?: FailureClassification }[]
}
