/// <reference types="node" />
import { FlightRecorder, createInstrumentedOpenAI } from "../src/index.js";

async function main() {
  const recorder = new FlightRecorder({
    agentName: "ollama-demo-agent",
    storage: "file",
    filePath: "./agentflight-data/flights.jsonl",
  });

  const client = createInstrumentedOpenAI({
    recorder,
    apiKey: "ollama",
    baseURL: "http://localhost:11434/v1",
  });

  const response = await client.chat.completions.create({
    model: "llama3.2",
    messages: [
      { role: "system", content: "Sen kısa ve öz cevap veren bir asistansın." },
      { role: "user", content: "AgentFlight nedir? Tek cümleyle açıkla." },
    ],
  });

  console.log("Yanıt:", response.choices[0]?.message?.content);

  const flight = await recorder.finish();
  console.log("\n=== Flight Özeti ===");
  console.log("Flight ID:", flight.id);
  console.log("Adım sayısı:", flight.steps.length);
  console.log("Toplam token:", flight.totalTokenUsage.totalTokens);
  console.log("Tahmini maliyet: $", flight.totalCostUSD.toFixed(6));

  for (const step of flight.steps) {
    console.log(`- [${step.type}] ${step.name} (${step.durationMs}ms)`);
    if (step.tokenUsage) {
      console.log(
        `  Token: ${step.tokenUsage.promptTokens}+${step.tokenUsage.completionTokens}=${step.tokenUsage.totalTokens}`
      );
    }
  }
}

main().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});