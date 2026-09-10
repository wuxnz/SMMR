import type { SmmrRuntimeSession } from "@smmr/core"

export type SmmrChatModelOutput = { model?: { providerID: string; modelID: string } }

export function applySmmrModelOverride(
  sessionID: string,
  output: SmmrChatModelOutput,
  sessions: Map<string, SmmrRuntimeSession>,
): boolean {
  const model = sessions.get(sessionID)?.model
  if (!model) return false
  const separator = model.includes("/") ? "/" : ":"
  const index = model.indexOf(separator)
  if (index <= 0 || index === model.length - 1) return false
  output.model = { providerID: model.slice(0, index), modelID: model.slice(index + 1) }
  return true
}
