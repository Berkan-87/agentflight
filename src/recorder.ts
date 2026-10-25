import { randomUUID } from "node:crypto";
import {
  Flight,
  FlightStep,
  RecorderConfig,
  TokenUsage,
  ModelPricing,
  FlightStorage,
} from "./types.js";
import { MemoryStorage } from "./storage/memory.js";
import { FileStorage } from "./storage/file.js";

const DEFAULT_PRICING: ModelPricing = {
  "gpt-4o": { inputPer1KTokens: 0.005, outputPer1KTokens: 0.015 },
  "gpt-4o-mini": { inputPer1KTokens: 0.00015, outputPer1KTokens: 0.0006 },
  "claude-3-5-sonnet": { inputPer1KTokens: 0.003, outputPer1KTokens: 0.015 },
  "claude-3-haiku": { inputPer1KTokens: 0.00025, outputPer1KTokens: 0.00125 },
};

export class FlightRecorder {
  private flight: Flight;
  private storage: FlightStorage;
  private pricing: ModelPricing;

  constructor(config: RecorderConfig) {
    this.pricing = { ...DEFAULT_PRICING, ...(config.pricing ?? {}) };
    this.storage =
      config.storage === "file"
        ? new FileStorage(config.filePath ?? "./agentflight-data/flights.jsonl")
        : new MemoryStorage();

    this.flight = {
      id: randomUUID(),
      agentName: config.agentName,
      sessionId: config.sessionId,
      startedAt: Date.now(),
      status: "running",
      steps: [],
      totalTokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      totalCostUSD: 0,
      metadata: config.metadata,
    };
    void this.storage.saveFlight(this.flight);
  }

  getFlightId(): string {
    return this.flight.id;
  }

  async startStep(
    type: FlightStep["type"],
    name: string,
    input: unknown,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    const step: FlightStep = {
      id: randomUUID(),
      type,
      name,
      input,
      startedAt: Date.now(),
      metadata,
    };
    this.flight.steps.push(step);
    await this.storage.updateFlight(this.flight);
    return step.id;
  }

  async endStep(
    stepId: string,
    output?: unknown,
    tokenUsage?: TokenUsage,
    model?: string,
    error?: string
  ): Promise<void> {
    const step = this.flight.steps.find((s) => s.id === stepId);
    if (!step) return;

    step.endedAt = Date.now();
    step.durationMs = step.endedAt - step.startedAt;
    step.output = output;
    step.error = error;
    if (tokenUsage) {
      step.tokenUsage = tokenUsage;
      this.flight.totalTokenUsage.promptTokens += tokenUsage.promptTokens;
      this.flight.totalTokenUsage.completionTokens += tokenUsage.completionTokens;
      this.flight.totalTokenUsage.totalTokens += tokenUsage.totalTokens;

      if (model && this.pricing[model]) {
        const p = this.pricing[model];
        const cost =
          (tokenUsage.promptTokens / 1000) * p.inputPer1KTokens +
          (tokenUsage.completionTokens / 1000) * p.outputPer1KTokens;
        step.tokenUsage.estimatedCostUSD = cost;
        this.flight.totalCostUSD += cost;
      }
    }
    if (error) this.flight.status = "error";
    await this.storage.updateFlight(this.flight);
  }

  async finish(status: "success" | "error" = "success"): Promise<Flight> {
    this.flight.endedAt = Date.now();
    if (status === "error") this.flight.status = "error";
    else if (this.flight.status !== "error") this.flight.status = "success";
    await this.storage.updateFlight(this.flight);
    return this.flight;
  }

  async getFlight(): Promise<Flight> {
    return this.flight;
  }

  async getStorage(): Promise<FlightStorage> {
    return this.storage;
  }
}