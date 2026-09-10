import type { PluginContext, PluginInterface, ToolsRecord } from "./plugin/types"
import type { OhMyOpenCodeConfig } from "./config"
import { SmmrRuntimeSession } from "@smmr/core"

import { applyAgentVariant } from "./shared/agent-variant"
import { createChatParamsHandler } from "./plugin/chat-params"
import { createChatHeadersHandler } from "./plugin/chat-headers"
import { createChatMessageHandler } from "./plugin/chat-message"
import { createCommandExecuteBeforeHandler } from "./plugin/command-execute-before"
import { createMessagesTransformHandler } from "./plugin/messages-transform"
import { createSystemTransformHandler } from "./plugin/system-transform"
import { getUltraworkMessage } from "./hooks/keyword-detector/ultrawork"
import { createEventHandler } from "./plugin/event"
import { createToolDefinitionHandler } from "./plugin/tool-definition"
import { createToolExecuteAfterHandler } from "./plugin/tool-execute-after"
import { createToolExecuteBeforeHandler } from "./plugin/tool-execute-before"
import { log } from "./shared/logger"
import { createSmmrChatSession } from "./plugin/smmr-chat-session"
import { advanceSmmrSessionAfterTool, removeDeletedSmmrSession } from "./plugin/smmr-session-lifecycle"
import { getSmmrSystemPolicy } from "./plugin/smmr-system-policy"
import { applySmmrModelOverride } from "./plugin/smmr-model-routing"

import type { CreatedHooks } from "./create-hooks"
import type { Managers } from "./create-managers"

export function createPluginInterface(args: {
  ctx: PluginContext
  pluginConfig: OhMyOpenCodeConfig
  firstMessageVariantGate: {
    shouldOverride: (sessionID: string) => boolean
    markApplied: (sessionID: string) => void
    markSessionCreated: (sessionInfo: { id?: string; title?: string; parentID?: string } | undefined) => void
    clear: (sessionID: string) => void
  }
  managers: Managers
  hooks: CreatedHooks
  tools: ToolsRecord
}): PluginInterface {
  const { ctx, pluginConfig, firstMessageVariantGate, managers, hooks, tools } =
    args

  const smmrSessions = new Map<string, SmmrRuntimeSession>()
  const chatMessageHandler = createChatMessageHandler({
    ctx,
    pluginConfig,
    firstMessageVariantGate,
    hooks,
  })

  return {
    tool: tools,

    "chat.params": async (input: unknown, output: unknown) => {
      const chatParamsInput = input as {
        agent?: string | { name?: string }
        model?: { providerID?: unknown; modelID?: unknown; id?: unknown }
        message?: { variant?: string }
      }
      const agentName =
        typeof chatParamsInput.agent === "string"
          ? chatParamsInput.agent
          : chatParamsInput.agent?.name
      const providerID = chatParamsInput.model?.providerID
      const rawModelID = chatParamsInput.model?.modelID ?? chatParamsInput.model?.id
      const modelID = typeof rawModelID === "string" ? rawModelID : undefined
      if (chatParamsInput.message && typeof providerID === "string" && modelID !== undefined) {
        applyAgentVariant(pluginConfig, agentName, chatParamsInput.message, { providerID, modelID })
      }
      const handler = createChatParamsHandler({
        client: ctx.client,
      })
      await handler(input, output)
    },

    "chat.headers": createChatHeadersHandler({ ctx }),

    "command.execute.before": createCommandExecuteBeforeHandler({
      directory: ctx.directory,
      hooks,
    }),

    "chat.message": async (input, output) => {
      if (pluginConfig.smmr?.enabled === true && !smmrSessions.has(input.sessionID)) {
        const session = createSmmrChatSession(pluginConfig, input.sessionID, output.parts, smmrSessions)
        if (session !== undefined) {
          log("[smmr] runtime session created", {
            sessionID: input.sessionID,
            state: session.snapshot()?.state,
            nextSkill: session.nextSkill()?.name,
            model: session.model,
            allowNetwork: session.allowNetwork,
            allowMemoryWrites: session.allowMemoryWrites,
            allowResearch: session.allowResearch,
          })
        }
      }
      await chatMessageHandler(input, output)
      // Apply last so legacy handlers cannot silently replace an explicit
      // SMMR model selection.
      applySmmrModelOverride(input.sessionID, output.message, smmrSessions)
    },

    "experimental.chat.messages.transform": createMessagesTransformHandler({
      hooks,
    }),

    "experimental.chat.system.transform": createSystemTransformHandler(
      pluginConfig.default_mode,
      getUltraworkMessage,
      hooks.keywordDetector,
      (sessionID) => getSmmrSystemPolicy(sessionID, smmrSessions),
    ),

    config: managers.configHandler,

    event: async (input) => {
      await createEventHandler({
      ctx,
      pluginConfig,
      firstMessageVariantGate,
      managers,
      hooks,
      })(input)
      removeDeletedSmmrSession(input, smmrSessions)
    },

    "tool.definition": createToolDefinitionHandler({
      hooks,
    }),

    "tool.execute.before": createToolExecuteBeforeHandler({
      ctx,
      hooks,
      backgroundManager: managers.backgroundManager,
    }),

    "tool.execute.after": async (input, output) => {
      await createToolExecuteAfterHandler({ ctx, hooks })(input, output)
      try {
        await advanceSmmrSessionAfterTool(input, output, smmrSessions)
      } catch (error) {
        log("[smmr] tool completion did not advance runtime session", {
          sessionID: input.sessionID,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    },
  }
}
