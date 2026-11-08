import { createModels } from "@earendil-works/pi-ai/models";
import { anthropicProvider } from "@earendil-works/pi-ai/providers/anthropic";
import {
  configure,
  createRegistry,
  defineExtension,
  section,
  type HarnessOptions,
} from "@earendil-works/pi-durable";
import { DeliverScheduledInstruction } from "./schedule.ts";
import { conversationSearchExtension, searchHistoryTool } from "./search.ts";
import { getWeatherTool, scheduleTool } from "./tools.ts";

const models = createModels();
models.setProvider(anthropicProvider());

/** Application-owned, platform-independent agent composition. */
export function createChatHarnessOptions(): HarnessOptions {
  const chatExtension = defineExtension({
    name: "chat",
    tasks: [DeliverScheduledInstruction],
    tools: [getWeatherTool, scheduleTool, searchHistoryTool],
    sections: [
      section(
        "preamble",
        () =>
          "You are a concise assistant. User messages may begin with a display name in brackets; treat it as speaker attribution.",
        { tag: false },
      ),
      section(
        "clock",
        // Minute precision: finer values would append a system-prompt delta on every request.
        () => `Current time: ${new Date().toISOString().slice(0, 16)}Z.`,
        { tag: false },
      ),
    ],
  });
  const registry = createRegistry();
  registry.install(chatExtension);
  registry.install(conversationSearchExtension);
  const defaultAgent = {
    // Reads ANTHROPIC_API_KEY from the Worker environment. Claude Opus 5.5 always thinks, so "off" is not
    // available; "low" maps to Anthropic's low effort level, which suits a concise chat assistant.
    model: { provider: "anthropic", modelId: "claude-opus-5-5" },
    thinkingLevel: "low" as const,
    tools: [getWeatherTool, scheduleTool, searchHistoryTool],
  };

  return {
    models,
    registry,
    settings: { extensions: [chatExtension] },
    conversationCreated: (tx, conversation) =>
      conversation.owner === undefined && conversation.parent === undefined
        ? configure(tx, conversation.id, defaultAgent)
        : undefined,
  };
}
