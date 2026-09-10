import type { ModelAdapter, ModelResponse, ModelToolCall } from "./types"

export interface OllamaAdapterOptions {
  readonly baseUrl?: string
  readonly fetchImpl?: (input: URL | RequestInfo, init?: RequestInit) => Promise<Response>
}

interface OllamaToolCall {
  readonly function?: { readonly name?: string; readonly arguments?: Record<string, unknown> }
}

interface OllamaResponse {
  readonly model?: string
  readonly message?: { readonly content?: string; readonly tool_calls?: readonly OllamaToolCall[] }
  readonly done_reason?: string
  readonly prompt_eval_count?: number
  readonly eval_count?: number
}

function normalizeToolCalls(calls: readonly OllamaToolCall[] | undefined): readonly ModelToolCall[] {
  return (calls ?? []).flatMap((call, index) => {
    const name = call.function?.name
    if (!name) return []
    return [{ id: `ollama-call-${index + 1}`, name, arguments: call.function?.arguments ?? {} }]
  })
}

function normalizeFinishReason(reason: string | undefined, hasTools: boolean): ModelResponse["finishReason"] {
  if (hasTools || reason === "tool_calls") return "tool_calls"
  if (reason === "length") return "length"
  if (reason === "stop") return "stop"
  return "unknown"
}

export function createOllamaAdapter(options: OllamaAdapterOptions = {}): ModelAdapter {
  const baseUrl = (options.baseUrl ?? "http://127.0.0.1:11434").replace(/\/$/, "")
  const fetchImpl = options.fetchImpl ?? fetch
  return {
    name: "ollama",
    capabilities: { toolCalling: true, vision: true, streaming: false },
    async complete(request) {
      const options = {
        ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
        ...(request.maxTokens === undefined ? {} : { num_predict: request.maxTokens }),
      }
      const response = await fetchImpl(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          stream: false,
          ...(request.tools ? { tools: request.tools } : {}),
          ...(Object.keys(options).length === 0 ? {} : { options }),
        }),
        ...(request.signal === undefined ? {} : { signal: request.signal }),
      })
      if (!response.ok) throw new Error(`Ollama request failed with HTTP ${response.status}`)
      const payload = (await response.json()) as OllamaResponse
      const toolCalls = normalizeToolCalls(payload.message?.tool_calls)
      const usage: { inputTokens?: number; outputTokens?: number; totalTokens?: number } = {
        ...(payload.prompt_eval_count === undefined ? {} : { inputTokens: payload.prompt_eval_count }),
        ...(payload.eval_count === undefined ? {} : { outputTokens: payload.eval_count }),
      }
      const input = usage.inputTokens
      const output = usage.outputTokens
      if (input !== undefined || output !== undefined) usage.totalTokens = (input ?? 0) + (output ?? 0)
      return {
        id: `ollama-${Date.now()}`,
        model: payload.model ?? request.model,
        content: payload.message?.content ?? "",
        toolCalls,
        finishReason: normalizeFinishReason(payload.done_reason, toolCalls.length > 0),
        ...(Object.keys(usage).length === 0 ? {} : { usage }),
        raw: payload,
      }
    },
  }
}
