import { promises as fs } from "node:fs";
import path from "node:path";
import { Flight, FlightStorage } from "../types.js";

export class FileStorage implements FlightStorage {
  constructor(private filePath: string) {}

  private async readAll(): Promise<Flight[]> {
    try {
      const content = await fs.readFile(this.filePath, "utf-8");
      return content
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as Flight);
    } catch (err: any) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }

  private async writeAll(flights: Flight[]): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const content = flights.map((f) => JSON.stringify(f)).join("\n") + "\n";
    await fs.writeFile(this.filePath, content, "utf-8");
  }

  async saveFlight(flight: Flight): Promise<void> {
    const all = await this.readAll();
    const existingIdx = all.findIndex((f) => f.id === flight.id);
    if (existingIdx >= 0) all[existingIdx] = flight;
    else all.push(flight);
    await this.writeAll(all);
  }

  async getFlight(id: string): Promise<Flight | undefined> {
    const all = await this.readAll();
    return all.find((f) => f.id === id);
  }

  async listFlights(): Promise<Flight[]> {
    return this.readAll();
  }

  async updateFlight(flight: Flight): Promise<void> {
    await this.saveFlight(flight);
  }
}