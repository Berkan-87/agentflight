import { Flight, FlightStorage } from "../types.js";

export class MemoryStorage implements FlightStorage {
  private flights: Map<string, Flight> = new Map();

  async saveFlight(flight: Flight): Promise<void> {
    this.flights.set(flight.id, flight);
  }

  async getFlight(id: string): Promise<Flight | undefined> {
    return this.flights.get(id);
  }

  async listFlights(): Promise<Flight[]> {
    return Array.from(this.flights.values());
  }

  async updateFlight(flight: Flight): Promise<void> {
    this.flights.set(flight.id, flight);
  }
}