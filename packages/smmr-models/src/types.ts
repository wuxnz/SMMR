export type ModelRole = "system" | "user" | "assistant" | "tool"

export interface ModelMessage {
  readonly role: ModelRole
  readonly content: string
  readonly name?: string
  readonly toolCallId?: string
}

export interface ModelToolCall {
  readonly id: string
  readonly name: string
  readonly arguments: Record<string, unknown>
}

export interface ModelRequest {
  readonly model: string
  readonly messages: readonly ModelMessage[]
  readonly tools?: readonly Record<string, unknown>[]
  readonly temperature?: number
  readonly maxTokens?: number
  readonly signal?: AbortSignal
}

export interface ModelUsage {
  readonly inputTokens?: number
  readonly outputTokens?: number
  readonly totalTokens?: number
}

export interface ModelResponse {
  readonly id: string
  readonly model: string
  readonly content: string
  readonly toolCalls: readonly ModelToolCall[]
  readonly finishReason: "stop" | "length" | "tool_calls" | "unknown"
  readonly usage?: ModelUsage
  readonly raw?: unknown
}

export interface ModelCapabilities {
  readonly toolCalling: boolean
  readonly vision: boolean
  readonly streaming: boolean
  readonly contextWindow?: number
}

export interface ModelAdapter {
  readonly name: string
  readonly capabilities: ModelCapabilities
  complete(request: ModelRequest): Promise<ModelResponse>
}
