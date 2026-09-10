import type { SmmrRuntimeSession } from "@smmr/core"

export function removeDeletedSmmrSession(
  input: unknown,
  sessions: Map<string, SmmrRuntimeSession>,
): boolean {
  const event = (input as { event?: { type?: unknown; properties?: unknown } } | undefined)?.event
  if (event?.type !== "session.deleted") return false

  const properties = event.properties as
    | { sessionID?: unknown; info?: { id?: unknown } }
    | undefined
  const sessionID =
    typeof properties?.sessionID === "string"
      ? properties.sessionID
      : typeof properties?.info?.id === "string"
        ? properties.info.id
        : undefined
  return sessionID !== undefined && sessions.delete(sessionID)
}

export async function advanceSmmrSessionAfterTool(
  input: { sessionID?: unknown; tool?: unknown },
  output: unknown,
  sessions: Map<string, SmmrRuntimeSession>,
): Promise<boolean> {
  if (output === undefined || typeof input.sessionID !== "string") return false
  const session = sessions.get(input.sessionID)
  if (!session || typeof input.tool !== "string") return false
  await session.runNextSkill(() => input.tool as string)
  return true
}
