/// <reference types="node" />
import { FlightRecorder } from "../recorder.js";
import { TokenUsage } from "../types.js";

export interface InstrumentedVercelAIConfig {
  recorder: FlightRecorder;
  defaultMetadata?: Record<string, unknown>;
}

export function createInstrumentedVercelAI(config: InstrumentedVercelAIConfig) {
  async function loadAI() {
    try {
      return await import("ai");
    } catch {
      throw new Error(
        "Vercel AI SDK entegrasyonu için `ai` paketini yükleyin: npm install ai"
      );
    }
  }

  async function generateText(params: any) {
    const ai = await loadAI();
    const modelId = extractModelId(params?.model);
    const stepId = await config.recorder.startStep(
      "llm_call",
      `vercel-ai.generateText:${modelId}`,
      {
        model: modelId,
        prompt: params?.prompt,
        messages: params?.messages,
        temperature: params?.temperature,
        maxTokens: params?.maxTokens,
      },
      { provider: "vercel-ai", ...(config.defaultMetadata ?? {}) }
    );

    try {
      const result = await ai.generateText(params);
      const tokenUsage = extractUsage(result);
      await config.recorder.endStep(
        stepId,
        {
          text: result.text,
          finishReason: result.finishReason,
          model: modelId,
        },
        tokenUsage,
        modelId
      );
      return result;
    } catch (err: any) {
      await config.recorder.endStep(
        stepId,
        undefined,
        undefined,
        modelId,
        err?.message ?? String(err)
      );
      throw err;
    }
  }

  async function streamText(params: any) {
    const ai = await loadAI();
    const modelId = extractModelId(params?.model);
    const stepId = await config.recorder.startStep(
      "llm_call",
      `vercel-ai.streamText:${modelId}`,
      {
        model: modelId,
        prompt: params?.prompt,
        messages: params?.messages,
        temperature: params?.temperature,
        maxTokens: params?.maxTokens,
        streaming: true,
      },
      { provider: "vercel-ai", ...(config.defaultMetadata ?? {}) }
    );

    try {
      const result = await ai.streamText(params);
      const originalTextStream = result.textStream;
      const collected: string[] = [];

      async function* wrappedTextStream() {
        try {
          for await (const chunk of originalTextStream) {
            if (typeof chunk === "string") collected.push(chunk);
            yield chunk;
          }
          const usage = await result.usage;
          const tokenUsage = usage
            ? {
                promptTokens: (usage as any).inputTokens ?? 0,
                completionTokens: (usage as any).outputTokens ?? 0,
                totalTokens: (usage as any).totalTokens ?? 0,
              }
            : undefined;

          await config.recorder.endStep(
            stepId,
            {
              content: collected.join(""),
              streaming: true,
              model: modelId,
            },
            tokenUsage,
            modelId
          );
        } catch (err: any) {
          await config.recorder.endStep(
            stepId,
            { partialContent: collected.join(""), streaming: true },
            undefined,
            modelId,
            err?.message ?? String(err)
          );
          throw err;
        }
      }

      return {
        ...result,
        textStream: wrappedTextStream(),
      };
    } catch (err: any) {
      await config.recorder.endStep(
        stepId,
        undefined,
        undefined,
        modelId,
        err?.message ?? String(err)
      );
      throw err;
    }
  }

  return { generateText, streamText };
}

function extractModelId(model: any): string {
  if (!model) return "unknown";
  if (typeof model === "string") return model;
  if (typeof model.modelId === "string") return model.modelId;
  if (typeof model.id === "string") return model.id;
  return "unknown";
}

function extractUsage(result: any): TokenUsage | undefined {
  const usage = result?.usage;
  if (!usage) return undefined;
  return {
    promptTokens: usage.inputTokens ?? 0,
    completionTokens: usage.outputTokens ?? 0,
    totalTokens: usage.totalTokens ?? 0,
  };
}
