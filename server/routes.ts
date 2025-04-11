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
import { calculateOptimalRoute, generateAlternativeRoutes } from "./api/routeOptimization";
import { MapFilter, insertAlertSchema, insertAirportSchema, insertAircraftSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { 
  fetchAirportDetails, 
  fetchAircraftDetails, 
  bulkFetchAirports, 
  bulkFetchAircraft 
} from "./services/openai";
import { handleNexradRequest } from "./api/nexrad";
import { setupDashboardRoutes } from "./api/dashboard";
import { testConnection } from "./db";
import subscriptionRoutes from "./routes/subscription";
import webhookRoutes from "./routes/webhook";

export async function registerRoutes(app: Express): Promise<Server> {
  // Test database connection on startup
  try {
    const connected = await testConnection();
    if (connected) {
      console.log("✅ Database connection established successfully");
    } else {
      console.error("❌ Database connection failed");
    }
  } catch (error) {
    console.error("❌ Database connection test error:", error);
  }

  const httpServer = createServer(app);

  // Set up authentication
  setupAuth(app);
  
  // Set up WebSocket server for real-time updates
  setupWebSocketServer(httpServer);
  
  // Set up dashboard routes
  setupDashboardRoutes(app);
  
  // Register subscription and webhook routes
  app.use('/api/subscription', subscriptionRoutes);
  app.use('/api/webhooks', webhookRoutes);

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
  
  // Get NEXRAD radar data
  app.get("/api/nexrad", handleNexradRequest);

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
  
  // New route optimization endpoint using the enhanced routeOptimization.ts functions
  app.post("/api/route/optimize", async (req, res) => {
    try {
      const { departureCode, arrivalCode, aircraftType, flightLevel } = req.body;
      
      if (!departureCode || !arrivalCode) {
        return res.status(400).json({ error: 'Departure and arrival airport codes are required' });
      }
      
      // Get airport data from storage
      const departureAirport = await storage.getAirportByCode(departureCode);
      const arrivalAirport = await storage.getAirportByCode(arrivalCode);
      
      if (!departureAirport || !arrivalAirport) {
        return res.status(404).json({ 
          error: 'One or both airports not found',
          departureFound: !!departureAirport,
          arrivalFound: !!arrivalAirport
        });
      }
      
      // Calculate optimal route
      const result = await calculateOptimalRoute(
        departureAirport, 
        arrivalAirport, 
        aircraftType || 'B737', // Default to B737 if not specified
        flightLevel || 350 // Default to FL350 if not specified
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error calculating optimal route:', error);
      res.status(500).json({ error: 'Failed to calculate optimal route' });
    }
  });

  // ENHANCED AIRPORT AND AIRCRAFT DATA ENDPOINTS WITH OPENAI
  
  // Get detailed airport information using OpenAI
  app.get("/api/airports/:code/details", async (req, res) => {
    try {
      const { code } = req.params;
      
      // First check if we already have detailed information
      const existingAirport = await storage.getAirportByCode(code);
      
      if (existingAirport && existingAirport.details) {
        return res.json(existingAirport);
      }
      
      // Fetch enhanced details from OpenAI
      const airportDetails = await fetchAirportDetails(code);
      
      if (!airportDetails) {
        return res.status(404).json({ message: "Could not retrieve airport details" });
      }
      
      // If we have the airport record but no details, update it
      if (existingAirport) {
        const updatedAirport = await storage.updateAirport(existingAirport.id, {
          details: airportDetails
        });
        return res.json(updatedAirport);
      }
      
      // Otherwise create a new airport record with the details
      const newAirport = await storage.createAirport({
        code: code.toUpperCase(),
        name: airportDetails.name || 'Unknown',
        city: airportDetails.city || 'Unknown',
        country: airportDetails.country || 'Unknown',
        latitude: airportDetails.latitude || 0,
        longitude: airportDetails.longitude || 0,
        elevation: airportDetails.elevation,
        timeZone: airportDetails.timeZone,
        details: airportDetails
      });
      
      res.json(newAirport);
    } catch (error) {
      console.error("Error fetching enhanced airport details:", error);
      res.status(500).json({ message: "Failed to fetch enhanced airport details" });
    }
  });
  
  // Get detailed aircraft information using OpenAI
  app.get("/api/aircraft/:type/details", async (req, res) => {
    try {
      const { type } = req.params;
      
      // Check if we have any aircraft with this type that has details
      const existingAircraft = await storage.getAllAircraft();
      const matchingAircraft = existingAircraft.find(
        a => a.type.toLowerCase() === type.toLowerCase() && a.details
      );
      
      if (matchingAircraft) {
        return res.json(matchingAircraft);
      }
      
      // Fetch enhanced details from OpenAI
      const aircraftDetails = await fetchAircraftDetails(type);
      
      if (!aircraftDetails) {
        return res.status(404).json({ message: "Could not retrieve aircraft details" });
      }
      
      // Create a new aircraft record with the details
      const newAircraft = await storage.createAircraft({
        registration: `MODEL-${type.toUpperCase()}`,
        type: type,
        manufacturer: aircraftDetails.manufacturer || 'Unknown',
        model: aircraftDetails.model || type,
        details: aircraftDetails
      });
      
      res.json(newAircraft);
    } catch (error) {
      console.error("Error fetching enhanced aircraft details:", error);
      res.status(500).json({ message: "Failed to fetch enhanced aircraft details" });
    }
  });
  
  // Bulk fetch and populate airport data
  app.post("/api/airports/bulk", async (req, res) => {
    try {
      const { codes } = req.body;
      
      if (!codes || !Array.isArray(codes) || codes.length === 0) {
        return res.status(400).json({ message: "Please provide an array of airport codes" });
      }
      
      // Limit batch size
      if (codes.length > 50) {
        return res.status(400).json({ message: "Maximum batch size is 50 airports" });
      }
      
      const airportDetailsList = await bulkFetchAirports(codes);
      
      if (!airportDetailsList || airportDetailsList.length === 0) {
        return res.status(404).json({ message: "Could not retrieve airport details" });
      }
      
      // Process and save each airport
      const savedAirports = [];
      for (const airportData of airportDetailsList) {
        // Skip if code is missing
        if (!airportData.code) continue;
        
        const existingAirport = await storage.getAirportByCode(airportData.code);
        
        if (existingAirport) {
          // Update existing airport with new details
          const updatedAirport = await storage.updateAirport(existingAirport.id, {
            details: { ...existingAirport.details, ...airportData.details }
          });
          savedAirports.push(updatedAirport);
        } else {
          // Create new airport record
          const newAirport = await storage.createAirport({
            code: airportData.code.toUpperCase(),
            name: airportData.name || 'Unknown',
            city: airportData.city || 'Unknown',
            country: airportData.country || 'Unknown',
            latitude: airportData.latitude || 0,
            longitude: airportData.longitude || 0,
            elevation: airportData.elevation,
            size: airportData.size || 'medium',
            type: airportData.type || 'domestic',
            details: airportData.details || {}
          });
          savedAirports.push(newAirport);
        }
      }
      
      res.json({ 
        message: `Successfully processed ${savedAirports.length} airports`,
        airports: savedAirports
      });
    } catch (error) {
      console.error("Error bulk fetching airport details:", error);
      res.status(500).json({ message: "Failed to bulk fetch airport details" });
    }
  });
  
  // Bulk fetch and populate aircraft data
  app.post("/api/aircraft/bulk", async (req, res) => {
    try {
      const { types } = req.body;
      
      if (!types || !Array.isArray(types) || types.length === 0) {
        return res.status(400).json({ message: "Please provide an array of aircraft types" });
      }
      
      // Limit batch size
      if (types.length > 25) {
        return res.status(400).json({ message: "Maximum batch size is 25 aircraft types" });
      }
      
      const aircraftDetailsList = await bulkFetchAircraft(types);
      
      if (!aircraftDetailsList || aircraftDetailsList.length === 0) {
        return res.status(404).json({ message: "Could not retrieve aircraft details" });
      }
      
      // Process and save each aircraft
      const savedAircraft = [];
      for (const aircraftData of aircraftDetailsList) {
        // Skip if type is missing
        if (!aircraftData.type) continue;
        
        // Check if we already have this aircraft type
        const existingAircraft = await storage.getAllAircraft();
        const matchingAircraft = existingAircraft.find(
          a => a.type.toLowerCase() === aircraftData.type.toLowerCase()
        );
        
        if (matchingAircraft) {
          // Update existing aircraft with new details
          const updatedAircraft = await storage.updateAircraft(matchingAircraft.id, {
            details: { ...matchingAircraft.details, ...aircraftData.details }
          });
          savedAircraft.push(updatedAircraft);
        } else {
          // Create new aircraft record
          const newAircraft = await storage.createAircraft({
            registration: `MODEL-${aircraftData.type.toUpperCase()}`,
            type: aircraftData.type,
            manufacturer: aircraftData.manufacturer || 'Unknown',
            model: aircraftData.model || aircraftData.type,
            category: aircraftData.category || 'commercial',
            details: aircraftData.details || {}
          });
          savedAircraft.push(newAircraft);
        }
      }
      
      res.json({ 
        message: `Successfully processed ${savedAircraft.length} aircraft types`,
        aircraft: savedAircraft
      });
    } catch (error) {
      console.error("Error bulk fetching aircraft details:", error);
      res.status(500).json({ message: "Failed to bulk fetch aircraft details" });
    }
  });

  return httpServer;
}
