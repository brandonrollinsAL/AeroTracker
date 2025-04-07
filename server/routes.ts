import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { setupWebSocketServer } from "./webSocket";
import { fetchFlights, fetchFlightDetails, fetchAircraft } from "./api/aviation";
import { fetchWeather, getRouteWeatherImpact } from "./api/weather";
import { fetchUSAirports, searchAirports } from "./api/airports";
import { 
  getFlightPerformanceMetrics, 
  getAirlinePerformanceMetrics, 
  getAirportPerformanceMetrics 
} from "./api/analytics";
import { calculateOptimizedRoute } from "./api/routes";
import { MapFilter, insertAlertSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Set up authentication
  setupAuth(app);
  
  // Set up WebSocket server for real-time updates
  setupWebSocketServer(httpServer);

  // API Routes - prefix all routes with /api
  
  // Get all flights with advanced filtering
  app.get("/api/flights", async (req, res) => {
    try {
      // Extract all filter parameters from query
      const filterType = (req.query.type as string) || 'all';
      const validTypes = ['all', 'commercial', 'private', 'cargo'];
      
      if (!validTypes.includes(filterType)) {
        return res.status(400).json({ message: "Invalid filter type" });
      }
      
      const airline = req.query.airline as string;
      const aircraft = req.query.aircraft as string;
      const tailNumber = req.query.tailNumber as string;
      const purpose = req.query.purpose as string;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as string;
      
      // Get flights with basic filter
      let flights = await fetchFlights(filterType as MapFilter['type']);
      
      // Apply additional filtering
      if (airline) {
        flights = flights.filter(f => 
          f.airline?.name?.toLowerCase().includes(airline.toLowerCase()) || 
          f.airline?.icao?.toLowerCase() === airline.toLowerCase() ||
          f.airline?.iata?.toLowerCase() === airline.toLowerCase()
        );
      }
      
      if (aircraft) {
        flights = flights.filter(f => 
          f.aircraftType?.toLowerCase().includes(aircraft.toLowerCase())
        );
      }
      
      if (tailNumber) {
        flights = flights.filter(f => 
          f.registration?.toLowerCase().includes(tailNumber.toLowerCase())
        );
      }
      
      if (purpose && purpose !== 'all') {
        flights = flights.filter(f => {
          // Determine purpose based on available data
          if (purpose === 'passenger') {
            return f.airline?.name != null && !f.callsign?.includes('CARGO');
          } else if (purpose === 'freight') {
            return f.callsign?.includes('CARGO') || f.airline?.name?.toLowerCase().includes('cargo');
          } else if (purpose === 'military') {
            return f.callsign?.includes('MILITARY') || 
                  f.callsign?.startsWith('RCH') || // Air Mobility Command
                  f.callsign?.includes('NAVY');
          } else if (purpose === 'general') {
            return f.airline?.name == null;
          }
          return true;
        });
      }
      
      // Apply sorting if specified
      if (sortBy) {
        flights.sort((a, b) => {
          let comparison = 0;
          
          switch(sortBy) {
            case 'airline':
              comparison = (a.airline?.name || '').localeCompare(b.airline?.name || '');
              break;
            case 'altitude':
              comparison = (a.position.altitude || 0) - (b.position.altitude || 0);
              break;
            case 'speed':
              comparison = (a.position.groundSpeed || 0) - (b.position.groundSpeed || 0);
              break;
            case 'departure':
              comparison = (a.departure?.icao || '').localeCompare(b.departure?.icao || '');
              break;
            case 'arrival':
              comparison = (a.arrival?.icao || '').localeCompare(b.arrival?.icao || '');
              break;
            case 'time':
              const aTime = a.departure?.time ? new Date(a.departure.time).getTime() : 0;
              const bTime = b.departure?.time ? new Date(b.departure.time).getTime() : 0;
              comparison = aTime - bTime;
              break;
          }
          
          return sortOrder === 'desc' ? -comparison : comparison;
        });
      }
      
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

  // Get all airports or search
  app.get("/api/airports", async (req, res) => {
    try {
      const query = req.query.search as string;
      let airports;
      
      if (query) {
        // Search airports by name, code, or city
        airports = await searchAirports(query);
      } else {
        // Get or fetch all US airports
        airports = await fetchUSAirports();
      }
      
      res.json(airports);
    } catch (error) {
      console.error("Error fetching airports:", error);
      res.status(500).json({ message: "Failed to fetch airports" });
    }
  });

  // Get airport information by code
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
        const fetchedWeather = await fetchWeather(location);
        
        if (fetchedWeather) {
          // Cache the weather data
          await storage.cacheWeatherData(location, fetchedWeather);
          weatherData = fetchedWeather;
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
      
      // Define a more specific type for our search results array
      interface SearchResult {
        type: 'flight' | 'airport' | 'aircraft';
        id: string | number;
        [key: string]: any; // To allow for the spread operator
      }
      
      let results: SearchResult[] = [];
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
        results = [...results, ...matchedFlights.map(f => ({ ...f, type: 'flight' as const }))];
      }
      
      if (!type || type === 'airports') {
        const airports = await storage.getAllAirports();
        const matchedAirports = airports.filter(airport => 
          airport.code.toLowerCase().includes(searchQuery) ||
          airport.name.toLowerCase().includes(searchQuery) ||
          airport.city.toLowerCase().includes(searchQuery)
        );
        results = [...results, ...matchedAirports.map(a => ({ ...a, type: 'airport' as const }))];
      }
      
      if (!type || type === 'aircraft') {
        const aircraft = await storage.getAllAircraft();
        const matchedAircraft = aircraft.filter(ac => 
          ac.registration.toLowerCase().includes(searchQuery) ||
          ac.type.toLowerCase().includes(searchQuery) ||
          (ac.airline && ac.airline.toLowerCase().includes(searchQuery))
        );
        results = [...results, ...matchedAircraft.map(a => ({ ...a, type: 'aircraft' as const }))];
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

  // ANALYTICS ENDPOINTS
  
  // Get flight performance metrics
  app.get("/api/analytics/flight/:flightId", async (req, res) => {
    try {
      const { flightId } = req.params;
      
      const metrics = await getFlightPerformanceMetrics(flightId);
      
      if (!metrics) {
        return res.status(404).json({ message: "Flight not found or no metrics available" });
      }
      
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching flight performance metrics:", error);
      res.status(500).json({ message: "Failed to fetch flight performance metrics" });
    }
  });
  
  // Get airline performance metrics
  app.get("/api/analytics/airline", async (req, res) => {
    try {
      const airlineIcao = req.query.icao as string;
      
      const metrics = await getAirlinePerformanceMetrics(airlineIcao);
      
      if (metrics.length === 0) {
        return res.status(404).json({ message: "No airline metrics available" });
      }
      
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching airline performance metrics:", error);
      res.status(500).json({ message: "Failed to fetch airline performance metrics" });
    }
  });
  
  // Get airport performance metrics
  app.get("/api/analytics/airport", async (req, res) => {
    try {
      const airportCode = req.query.code as string;
      
      const metrics = await getAirportPerformanceMetrics(airportCode);
      
      if (metrics.length === 0) {
        return res.status(404).json({ message: "No airport metrics available" });
      }
      
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching airport performance metrics:", error);
      res.status(500).json({ message: "Failed to fetch airport performance metrics" });
    }
  });

  // ROUTE OPTIMIZATION ENDPOINTS
  
  // Calculate optimized route between two airports
  app.post("/api/routes/optimize", async (req, res) => {
    try {
      const { 
        departureCode, 
        arrivalCode, 
        aircraftType, 
        fuelEfficiency, 
        considerWeather, 
        optimizationFactor,
        plannedDate
      } = req.body;
      
      if (!departureCode || !arrivalCode || !aircraftType) {
        return res.status(400).json({ 
          message: "Missing required parameters: departureCode, arrivalCode, and aircraftType are required" 
        });
      }
      
      // Set default values for optional parameters
      const params = {
        departureCode,
        arrivalCode,
        aircraftType,
        fuelEfficiency: fuelEfficiency || 50,
        considerWeather: considerWeather !== undefined ? considerWeather : true,
        optimizationFactor: optimizationFactor || 'balanced',
        plannedDate
      };
      
      const optimizedRoute = await calculateOptimizedRoute(params);
      
      if (!optimizedRoute) {
        return res.status(404).json({ message: "Could not calculate optimized route" });
      }
      
      res.json(optimizedRoute);
    } catch (error) {
      console.error("Error calculating optimized route:", error);
      res.status(500).json({ message: "Failed to calculate optimized route" });
    }
  });

  // Get weather impact for a route between airports
  app.get("/api/weather/route-impact", async (req, res) => {
    try {
      const { departureCode, arrivalCode } = req.query;
      
      if (!departureCode || !arrivalCode) {
        return res.status(400).json({ 
          message: "Missing required parameters: departureCode and arrivalCode are required" 
        });
      }
      
      const weatherImpact = await getRouteWeatherImpact(
        departureCode as string, 
        arrivalCode as string
      );
      
      res.json(weatherImpact);
    } catch (error) {
      console.error("Error fetching route weather impact:", error);
      res.status(500).json({ message: "Failed to fetch weather impact for route" });
    }
  });

  return httpServer;
}
