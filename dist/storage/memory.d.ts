import { Flight, FlightStorage } from "../types.js";
export declare class MemoryStorage implements FlightStorage {
    private flights;
    saveFlight(flight: Flight): Promise<void>;
    getFlight(id: string): Promise<Flight | undefined>;
    listFlights(): Promise<Flight[]>;
    updateFlight(flight: Flight): Promise<void>;
}
