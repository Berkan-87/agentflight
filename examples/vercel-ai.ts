/// <reference types="node" />
import { createOpenAI } from "@ai-sdk/openai";
import { FlightRecorder, createInstrumentedVercelAI } from "../src/index.js";

async function main() {
  const recorder = new FlightRecorder({
    agentName: "vercel-ai-demo-agent",
    storage: "file",
    filePath: "./agentflight-data/flights.jsonl",
  });

  const ollama = createOpenAI({
    baseURL: "http://localhost:11434/v1",
    apiKey: "ollama",
  });

  const { generateText, streamText } = createInstrumentedVercelAI({ recorder });

  // 1) generateText
  console.log("--- generateText ---");
  const gen = await generateText({
    model: ollama("llama3.2"),
    prompt: "AgentFlight nedir? Tek cümleyle açıkla.",
  });
  console.log("Yanıt:", gen.text);
  console.log("Token:", gen.usage);

  // 2) streamText
  console.log("\n--- streamText ---");
  const stream = await streamText({
    model: ollama("llama3.2"),
    prompt: "Bir cümlede yapay zeka ajanlarını açıkla.",
  });
  for await (const chunk of stream.textStream) {
    process.stdout.write(chunk);
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