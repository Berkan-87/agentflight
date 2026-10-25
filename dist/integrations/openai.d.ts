import OpenAI from "openai";
import { FlightRecorder } from "../recorder.js";
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
export declare function createInstrumentedOpenAI(config: InstrumentedOpenAIConfig): OpenAI;
