import { 
  users, type User, type InsertUser, 
  flights, type Flight, type InsertFlight,
  alerts, type Alert, type InsertAlert,
  airports, type Airport, type InsertAirport,
  aircraft, type Aircraft, type InsertAircraft,
  type LiveFlight, type WeatherData, type MapFilter
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Flight operations
  getFlight(id: number): Promise<Flight | undefined>;
  getFlightByFlightNumber(flightNumber: string): Promise<Flight | undefined>;
  getAllFlights(): Promise<Flight[]>;
  createFlight(flight: InsertFlight): Promise<Flight>;
  updateFlight(id: number, flight: Partial<InsertFlight>): Promise<Flight | undefined>;
  deleteFlight(id: number): Promise<boolean>;

  // Alert operations
  getAlert(id: number): Promise<Alert | undefined>;
  getAlertsByUser(userId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, alert: Partial<InsertAlert>): Promise<Alert | undefined>;
  deleteAlert(id: number): Promise<boolean>;

  // Airport operations
  getAirport(id: number): Promise<Airport | undefined>;
  getAirportByCode(code: string): Promise<Airport | undefined>;
  getAllAirports(): Promise<Airport[]>;
  createAirport(airport: InsertAirport): Promise<Airport>;

  // Aircraft operations
  getAircraft(id: number): Promise<Aircraft | undefined>;
  getAircraftByRegistration(registration: string): Promise<Aircraft | undefined>;
  getAllAircraft(): Promise<Aircraft[]>;
  createAircraft(aircraft: InsertAircraft): Promise<Aircraft>;

  // Cache operations for external data
  cacheFlightData(flights: LiveFlight[]): Promise<void>;
  getCachedFlights(): Promise<LiveFlight[]>;
  cacheWeatherData(location: string, data: WeatherData): Promise<void>;
  getCachedWeather(location: string): Promise<WeatherData | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private flights: Map<number, Flight>;
  private alerts: Map<number, Alert>;
  private airports: Map<number, Airport>;
  private aircraft: Map<number, Aircraft>;
  
  // Cache for external API data
  private cachedLiveFlights: LiveFlight[] = [];
  private cachedWeather: Map<string, { data: WeatherData, timestamp: number }> = new Map();
  
  // ID counters
  private userIdCounter: number;
  private flightIdCounter: number;
  private alertIdCounter: number;
  private airportIdCounter: number;
  private aircraftIdCounter: number;

  constructor() {
    this.users = new Map();
    this.flights = new Map();
    this.alerts = new Map();
    this.airports = new Map();
    this.aircraft = new Map();
    
    this.userIdCounter = 1;
    this.flightIdCounter = 1;
    this.alertIdCounter = 1;
    this.airportIdCounter = 1;
    this.aircraftIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Flight operations
  async getFlight(id: number): Promise<Flight | undefined> {
    return this.flights.get(id);
  }

  async getFlightByFlightNumber(flightNumber: string): Promise<Flight | undefined> {
    return Array.from(this.flights.values()).find(
      (flight) => flight.flightNumber === flightNumber,
    );
  }

  async getAllFlights(): Promise<Flight[]> {
    return Array.from(this.flights.values());
  }

  async createFlight(insertFlight: InsertFlight): Promise<Flight> {
    const id = this.flightIdCounter++;
    const flight: Flight = { ...insertFlight, id };
    this.flights.set(id, flight);
    return flight;
  }

  async updateFlight(id: number, flightData: Partial<InsertFlight>): Promise<Flight | undefined> {
    const flight = this.flights.get(id);
    if (!flight) return undefined;

    const updatedFlight = { ...flight, ...flightData };
    this.flights.set(id, updatedFlight);
    return updatedFlight;
  }

  async deleteFlight(id: number): Promise<boolean> {
    return this.flights.delete(id);
  }

  // Alert operations
  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async getAlertsByUser(userId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.userId === userId,
    );
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.alertIdCounter++;
    const alert: Alert = { ...insertAlert, id, createdAt: new Date().toISOString() };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: number, alertData: Partial<InsertAlert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;

    const updatedAlert = { ...alert, ...alertData };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async deleteAlert(id: number): Promise<boolean> {
    return this.alerts.delete(id);
  }

  // Airport operations
  async getAirport(id: number): Promise<Airport | undefined> {
    return this.airports.get(id);
  }

  async getAirportByCode(code: string): Promise<Airport | undefined> {
    return Array.from(this.airports.values()).find(
      (airport) => airport.code === code,
    );
  }

  async getAllAirports(): Promise<Airport[]> {
    return Array.from(this.airports.values());
  }

  async createAirport(insertAirport: InsertAirport): Promise<Airport> {
    const id = this.airportIdCounter++;
    const airport: Airport = { ...insertAirport, id };
    this.airports.set(id, airport);
    return airport;
  }

  // Aircraft operations
  async getAircraft(id: number): Promise<Aircraft | undefined> {
    return this.aircraft.get(id);
  }

  async getAircraftByRegistration(registration: string): Promise<Aircraft | undefined> {
    return Array.from(this.aircraft.values()).find(
      (aircraft) => aircraft.registration === registration,
    );
  }

  async getAllAircraft(): Promise<Aircraft[]> {
    return Array.from(this.aircraft.values());
  }

  async createAircraft(insertAircraft: InsertAircraft): Promise<Aircraft> {
    const id = this.aircraftIdCounter++;
    const newAircraft: Aircraft = { ...insertAircraft, id };
    this.aircraft.set(id, newAircraft);
    return newAircraft;
  }

  // Cache operations for external API data
  async cacheFlightData(flights: LiveFlight[]): Promise<void> {
    this.cachedLiveFlights = flights;
  }

  async getCachedFlights(): Promise<LiveFlight[]> {
    return this.cachedLiveFlights;
  }

  async cacheWeatherData(location: string, data: WeatherData): Promise<void> {
    this.cachedWeather.set(location, { 
      data,
      timestamp: Date.now() 
    });
  }

  async getCachedWeather(location: string): Promise<WeatherData | undefined> {
    const cached = this.cachedWeather.get(location);
    // Return cached data if it's less than 1 hour old
    if (cached && Date.now() - cached.timestamp < 3600000) {
      return cached.data;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
