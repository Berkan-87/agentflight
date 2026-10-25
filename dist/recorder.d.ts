import { Flight, FlightStep, RecorderConfig, TokenUsage, FlightStorage } from "./types.js";
export declare class FlightRecorder {
    private flight;
    private storage;
    private pricing;
    constructor(config: RecorderConfig);
    getFlightId(): string;
    startStep(type: FlightStep["type"], name: string, input: unknown, metadata?: Record<string, unknown>): Promise<string>;
    endStep(stepId: string, output?: unknown, tokenUsage?: TokenUsage, model?: string, error?: string): Promise<void>;
    finish(status?: "success" | "error"): Promise<Flight>;
    getFlight(): Promise<Flight>;
    getStorage(): Promise<FlightStorage>;
}
