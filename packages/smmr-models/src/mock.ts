import type { ModelAdapter, ModelCapabilities, ModelRequest, ModelResponse } from "./types"

export interface MockModelOptions {
  readonly responses?: readonly ModelResponse[]
  readonly handler?: (request: ModelRequest, callNumber: number) => ModelResponse | Promise<ModelResponse>
  readonly capabilities?: Partial<ModelCapabilities>
}

export function createMockAdapter(options: MockModelOptions = {}): ModelAdapter & { readonly requests: readonly ModelRequest[] } {
  const responses = [...(options.responses ?? [])]
  const requests: ModelRequest[] = []
  let callNumber = 0
  const adapter: ModelAdapter & { readonly requests: readonly ModelRequest[] } = {
    name: "mock",
    capabilities: { toolCalling: true, vision: false, streaming: false, ...options.capabilities },
    requests,
    async complete(request) {
      requests.push(request)
      callNumber += 1
      if (options.handler) return options.handler(request, callNumber)
      const response = responses.shift()
      if (!response) throw new Error(`Mock model has no response for call ${callNumber}`)
      return response
    },
  }
  return adapter
}
