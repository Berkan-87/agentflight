import OpenAI from "openai";
import { FlightRecorder } from "../recorder.js";
import { TokenUsage } from "../types.js";

export interface InstrumentedOpenAIConfig {
  apiKey?: string;
  baseURL?: string;
  recorder: FlightRecorder;
  defaultMetadata?: Record<string, unknown>;
}

/**
 * OpenAI istemcisini FlightRecorder ile sarmalar.
 * Streaming çağrılarında chunk'ları toplar ve stream bittiğinde
 * token kullanımını ve birleşik içeriği kaydeder.
 */
export function createInstrumentedOpenAI(config: InstrumentedOpenAIConfig) {
  const openai = new OpenAI({
    apiKey: config.apiKey ?? process.env.OPENAI_API_KEY,
    baseURL: config.baseURL,
  });

  const originalCreate = openai.chat.completions.create.bind(
    openai.chat.completions
  );

  // @ts-expect-error - overload imzalarını dinamik olarak sarıyoruz
  openai.chat.completions.create = async (params: any, options?: any) => {
    const model = params?.model ?? "unknown";
    const isStream = params?.stream === true;

    // Streaming'de token kullanımını almak için OpenAI'ye include_usage gönder
    const finalParams = isStream
      ? { ...params, stream_options: { include_usage: true, ...(params.stream_options ?? {}) } }
      : params;

    const stepId = await config.recorder.startStep(
      "llm_call",
      `openai.chat.completions:${model}`,
      {
        model,
        messages: params?.messages,
        temperature: params?.temperature,
        max_tokens: params?.max_tokens,
        stream: isStream,
      },
      { provider: "openai", ...(config.defaultMetadata ?? {}) }
    );

    try {
      const response = await originalCreate(finalParams, options);

      // ─── Streaming yolu ────────────────────────────────────────
      if (isStream) {
        const collected: string[] = [];
        let usage: any = undefined;
        let finishReason: string | undefined;

        // AsyncIterable'ı sar: her chunk'ı hem kullanıcıya ilet hem topla
        async function* wrapped() {
          try {
            for await (const chunk of response as unknown as AsyncIterable<any>) {
              const delta = chunk?.choices?.[0]?.delta?.content;
              if (typeof delta === "string") collected.push(delta);
              if (chunk?.choices?.[0]?.finish_reason) {
                finishReason = chunk.choices[0].finish_reason;
              }
              if (chunk?.usage) usage = chunk.usage;
              yield chunk;
            }
            // Stream bitti → adımı tamamla
            const tokenUsage: TokenUsage | undefined = usage
              ? {
                  promptTokens: usage.prompt_tokens ?? 0,
                  completionTokens: usage.completion_tokens ?? 0,
                  totalTokens: usage.total_tokens ?? 0,
                }
              : undefined;

            await config.recorder.endStep(
              stepId,
              {
                content: collected.join(""),
                finishReason,
                model,
                streaming: true,
              },
              tokenUsage,
              model
            );
          } catch (err: any) {
            await config.recorder.endStep(
              stepId,
              { partialContent: collected.join(""), streaming: true },
              undefined,
              model,
              err?.message ?? String(err)
            );
            throw err;
          }
        }

        return wrapped();
      }

      // ─── Normal (non-stream) yol ────────────────────────────────
      const usage = (response as any).usage;
      const tokenUsage: TokenUsage | undefined = usage
        ? {
            promptTokens: usage.prompt_tokens ?? 0,
            completionTokens: usage.completion_tokens ?? 0,
            totalTokens: usage.total_tokens ?? 0,
          }
        : undefined;

      const content = (response as any).choices?.[0]?.message?.content;

      await config.recorder.endStep(
        stepId,
        {
          content,
          finishReason: (response as any).choices?.[0]?.finish_reason,
          model: (response as any).model,
        },
        tokenUsage,
        model
      );

      return response;
    } catch (err: any) {
      await config.recorder.endStep(
        stepId,
        undefined,
        undefined,
        model,
        err?.message ?? String(err)
      );
      throw err;
    }
  };

  return openai;
}