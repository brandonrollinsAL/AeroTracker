import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { setupWebSocketServer } from "./webSocket";
import { fetchFlights, fetchFlightDetails, fetchAircraft } from "./api/aviation";
import { fetchWeather } from "./api/weather";
import { MapFilter, insertAlertSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Set up WebSocket server for real-time updates
  setupWebSocketServer(httpServer);

  // API Routes - prefix all routes with /api
  
  // Get all flights
  app.get("/api/flights", async (req, res) => {
    try {
      // Get query parameters for filtering
      const filterType = (req.query.type as string) || 'all';
      const validTypes = ['all', 'commercial', 'private', 'cargo'];
      
      if (!validTypes.includes(filterType)) {
        return res.status(400).json({ message: "Invalid filter type" });
      }
      
      const flights = await fetchFlights(filterType as MapFilter['type']);
      res.json(flights);
    } catch (error) {
      console.error("Error fetching flights:", error);
      res.status(500).json({ message: "Failed to fetch flights" });
    }
  });

  // Get a specific flight by ID
  app.get("/api/flights/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const flight = await fetchFlightDetails(id);
      
      if (!flight) {
        return res.status(404).json({ message: "Flight not found" });
      }
      
      res.json(flight);
    } catch (error) {
      console.error("Error fetching flight details:", error);
      res.status(500).json({ message: "Failed to fetch flight details" });
    }
  });

  // Get airport information
  app.get("/api/airports/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const airport = await storage.getAirportByCode(code);
      
      if (!airport) {
        return res.status(404).json({ message: "Airport not found" });
      }
      
      res.json(airport);
    } catch (error) {
      console.error("Error fetching airport:", error);
      res.status(500).json({ message: "Failed to fetch airport information" });
    }
  });

  // Get aircraft information
  app.get("/api/aircraft/:registration", async (req, res) => {
    try {
      const { registration } = req.params;
      
      // First check local storage
      let aircraft = await storage.getAircraftByRegistration(registration);
      
      // If not found, try to fetch from external API
      if (!aircraft) {
        const aircraftData = await fetchAircraft(registration);
        
        if (aircraftData) {
          // Store in local storage for future use
          aircraft = await storage.createAircraft({
            registration: aircraftData.registration,
            type: aircraftData.type,
            airline: aircraftData.airline,
            manufacturerSerialNumber: aircraftData.manufacturerSerialNumber,
            age: aircraftData.age,
            details: aircraftData.details
          });
        } else {
          return res.status(404).json({ message: "Aircraft not found" });
        }
      }
      
      res.json(aircraft);
    } catch (error) {
      console.error("Error fetching aircraft:", error);
      res.status(500).json({ message: "Failed to fetch aircraft information" });
    }
  });

  // Get weather information
  app.get("/api/weather/:location", async (req, res) => {
    try {
      const { location } = req.params;
      
      // Check if we have cached weather data
      let weatherData = await storage.getCachedWeather(location);
      
      // If no cached data or stale, fetch from API
      if (!weatherData) {
        weatherData = await fetchWeather(location);
        
        if (weatherData) {
          // Cache the weather data
          await storage.cacheWeatherData(location, weatherData);
        } else {
          return res.status(404).json({ message: "Weather data not found" });
        }
      }
      
      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ message: "Failed to fetch weather information" });
    }
  });

  // Search endpoint for flights, airports, and aircraft
  app.get("/api/search", async (req, res) => {
    try {
      const { query, type } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      let results = [];
      const searchQuery = query.toString().toLowerCase();
      
      if (!type || type === 'flights') {
        const flights = await fetchFlights('all');
        const matchedFlights = flights.filter(flight => 
          flight.callsign?.toLowerCase().includes(searchQuery) ||
          flight.flightNumber?.toLowerCase().includes(searchQuery) ||
          flight.registration?.toLowerCase().includes(searchQuery) ||
          flight.departure?.icao?.toLowerCase().includes(searchQuery) ||
          flight.arrival?.icao?.toLowerCase().includes(searchQuery)
        );
        results = [...results, ...matchedFlights.map(f => ({ ...f, type: 'flight' }))];
      }
      
      if (!type || type === 'airports') {
        const airports = await storage.getAllAirports();
        const matchedAirports = airports.filter(airport => 
          airport.code.toLowerCase().includes(searchQuery) ||
          airport.name.toLowerCase().includes(searchQuery) ||
          airport.city.toLowerCase().includes(searchQuery)
        );
        results = [...results, ...matchedAirports.map(a => ({ ...a, type: 'airport' }))];
      }
      
      if (!type || type === 'aircraft') {
        const aircraft = await storage.getAllAircraft();
        const matchedAircraft = aircraft.filter(ac => 
          ac.registration.toLowerCase().includes(searchQuery) ||
          ac.type.toLowerCase().includes(searchQuery) ||
          (ac.airline && ac.airline.toLowerCase().includes(searchQuery))
        );
        results = [...results, ...matchedAircraft.map(a => ({ ...a, type: 'aircraft' }))];
      }
      
      res.json(results);
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ message: "Search operation failed" });
    }
  });

  // Create alert
  app.post("/api/alerts", async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      }
      console.error("Error creating alert:", error);
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  // Get alerts for a user
  app.get("/api/alerts/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const alerts = await storage.getAlertsByUser(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  return httpServer;
}
