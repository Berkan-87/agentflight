import { Flight, FlightStorage } from "../types.js";
export declare class FileStorage implements FlightStorage {
    private filePath;
    constructor(filePath: string);
    private readAll;
    private writeAll;
    saveFlight(flight: Flight): Promise<void>;
    getFlight(id: string): Promise<Flight | undefined>;
    listFlights(): Promise<Flight[]>;
    updateFlight(flight: Flight): Promise<void>;
}
