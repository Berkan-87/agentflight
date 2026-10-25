/// <reference types="node" />
import { FileStorage } from "../storage/file.js";

const DEFAULT_PATH = "./agentflight-data/flights.jsonl";

export async function showFlight(
  idPrefix: string,
  filePath: string = DEFAULT_PATH
) {
  const storage = new FileStorage(filePath);
  const flights = await storage.listFlights();

  // Kısa ID (prefix) ile de arama yapılabilsin
  const flight =
    flights.find((f) => f.id === idPrefix) ??
    flights.find((f) => f.id.startsWith(idPrefix));

  if (!flight) {
    console.error(`❌ Flight bulunamadı: ${idPrefix}`);
    process.exit(1);
  }

  console.log(`\n✈️  Flight: ${flight.id}`);
  console.log(`   Agent:    ${flight.agentName}`);
  console.log(`   Durum:    ${flight.status}`);
  console.log(`   Başlangıç: ${new Date(flight.startedAt).toLocaleString("tr-TR")}`);
  if (flight.endedAt) {
    console.log(
      `   Bitiş:    ${new Date(flight.endedAt).toLocaleString("tr-TR")}`
    );
    console.log(`   Süre:     ${flight.endedAt - flight.startedAt}ms`);
  }
  console.log(
    `   Token:    ${flight.totalTokenUsage.promptTokens} prompt + ${flight.totalTokenUsage.completionTokens} completion = ${flight.totalTokenUsage.totalTokens}`
  );
  console.log(`   Maliyet:  $${flight.totalCostUSD.toFixed(6)}`);
  console.log(`\n📊 Adımlar (${flight.steps.length}):\n`);

  for (let i = 0; i < flight.steps.length; i++) {
    const s = flight.steps[i];
    const icon =
      s.type === "llm_call"
        ? "🤖"
        : s.type === "tool_call"
        ? "🔧"
        : s.type === "error"
        ? "❌"
        : "•";
    console.log(`${i + 1}. ${icon} [${s.type}] ${s.name}`);
    console.log(`   Süre: ${s.durationMs ?? "?"}ms`);
    if (s.tokenUsage) {
      console.log(
        `   Token: ${s.tokenUsage.promptTokens}+${s.tokenUsage.completionTokens}=${s.tokenUsage.totalTokens} ($${(s.tokenUsage.estimatedCostUSD ?? 0).toFixed(6)})`
      );
    }
    if (s.error) console.log(`   HATA: ${s.error}`);
    if (s.output) {
      const out = s.output as any;
      if (out.streaming && typeof out.content === "string") {
        const content = out.content;
        console.log(
          `   [stream] ${content.slice(0, 200)}${content.length > 200 ? "..." : ""}`
        );
      } else if (typeof out.content === "string") {
        const content = out.content;
        console.log(
          `   Çıktı: ${content.slice(0, 200)}${content.length > 200 ? "..." : ""}`
        );
      } else {
        const json = JSON.stringify(out).slice(0, 120);
        console.log(`   Çıktı: ${json}${json.length >= 120 ? "..." : ""}`);
      }
    }
    console.log("");
  }
}