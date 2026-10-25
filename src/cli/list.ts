import { FileStorage } from "../storage/file.js";

const DEFAULT_PATH = "./agentflight-data/flights.jsonl";

export async function listFlights(filePath: string = DEFAULT_PATH) {
  const storage = new FileStorage(filePath);
  const flights = await storage.listFlights();

  if (flights.length === 0) {
    console.log("Henüz kayıtlı flight yok.");
    return;
  }

  console.log(`\n📋 Toplam ${flights.length} flight\n`);
  console.log(
    "ID".padEnd(10) +
      "AGENT".padEnd(25) +
      "DURUM".padEnd(10) +
      "ADIM".padEnd(6) +
      "TOKEN".padEnd(8) +
      "MALİYET".padEnd(12) +
      "TARİH"
  );
  console.log("─".repeat(100));

  for (const f of flights) {
    const shortId = f.id.slice(0, 8);
    const agent = f.agentName.slice(0, 23).padEnd(25);
    const status =
      f.status === "success" ? "✅ ok" : f.status === "error" ? "❌ hata" : "⏳ çalışıyor";
    const steps = String(f.steps.length).padEnd(6);
    const tokens = String(f.totalTokenUsage.totalTokens).padEnd(8);
    const cost = `$${f.totalCostUSD.toFixed(6)}`.padEnd(12);
    const date = new Date(f.startedAt).toLocaleString("tr-TR");
    console.log(
      shortId.padEnd(10) + agent + status.padEnd(10) + steps + tokens + cost + date
    );
  }
  console.log("");
}


