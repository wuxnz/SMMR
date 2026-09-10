import type { SmmrRuntimeSession } from "@smmr/core"

export const SMMR_MODE_TAG = "<smmr-mode>"

export function getSmmrSystemPolicy(
  sessionID: string | undefined,
  sessions: Map<string, SmmrRuntimeSession>,
): string | undefined {
  if (!sessionID) return undefined
  const session = sessions.get(sessionID)
  if (!session) return undefined

  const skills = session.skills.map((skill) => skill.name).join(", ")
  return `${SMMR_MODE_TAG}\nSMMR is enabled for this task. Follow the bounded controller workflow.\nState: ${session.snapshot()?.state ?? "DISCOVER"}.\nAvailable foundational skills: ${skills}.\nUse only operations permitted by the runtime session; require evidence before verification or memory writes.\n</smmr-mode>`
}
