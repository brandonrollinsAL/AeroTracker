import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  preferences: json("preferences").$type<UserPreferences>(),
});

export const flights = pgTable("flights", {
  id: serial("id").primaryKey(),
  flightNumber: text("flight_number").notNull(),
  airline: text("airline").notNull(),
  aircraftType: text("aircraft_type"),
  aircraftRegistration: text("aircraft_registration"),
  departureAirport: text("departure_airport").notNull(),
  arrivalAirport: text("arrival_airport").notNull(),
  departureTime: timestamp("departure_time", { mode: 'string' }).notNull(),
  arrivalTime: timestamp("arrival_time", { mode: 'string' }).notNull(),
  status: text("status"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  altitude: integer("altitude"),
  heading: integer("heading"),
  groundSpeed: integer("ground_speed"),
  verticalSpeed: integer("vertical_speed"),
  squawk: text("squawk"),
  lastUpdated: timestamp("last_updated", { mode: 'string' }),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  flightId: integer("flight_id").references(() => flights.id),
  type: text("type").notNull(),
  message: text("message"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const airports = pgTable("airports", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  size: text("size", { enum: ['large', 'medium', 'small'] }),
  type: text("type", { enum: ['international', 'domestic', 'regional'] }),
});

export const aircraft = pgTable("aircraft", {
  id: serial("id").primaryKey(),
  registration: text("registration").notNull().unique(),
  type: text("type").notNull(),
  airline: text("airline"),
  manufacturerSerialNumber: text("manufacturer_serial_number"),
  age: real("age"),
  details: json("details").$type<AircraftDetails>(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  preferences: true,
});

export const insertFlightSchema = createInsertSchema(flights).omit({
  id: true
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true
});

export const insertAirportSchema = createInsertSchema(airports).omit({
  id: true
});

export const insertAircraftSchema = createInsertSchema(aircraft).omit({
  id: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFlight = z.infer<typeof insertFlightSchema>;
export type Flight = typeof flights.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAirport = z.infer<typeof insertAirportSchema>;
export type Airport = typeof airports.$inferSelect;
export type InsertAircraft = z.infer<typeof insertAircraftSchema>;
export type Aircraft = typeof aircraft.$inferSelect;

// Custom types
export type AircraftDetails = {
  engines?: string;
  engineType?: string;
  firstFlight?: string;
  icaoType?: string;
  icaoClass?: string;
  range?: number;
  ceiling?: number;
};

export type UserPreferences = {
  mapFilters?: {
    showFlightPaths?: boolean;
    showWeather?: boolean;
    aircraftTypes?: string[];
  };
  alertSettings?: {
    delayThreshold?: number;
    enableEmailAlerts?: boolean;
    enablePushAlerts?: boolean;
  };
};

// API models and types
export type LiveFlight = {
  id: string;
  callsign: string;
  flightNumber?: string;
  registration?: string;
  aircraftType?: string;
  airline?: {
    name: string;
    icao: string;
    iata?: string;
  };
  departure?: {
    icao: string;
    iata?: string;
    name?: string;
    time?: string;
  };
  arrival?: {
    icao: string;
    iata?: string;
    name?: string;
    time?: string;
  };
  position: {
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
    groundSpeed: number;
    verticalSpeed?: number;
    timestamp: string;
  };
  status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'diverted' | 'delayed';
  route?: string;
  progress?: number;
  squawk?: string;
};

export type WeatherImpact = {
  windImpact: number;
  visibilityImpact: number;
  precipitationImpact: number;
  turbulenceImpact: number;
  overallImpact: number;
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  recommendations: string[];
};

export type WeatherAlert = {
  event: string;
  severity: string; 
  headline: string;
  description: string;
  effective: string;
  expires: string;
  instruction: string;
};

export type WeatherData = {
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  current: {
    tempC: number;
    tempF: number;
    condition: string;
    conditionIcon?: string;
    windMph: number;
    windDir: string;
    pressureInHg: number;
    humidity: number;
    visibilityMiles: number;
    dewpointF: number;
    feelsLikeF?: number;
    cloudCeiling?: string;
    isDay?: boolean;
    uv?: number;
    airQuality?: {
      usEpaIndex: number;
      pm2_5: number;
    };
  };
  forecast?: {
    daily: Array<{
      date: string;
      tempMaxF: number;
      tempMinF: number;
      condition: string;
      conditionIcon?: string;
      precipChance: number;
      windMph?: number;
      humidity?: number;
      visibility?: number;
      uvIndex?: number;
    }>;
    hourly?: Array<{
      time: string;
      tempF: number;
      condition: string;
      conditionIcon?: string;
      windMph: number;
      windDir: string;
      precipChance: number;
      humidity: number;
      cloudCover: number;
      feelsLikeF: number;
      windGustMph: number;
      visibilityMiles: number;
    }>;
  };
  alerts?: WeatherAlert[];
  flightImpact?: WeatherImpact;
};

export type MapFilter = {
  type: 'all' | 'commercial' | 'private' | 'cargo';
  showWeather: boolean;
  showFlightPaths: boolean;
  showAirports: boolean;
  airline?: string;
  aircraft?: string;
  tailNumber?: string;
  purpose?: 'passenger' | 'freight' | 'military' | 'general' | 'all';
  sortBy?: 'airline' | 'altitude' | 'speed' | 'departure' | 'arrival' | 'time';
  sortOrder?: 'asc' | 'desc';
};
