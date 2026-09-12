import { createInterface } from "node:readline"
import { handlePostToolUse, handlePreToolUse, handleUserPrompt, type CodexHookPayload } from "./runtime.js"

const command = process.argv[2] === "hook" ? process.argv[3] : undefined
const lines: string[] = []
for await (const line of createInterface({ input: process.stdin })) lines.push(line)
const raw = lines.join("\n").trim()
if (raw.length === 0) process.exit(0)
const payload = JSON.parse(raw) as CodexHookPayload
const output = command === "user-prompt-submit"
  ? await handleUserPrompt(payload)
  : command === "pre-tool-use"
    ? await handlePreToolUse(payload)
    : command === "post-tool-use"
      ? await handlePostToolUse(payload)
      : ""
if (output.length > 0) process.stdout.write(`${output}\n`)
