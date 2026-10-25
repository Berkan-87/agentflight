import { FlightRecorder } from "../recorder.js";
export interface InstrumentedVercelAIConfig {
    recorder: FlightRecorder;
    defaultMetadata?: Record<string, unknown>;
}
export declare function createInstrumentedVercelAI(config: InstrumentedVercelAIConfig): {
    generateText: (params: any) => Promise<import("ai").GenerateTextResult<import("ai").ToolSet, import("@ai-sdk/provider-utils").Context, import("ai").OutputInterface<string, string, any>>>;
    streamText: (params: any) => Promise<{
        textStream: AsyncGenerator<string, void, unknown>;
        content: PromiseLike<import("ai").ContentPart<import("ai").ToolSet>[]>;
        text: PromiseLike<string>;
        reasoning: PromiseLike<Array<import("ai").ReasoningOutput | import("ai").ReasoningFileOutput>>;
        reasoningText: PromiseLike<string | undefined>;
        files: PromiseLike<import("ai").GeneratedFile[]>;
        sources: PromiseLike<import("@ai-sdk/provider").LanguageModelV4Source[]>;
        toolCalls: PromiseLike<import("ai").TypedToolCall<import("ai").ToolSet>[]>;
        staticToolCalls: PromiseLike<({
            type: "tool-call";
            toolCallId: string;
            providerExecuted?: boolean;
            providerMetadata?: import("ai").ProviderMetadata;
            toolMetadata?: import("@ai-sdk/provider").JSONObject;
        } & {
            toolName: string;
            input: any;
            dynamic?: false | undefined;
            invalid?: false | undefined;
            error?: never;
            title?: string;
        })[]>;
        dynamicToolCalls: PromiseLike<import("ai").DynamicToolCall[]>;
        staticToolResults: PromiseLike<{
            type: "tool-result";
            toolCallId: string;
            toolName: string;
            input: any;
            output: any;
            providerExecuted?: boolean;
            providerMetadata?: import("ai").ProviderMetadata;
            toolMetadata?: import("@ai-sdk/provider").JSONObject;
            dynamic?: false | undefined;
            preliminary?: boolean;
            title?: string;
        }[]>;
        dynamicToolResults: PromiseLike<import("ai").DynamicToolResult[]>;
        toolResults: PromiseLike<import("ai").TypedToolResult<import("ai").ToolSet>[]>;
        finishReason: PromiseLike<import("ai").FinishReason>;
        rawFinishReason: PromiseLike<string | undefined>;
        usage: PromiseLike<import("ai").LanguageModelUsage>;
        totalUsage: PromiseLike<import("ai").LanguageModelUsage>;
        warnings: PromiseLike<import("ai").CallWarning[] | undefined>;
        steps: PromiseLike<import("ai").StepResult<import("ai").ToolSet, import("@ai-sdk/provider-utils").Context>[]>;
        finalStep: PromiseLike<import("ai").StepResult<import("ai").ToolSet, import("@ai-sdk/provider-utils").Context>>;
        request: PromiseLike<import("ai").LanguageModelRequestMetadata>;
        response: PromiseLike<import("ai").LanguageModelResponseMetadata>;
        responseMessages: PromiseLike<Array<import("ai").AssistantModelMessage | import("ai").ToolModelMessage>>;
        providerMetadata: PromiseLike<import("ai").ProviderMetadata | undefined>;
        stream: import("ai").AsyncIterableStream<import("ai").TextStreamPart<import("ai").ToolSet>>;
        fullStream: import("ai").AsyncIterableStream<import("ai").TextStreamPart<import("ai").ToolSet>>;
        experimental_partialOutputStream: import("ai").AsyncIterableStream<string>;
        partialOutputStream: import("ai").AsyncIterableStream<string>;
        elementStream: import("ai").AsyncIterableStream<never>;
        output: PromiseLike<string>;
        consumeStream(options?: {
            onError?: import("ai").ErrorHandler;
        }): PromiseLike<void>;
        toUIMessageStream<UI_MESSAGE extends import("ai").UIMessage>(options?: import("ai").UIMessageStreamOptions<UI_MESSAGE>): import("ai").AsyncIterableStream<import("ai").InferUIMessageChunk<UI_MESSAGE>>;
        pipeUIMessageStreamToResponse<UI_MESSAGE extends import("ai").UIMessage>(response: import("http").ServerResponse, options?: (ResponseInit & {
            keepAliveMs?: number;
            consumeSseStream?: (options: {
                stream: ReadableStream<string>;
            }) => PromiseLike<void> | void;
        }) & import("ai").UIMessageStreamOptions<UI_MESSAGE>): Promise<void>;
        pipeTextStreamToResponse(response: import("http").ServerResponse, init?: ResponseInit): Promise<void>;
        toUIMessageStreamResponse<UI_MESSAGE extends import("ai").UIMessage>(options?: (ResponseInit & {
            keepAliveMs?: number;
            consumeSseStream?: (options: {
                stream: ReadableStream<string>;
            }) => PromiseLike<void> | void;
        }) & import("ai").UIMessageStreamOptions<UI_MESSAGE>): Response;
        toTextStreamResponse(init?: ResponseInit): Response;
    }>;
};
