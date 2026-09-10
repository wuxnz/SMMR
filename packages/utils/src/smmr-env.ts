export type SmmrEnvSource = Readonly<Record<string, string | undefined>>

/** Resolve a canonical SMMR variable while preserving the legacy OMO fallback. */
export function resolveSmmrEnv(name: string, env: SmmrEnvSource = process.env): string | undefined {
  const smmrValue = env[`SMMR_${name}`]
  return smmrValue === undefined ? env[`OMO_${name}`] : smmrValue
}
