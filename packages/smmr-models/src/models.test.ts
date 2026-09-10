import { describe, expect, test } from "bun:test"
import { createMockAdapter } from "./mock"
import { createOllamaAdapter } from "./ollama"

describe("SMMR model protocol", () => {
  test("mock adapter records requests and returns deterministic responses", async () => {
    const model = createMockAdapter({
      responses: [{ id: "m1", model: "mock", content: "plan", toolCalls: [], finishReason: "stop" }],
    })
    const response = await model.complete({ model: "mock", messages: [{ role: "user", content: "hello" }] })
    expect(response.content).toBe("plan")
    expect(model.requests).toHaveLength(1)
  })

  test("mock adapter can model a stateful protocol", async () => {
    const model = createMockAdapter({
      handler: (_request, callNumber) => ({ id: `m${callNumber}`, model: "mock", content: String(callNumber), toolCalls: [], finishReason: "stop" }),
    })
    expect((await model.complete({ model: "mock", messages: [] })).content).toBe("1")
    expect((await model.complete({ model: "mock", messages: [] })).content).toBe("2")
  })

  test("Ollama adapter normalizes native chat responses and forwards controls", async () => {
    let captured: RequestInit | undefined
    const model = createOllamaAdapter({
      baseUrl: "http://ollama.test/",
      fetchImpl: async (_input, init) => {
        captured = init
        return new Response(JSON.stringify({ model: "qwen3.5:4b", message: { content: "done" }, done_reason: "stop", prompt_eval_count: 4, eval_count: 6 }), { status: 200 })
      },
    })
    const response = await model.complete({ model: "qwen3.5:4b", messages: [{ role: "user", content: "task" }], temperature: 0.2, maxTokens: 80 })
    expect(response).toMatchObject({ model: "qwen3.5:4b", content: "done", finishReason: "stop", usage: { inputTokens: 4, outputTokens: 6, totalTokens: 10 } })
    expect(captured?.method).toBe("POST")
    expect(JSON.parse(String(captured?.body))).toMatchObject({ model: "qwen3.5:4b", stream: false, options: { temperature: 0.2, num_predict: 80 } })
  })

  test("Ollama adapter rejects failed responses", async () => {
    const model = createOllamaAdapter({ fetchImpl: async () => new Response("unavailable", { status: 503 }) })
    await expect(model.complete({ model: "qwen3.5:4b", messages: [] })).rejects.toThrow("HTTP 503")
  })
})
