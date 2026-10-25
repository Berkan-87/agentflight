import { FlightRecorder } from "../src/index.js";

async function main() {
  const recorder = new FlightRecorder({
    agentName: "my-first-agent",
    storage: "file",
    filePath: "./agentflight-data/flights.jsonl",
  });

  // 1. adım: LLM çağrısı simülasyonu
  const stepId = await recorder.startStep(
    "llm_call",
    "openai.chat.completions",
    { model: "gpt-4o", prompt: "Merhaba, kendini tanıt." },
    { userId: "user_123" }
  );

  await new Promise((r) => setTimeout(r, 800)); // API çağrısı simülasyonu

  await recorder.endStep(
    stepId,
    "Merhaba! Ben bir AI asistanıyım...",
    { promptTokens: 20, completionTokens: 45, totalTokens: 65 },
    "gpt-4o"
  );

  // 2. adım: Araç çağrısı simülasyonu
  const toolStepId = await recorder.startStep(
    "tool_call",
    "web_search",
    { query: "2026 AI trends" }
  );
  await new Promise((r) => setTimeout(r, 300));
  await recorder.endStep(toolStepId, { results: ["..."] });

  const flight = await recorder.finish();

  console.log("Flight ID:", flight.id);
  console.log("Toplam Token:", flight.totalTokenUsage.totalTokens);
  console.log("Tahmini Maliyet: $", flight.totalCostUSD.toFixed(6));
  console.log("Adım sayısı:", flight.steps.length);
}

main().catch(console.error);