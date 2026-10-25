export class MemoryStorage {
    flights = new Map();
    async saveFlight(flight) {
        this.flights.set(flight.id, flight);
    }
    async getFlight(id) {
        return this.flights.get(id);
    }
    async listFlights() {
        return Array.from(this.flights.values());
    }
    async updateFlight(flight) {
        this.flights.set(flight.id, flight);
    }
}
