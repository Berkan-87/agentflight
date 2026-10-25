/// <reference types="node" />
import { FlightRecorder, createInstrumentedOpenAI } from "../src/index.js";

async function main() {
  const recorder = new FlightRecorder({
    agentName: "ollama-stream-agent",
    storage: "file",
    filePath: "./agentflight-data/flights.jsonl",
  });

  const client = createInstrumentedOpenAI({
    recorder,
    apiKey: "ollama",
    baseURL: "http://localhost:11434/v1",
  });

  console.log("Stream başlıyor...\n");

  const stream = await client.chat.completions.create({
    model: "llama3.2",
    messages: [
      { role: "user", content: "Bir cümlede AgentFlight'ı açıkla." },
    ],
    stream: true,
  });

  // Chunk'ları canlı yazdır
  for await (const chunk of stream as AsyncIterable<any>) {
    const delta = chunk?.choices?.[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }
  console.log("\n");

  const flight = await recorder.finish();
  console.log("=== Flight Özeti ===");
  console.log("Adım sayısı:", flight.steps.length);
  console.log("Toplam token:", flight.totalTokenUsage.totalTokens);
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