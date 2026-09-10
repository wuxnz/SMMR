import { rankLexical } from "./lexical"
import { DocumentGraph } from "./structure"
import type { EvidenceBundle, RetrievalDocument, RetrievalQuery, RetrievalMatch } from "./types"

export function retrieveEvidence(documents: readonly RetrievalDocument[], query: RetrievalQuery): EvidenceBundle {
  const lexical = rankLexical(documents, query)
  const graph = new DocumentGraph(documents)
  const related = lexical.flatMap((match) => graph.related(match.document.id).map((document) => ({ document, score: match.score * 0.5, reasons: ["structurally related"] })))
  const matches = mergeMatches([...lexical, ...related], query.limit ?? 10)
  const context = compileContext(matches)
  return { query, matches, context, sources: matches.map((match) => match.document.path) }
}

export function compileContext(matches: readonly RetrievalMatch[], maxChars = 12_000): string {
  const blocks: string[] = []
  let length = 0
  for (const match of matches) {
    const block = `### ${match.document.path}\n${match.document.content}`
    if (length + block.length + 2 > maxChars) break
    blocks.push(block)
    length += block.length + 2
  }
  return blocks.join("\n\n")
}

function mergeMatches(matches: readonly RetrievalMatch[], limit: number): readonly RetrievalMatch[] {
  const merged = new Map<string, RetrievalMatch>()
  for (const match of matches) {
    const previous = merged.get(match.document.id)
    merged.set(match.document.id, previous === undefined ? match : { ...previous, score: previous.score + match.score, reasons: [...new Set([...previous.reasons, ...match.reasons])] })
  }
  return [...merged.values()].sort((a, b) => b.score - a.score || a.document.path.localeCompare(b.document.path)).slice(0, limit)
}
