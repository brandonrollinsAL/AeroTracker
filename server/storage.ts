import { 
  users, type User, type InsertUser, 
  flights, type Flight, type InsertFlight,
  alerts, type Alert, type InsertAlert,
  airports, type Airport, type InsertAirport,
  aircraft, type Aircraft, type InsertAircraft,
  type LiveFlight, type WeatherData, type MapFilter,
  type UserPreferences, type AircraftDetails
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

// Database storage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  // Shared caches for external API data
  private cachedLiveFlights: LiveFlight[] = [];
  private cachedWeather: Map<string, { data: WeatherData, timestamp: number }> = new Map();

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure values are not undefined 
    const userValues = {
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email ?? null,
      preferences: insertUser.preferences ?? null
    };
    
    // Insert as a single value, not an array
    const [user] = await db.insert(users).values([userValues]).returning();
    return user;
  }

  // Flight operations
  async getFlight(id: number): Promise<Flight | undefined> {
    const [flight] = await db.select().from(flights).where(eq(flights.id, id));
    return flight;
  }

  async getFlightByFlightNumber(flightNumber: string): Promise<Flight | undefined> {
    const [flight] = await db.select().from(flights).where(eq(flights.flightNumber, flightNumber));
    return flight;
  }

  async getAllFlights(): Promise<Flight[]> {
    return await db.select().from(flights);
  }

  async createFlight(insertFlight: InsertFlight): Promise<Flight> {
    // Ensure values are not undefined
    const flightValues = {
      flightNumber: insertFlight.flightNumber,
      airline: insertFlight.airline,
      departureAirport: insertFlight.departureAirport,
      arrivalAirport: insertFlight.arrivalAirport,
      departureTime: insertFlight.departureTime,
      arrivalTime: insertFlight.arrivalTime,
      status: insertFlight.status ?? null,
      aircraftType: insertFlight.aircraftType ?? null,
      aircraftRegistration: insertFlight.aircraftRegistration ?? null,
      latitude: insertFlight.latitude ?? null,
      longitude: insertFlight.longitude ?? null,
      altitude: insertFlight.altitude ?? null,
      heading: insertFlight.heading ?? null,
      groundSpeed: insertFlight.groundSpeed ?? null,
      verticalSpeed: insertFlight.verticalSpeed ?? null,
      squawk: insertFlight.squawk ?? null,
      lastUpdated: insertFlight.lastUpdated ?? null
    };
    
    const [flight] = await db.insert(flights).values([flightValues]).returning();
    return flight;
  }

  async updateFlight(id: number, flightData: Partial<InsertFlight>): Promise<Flight | undefined> {
    const [updatedFlight] = await db
      .update(flights)
      .set(flightData)
      .where(eq(flights.id, id))
      .returning();
    return updatedFlight;
  }

  async deleteFlight(id: number): Promise<boolean> {
    const result = await db.delete(flights).where(eq(flights.id, id)).returning({ id: flights.id });
    return result.length > 0;
  }

  // Alert operations
  async getAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert;
  }

  async getAlertsByUser(userId: number): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.userId, userId));
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    // Ensure values are not undefined
    const alertValues = {
      type: insertAlert.type,
      userId: insertAlert.userId ?? null,
      flightId: insertAlert.flightId ?? null,
      message: insertAlert.message ?? null,
      isRead: insertAlert.isRead ?? false,
      createdAt: new Date().toISOString()
    };
    
    const [alert] = await db.insert(alerts).values([alertValues]).returning();
    return alert;
  }

  async updateAlert(id: number, alertData: Partial<InsertAlert>): Promise<Alert | undefined> {
    const [updatedAlert] = await db
      .update(alerts)
      .set(alertData)
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert;
  }

  async deleteAlert(id: number): Promise<boolean> {
    const result = await db.delete(alerts).where(eq(alerts.id, id)).returning({ id: alerts.id });
    return result.length > 0;
  }

  // Airport operations
  async getAirport(id: number): Promise<Airport | undefined> {
    const [airport] = await db.select().from(airports).where(eq(airports.id, id));
    return airport;
  }

  async getAirportByCode(code: string): Promise<Airport | undefined> {
    const [airport] = await db.select().from(airports).where(eq(airports.code, code));
    return airport;
  }

  async getAllAirports(): Promise<Airport[]> {
    return await db.select().from(airports);
  }

  async createAirport(insertAirport: InsertAirport): Promise<Airport> {
    const airportValues = {
      code: insertAirport.code,
      name: insertAirport.name,
      city: insertAirport.city,
      country: insertAirport.country,
      latitude: insertAirport.latitude,
      longitude: insertAirport.longitude
    };
    
    const [airport] = await db.insert(airports).values([airportValues]).returning();
    return airport;
  }

  // Aircraft operations
  async getAircraft(id: number): Promise<Aircraft | undefined> {
    const [aircraftItem] = await db.select().from(aircraft).where(eq(aircraft.id, id));
    return aircraftItem;
  }

  async getAircraftByRegistration(registration: string): Promise<Aircraft | undefined> {
    const [aircraftItem] = await db.select().from(aircraft).where(eq(aircraft.registration, registration));
    return aircraftItem;
  }

  async getAllAircraft(): Promise<Aircraft[]> {
    return await db.select().from(aircraft);
  }

  async createAircraft(insertAircraft: InsertAircraft): Promise<Aircraft> {
    // Ensure values are not undefined
    const aircraftValues = {
      type: insertAircraft.type,
      registration: insertAircraft.registration,
      airline: insertAircraft.airline ?? null,
      manufacturerSerialNumber: insertAircraft.manufacturerSerialNumber ?? null,
      age: insertAircraft.age ?? null,
      details: insertAircraft.details ?? null
    };
    
    const [aircraftItem] = await db.insert(aircraft).values([aircraftValues]).returning();
    return aircraftItem;
  }

  // Cache operations for external API data - still uses in-memory storage
  // as this is temporary data that doesn't need to persist between app restarts
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

// Using PostgreSQL database storage
export const storage = new DatabaseStorage();
