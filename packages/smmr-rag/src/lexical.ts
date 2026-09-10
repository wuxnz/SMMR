import type { RetrievalDocument, RetrievalMatch, RetrievalQuery } from "./types"

export function tokenize(value: string): readonly string[] {
  return [...new Set(value.toLocaleLowerCase().match(/[a-z0-9_$.-]+/giu) ?? [])]
}

export function rankLexical(documents: readonly RetrievalDocument[], query: RetrievalQuery): readonly RetrievalMatch[] {
  const terms = tokenize(query.text)
  if (terms.length === 0) return []
  const phrase = query.text.trim().toLocaleLowerCase()
  return documents
    .filter((document) => query.kinds === undefined || query.kinds.includes(document.kind))
    .map((document) => {
      const path = document.path.toLocaleLowerCase()
      const content = document.content.toLocaleLowerCase()
      const symbols = (document.symbols ?? []).join(" ").toLocaleLowerCase()
      const reasons: string[] = []
      const matched = terms.filter((term) => path.includes(term) || content.includes(term) || symbols.includes(term))
      if (path.includes(phrase)) reasons.push("exact path phrase")
      if (content.includes(phrase)) reasons.push("exact content phrase")
      if (matched.length > 0) reasons.push(`${matched.length}/${terms.length} query terms`)
      const termCoverage = matched.length / terms.length
      const pathBoost = matched.some((term) => path.includes(term)) ? 0.25 : 0
      const symbolBoost = matched.some((term) => symbols.includes(term)) ? 0.2 : 0
      const phraseBoost = content.includes(phrase) || path.includes(phrase) ? 0.5 : 0
      return { document, score: termCoverage + pathBoost + symbolBoost + phraseBoost, reasons }
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.document.path.localeCompare(b.document.path))
    .slice(0, query.limit ?? 10)
}
