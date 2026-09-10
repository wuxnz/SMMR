import { SmmrRuntimeSession } from "@smmr/core"
import type { OhMyOpenCodeConfig } from "../config"
import { extractPromptText } from "../hooks/auto-slash-command/detector"
import type { ChatMessagePart } from "./chat-message/types"

export function createSmmrChatSession(
  config: OhMyOpenCodeConfig,
  sessionID: string,
  parts: ChatMessagePart[],
  sessions: Map<string, SmmrRuntimeSession>,
): SmmrRuntimeSession | undefined {
  if (config.smmr?.enabled !== true || sessions.has(sessionID)) return undefined
  const objective = extractPromptText(parts).trim()
  if (objective.length === 0) return undefined
  const session = new SmmrRuntimeSession({ objective, settings: config.smmr })
  sessions.set(sessionID, session)
  return session
}
