import { promises as fs } from "node:fs";
import path from "node:path";
export class FileStorage {
    filePath;
    constructor(filePath) {
        this.filePath = filePath;
    }
    async readAll() {
        try {
            const content = await fs.readFile(this.filePath, "utf-8");
            return content
                .split("\n")
                .filter(Boolean)
                .map((line) => JSON.parse(line));
        }
        catch (err) {
            if (err.code === "ENOENT")
                return [];
            throw err;
        }
    }
    async writeAll(flights) {
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        const content = flights.map((f) => JSON.stringify(f)).join("\n") + "\n";
        await fs.writeFile(this.filePath, content, "utf-8");
    }
    async saveFlight(flight) {
        const all = await this.readAll();
        const existingIdx = all.findIndex((f) => f.id === flight.id);
        if (existingIdx >= 0)
            all[existingIdx] = flight;
        else
            all.push(flight);
        await this.writeAll(all);
    }
    async getFlight(id) {
        const all = await this.readAll();
        return all.find((f) => f.id === id);
    }
    async listFlights() {
        return this.readAll();
    }
    async updateFlight(flight) {
        await this.saveFlight(flight);
    }
}
