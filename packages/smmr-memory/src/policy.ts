import type { MemoryCandidate, MemoryPolicy, MemoryValidation } from "./types"

function inUnitRange(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1
}

export function validateMemoryCandidate(candidate: MemoryCandidate, policy: MemoryPolicy): MemoryValidation {
  const reasons: string[] = []
  if (candidate.id.trim().length === 0) reasons.push("id must not be blank")
  if (candidate.content.trim().length === 0) reasons.push("content must not be blank")
  if (!inUnitRange(candidate.importance)) reasons.push("importance must be between 0 and 1")
  if (!inUnitRange(candidate.confidence)) reasons.push("confidence must be between 0 and 1")
  if (candidate.confidence < policy.minimumConfidence) reasons.push("confidence is below the memory policy threshold")
  if (policy.requireEvidence && candidate.evidenceIds.length === 0) reasons.push("memory requires at least one evidence reference")
  if (!Number.isFinite(Date.parse(candidate.createdAt))) reasons.push("createdAt must be an ISO timestamp")
  if (candidate.lastAccessedAt !== undefined && !Number.isFinite(Date.parse(candidate.lastAccessedAt))) reasons.push("lastAccessedAt must be an ISO timestamp")
  return { accepted: reasons.length === 0, reasons }
}

export function memoryScore(candidate: MemoryCandidate, policy: MemoryPolicy, now = new Date()): number {
  const lastAccessed = new Date(candidate.lastAccessedAt ?? candidate.createdAt).getTime()
  const ageDays = Math.max(0, now.getTime() - lastAccessed) / 86_400_000
  const decay = Math.pow(0.5, ageDays / Math.max(policy.halfLifeDays, 0.001))
  const evidenceBonus = candidate.evidenceIds.length > 0 ? 1 : 0.5
  return candidate.importance * candidate.confidence * evidenceBonus * decay
}
