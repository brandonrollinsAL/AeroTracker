import axios from 'axios';
import { LiveFlight } from '@shared/schema';

// Environment variable for AviationStack API key
const AVIATIONSTACK_API_KEY = process.env.AVIATION_API_KEY;

// Cache variables
let flightCache: LiveFlight[] = [];
let lastFetchTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute cache TTL to avoid excessive API calls

// AviationStack API base URL
const API_BASE_URL = 'http://api.aviationstack.com/v1';

// Interface for AviationStack response
interface AviationStackFlight {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal?: string;
    gate?: string;
    delay?: number;
    scheduled: string;
    estimated: string;
    actual?: string;
    estimated_runway?: string;
    actual_runway?: string;
  };
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal?: string;
    gate?: string;
    baggage?: string;
    delay?: number;
    scheduled: string;
    estimated: string;
    actual?: string;
    estimated_runway?: string;
    actual_runway?: string;
  };
  airline: {
    name: string;
    iata: string;
    icao: string;
  };
  flight: {
    number: string;
    iata: string;
    icao: string;
  };
  aircraft?: {
    registration?: string;
    iata?: string;
    icao?: string;
    icao24?: string;
  };
  live?: {
    updated: string;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    direction?: number;
    speed_horizontal?: number;
    speed_vertical?: number;
    is_ground?: boolean;
  };
}

interface AviationStackResponse {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: AviationStackFlight[];
}

/**
 * Maps AviationStack flight data format to our LiveFlight format
 */
function mapToLiveFlight(flight: AviationStackFlight): LiveFlight | null {
  try {
    // Skip flights without live position data
    if (!flight.live || flight.live.latitude === undefined || flight.live.longitude === undefined) {
      return null;
    }

    // Generate a unique ID based on flight number and aircraft registration if available
    const id = flight.aircraft?.registration 
      ? `${flight.flight.icao}_${flight.aircraft.registration}`
      : flight.flight.icao;

    // Map the flight status
    let status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'diverted' | 'delayed' = 'scheduled';
    
    switch (flight.flight_status?.toLowerCase()) {
      case 'active':
      case 'en-route':
      case 'in-air':
        status = 'active';
        break;
      case 'landed':
      case 'arrived':
        status = 'landed';
        break;
      case 'cancelled':
        status = 'cancelled';
        break;
      case 'diverted':
        status = 'diverted';
        break;
      case 'delayed':
        status = 'delayed';
        break;
      default:
        status = 'scheduled';
    }

    // Map to our LiveFlight format
    const liveFlight: LiveFlight = {
      id,
      callsign: flight.flight.icao,
      registration: flight.aircraft?.registration,
      aircraftType: flight.aircraft?.icao,
      airline: flight.airline ? {
        name: flight.airline.name,
        iata: flight.airline.iata,
        icao: flight.airline.icao
      } : undefined,
      flightNumber: flight.flight.number,
      departure: {
        icao: flight.departure.icao,
        iata: flight.departure.iata,
        name: flight.departure.airport
      },
      arrival: {
        icao: flight.arrival.icao,
        iata: flight.arrival.iata,
        name: flight.arrival.airport
      },
      position: {
        latitude: flight.live.latitude,
        longitude: flight.live.longitude,
        altitude: flight.live.altitude || 0,
        heading: flight.live.direction || 0,
        groundSpeed: flight.live.speed_horizontal || 0,
        verticalSpeed: flight.live.speed_vertical,
        timestamp: flight.live.updated || new Date().toISOString()
      },
      status
    };

    return liveFlight;
  } catch (error) {
    console.error('Error mapping AviationStack flight:', error);
    return null;
  }
}

/**
 * Fetch real-time flight data from AviationStack API
 */
export async function fetchFlightsFromAviationStack(): Promise<LiveFlight[]> {
  try {
    // Check if we can return cache data
    const now = Date.now();
    if (flightCache.length > 0 && now - lastFetchTimestamp < CACHE_TTL) {
      console.log(`Using cached AviationStack data with ${flightCache.length} flights (cache age: ${Math.round((now - lastFetchTimestamp) / 1000)}s)`);
      return flightCache;
    }

    // Check if API key is available
    if (!AVIATIONSTACK_API_KEY) {
      console.error('⚠️ AviationStack API key not found in environment variables');
      return [];
    }

    console.log('Fetching flight data from AviationStack API...');

    // Call the AviationStack flights/live endpoint
    const response = await axios.get<AviationStackResponse>(`${API_BASE_URL}/flights`, {
      params: {
        access_key: AVIATIONSTACK_API_KEY,
        flight_status: 'active',
        limit: 100  // Fetch up to 100 flights (API limit)
      },
      timeout: 10000 // 10 second timeout
    });

    // Process response
    const flights = response.data.data;
    console.log(`Received ${flights.length} flights from AviationStack API`);

    // Convert to our format
    const mappedFlights = flights
      .map(mapToLiveFlight)
      .filter((flight): flight is LiveFlight => flight !== null);

    // Update cache
    flightCache = mappedFlights;
    lastFetchTimestamp = now;

    return mappedFlights;
  } catch (error) {
    console.error('Error fetching data from AviationStack:', error);
    
    // If cache exists, return that instead
    if (flightCache.length > 0) {
      console.log(`Returning ${flightCache.length} cached flights due to API error`);
      return flightCache;
    }
    
    return [];
  }
}

/**
 * Find a specific flight by ID in the AviationStack cache
 */
export function findFlightById(flightId: string): LiveFlight | undefined {
  return flightCache.find(flight => flight.id === flightId);
}

/**
 * Clear the AviationStack cache
 */
export function clearCache(): void {
  flightCache = [];
  lastFetchTimestamp = 0;
}