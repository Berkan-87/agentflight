#!/usr/bin/env node
/// <reference types="node" />
import { listFlights } from "./list.js";
import { showFlight } from "./show.js";
const args = process.argv.slice(2);
const command = args[0];
const filePath = process.env.AGENTFLIGHT_FILE;
async function main() {
    switch (command) {
        case "list":
        case "ls":
            await listFlights(filePath);
            break;
        case "show":
            if (!args[1]) {
                console.error("Kullanım: agentflight show <flight-id>");
                process.exit(1);
            }
            await showFlight(args[1], filePath);
            break;
        case "--help":
        case "-h":
        case undefined:
            console.log(`
AgentFlight CLI

Kullanım:
  agentflight list              Tüm flight'ları listeler
  agentflight show <id>         Belirli bir flight'ın detaylarını gösterir

Ortam değişkenleri:
  AGENTFLIGHT_FILE              JSONL dosya yolu (varsayılan: ./agentflight-data/flights.jsonl)
      `);
            break;
        default:
            console.error(`Bilinmeyen komut: ${command}`);
            process.exit(1);
    }
}
main().catch((err) => {
    console.error("Hata:", err);
    process.exit(1);
});
