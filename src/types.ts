export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUSD?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: unknown;
  result?: unknown;
  error?: string;
  startedAt: number;
  endedAt?: number;
}

export interface FlightStep {
  id: string;
  type: "llm_call" | "tool_call" | "agent_step" | "error";
  name: string;
  input: unknown;
  output?: unknown;
  error?: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  tokenUsage?: TokenUsage;
  metadata?: Record<string, unknown>;
}

export interface Flight {
  id: string;
  agentName: string;
  sessionId?: string;
  startedAt: number;
  endedAt?: number;
  status: "running" | "success" | "error";
  steps: FlightStep[];
  totalTokenUsage: TokenUsage;
  totalCostUSD: number;
  metadata?: Record<string, unknown>;
}

export interface RecorderConfig {
  agentName: string;
  sessionId?: string;
  storage?: "memory" | "file";
  filePath?: string;
  pricing?: ModelPricing;
  metadata?: Record<string, unknown>;
}

export interface ModelPricing {
  [modelName: string]: {
    inputPer1KTokens: number;
    outputPer1KTokens: number;
  };
}

export interface FlightStorage {
  saveFlight(flight: Flight): Promise<void>;
  getFlight(id: string): Promise<Flight | undefined>;
  listFlights(): Promise<Flight[]>;
  updateFlight(flight: Flight): Promise<void>;
}