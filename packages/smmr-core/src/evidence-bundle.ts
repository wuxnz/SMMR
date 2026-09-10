export interface EvidenceBundleInput {
  readonly task: { readonly description: string }
  readonly repository?: Readonly<Record<string, string>>
  readonly relevantFiles?: readonly string[]
  readonly localExamples?: readonly string[]
  readonly externalDocs?: readonly string[]
  readonly similarIssues?: readonly string[]
  readonly previousExperiences?: readonly string[]
  readonly constraints?: readonly string[]
}

export interface EvidenceBundle {
  readonly task: { readonly description: string }
  readonly repository: Readonly<Record<string, string>>
  readonly relevantFiles: readonly string[]
  readonly localExamples: readonly string[]
  readonly externalDocs: readonly string[]
  readonly similarIssues: readonly string[]
  readonly previousExperiences: readonly string[]
  readonly constraints: readonly string[]
}

function copyList(values: readonly string[] | undefined): readonly string[] {
  return [...(values ?? [])]
}

export function createEvidenceBundle(input: EvidenceBundleInput): EvidenceBundle {
  const description = input.task.description.trim()
  if (description.length === 0) throw new Error("Evidence bundle task description must not be empty")
  return {
    task: { description },
    repository: { ...(input.repository ?? {}) },
    relevantFiles: copyList(input.relevantFiles),
    localExamples: copyList(input.localExamples),
    externalDocs: copyList(input.externalDocs),
    similarIssues: copyList(input.similarIssues),
    previousExperiences: copyList(input.previousExperiences),
    constraints: copyList(input.constraints),
  }
}
