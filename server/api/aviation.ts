import axios from 'axios';
import { LiveFlight, Aircraft, MapFilter } from '@shared/schema';

// Get API key from environment variables
const AVIATION_API_KEY = process.env.AVIATION_API_KEY || 'demo_key';

// Base URL for the aviation API
const AVIATION_API_BASE_URL = 'https://aviation-edge.com/v2/public';

/**
 * Fetch flights based on the provided filter type
 */
export async function fetchFlights(filterType: MapFilter['type']): Promise<LiveFlight[]> {
  try {
    // For demo purposes, we'll simulate getting data from a real API
    // In production, you would use a proper aviation API with your key
    const response = await axios.get(`${AVIATION_API_BASE_URL}/flights`, {
      params: {
        key: AVIATION_API_KEY,
        limit: 100,
        flight_type: filterType === 'all' ? undefined : filterType
      }
    });

    if (response.status !== 200) {
      throw new Error(`API returned status ${response.status}`);
    }

    // Transform the API response into our LiveFlight format
    return response.data.map((item: any) => transformFlightData(item));
  } catch (error) {
    console.error('Error fetching flights:', error);
    
    // If API fails in development, return an empty array rather than mock data
    return [];
  }
}

/**
 * Fetch details for a specific flight by ID
 */
export async function fetchFlightDetails(flightId: string): Promise<LiveFlight | null> {
  try {
    const response = await axios.get(`${AVIATION_API_BASE_URL}/flights/${flightId}`, {
      params: {
        key: AVIATION_API_KEY
      }
    });

    if (response.status !== 200) {
      throw new Error(`API returned status ${response.status}`);
    }

    return transformFlightData(response.data);
  } catch (error) {
    console.error('Error fetching flight details:', error);
    return null;
  }
}

/**
 * Fetch aircraft information by registration
 */
export async function fetchAircraft(registration: string): Promise<Aircraft | null> {
  try {
    const response = await axios.get(`${AVIATION_API_BASE_URL}/aircraftDatabase`, {
      params: {
        key: AVIATION_API_KEY,
        codeRegistration: registration
      }
    });

    if (response.status !== 200 || response.data.length === 0) {
      throw new Error(`Aircraft not found or API error`);
    }

    const aircraftData = response.data[0];
    
    return {
      id: 0, // This will be replaced by the storage system
      registration: aircraftData.registrationNumber || registration,
      type: aircraftData.icaoCode || aircraftData.modelName || 'Unknown',
      airline: aircraftData.airlineName || null,
      manufacturerSerialNumber: aircraftData.serialNumber || null,
      age: aircraftData.age || null,
      details: {
        engines: aircraftData.engines || null,
        engineType: aircraftData.engineType || null,
        firstFlight: aircraftData.firstFlight || null,
        icaoType: aircraftData.icaoCode || null,
        icaoClass: aircraftData.icaoCodeClass || null,
        range: aircraftData.range || null,
        ceiling: aircraftData.ceiling || null
      }
    };
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return null;
  }
}

/**
 * Transform API response to our LiveFlight format
 */
function transformFlightData(apiData: any): LiveFlight {
  return {
    id: apiData.hex || apiData.flight_id || String(Date.now()),
    callsign: apiData.callsign || apiData.flight.iataNumber || 'Unknown',
    flightNumber: apiData.flight?.iataNumber || apiData.flight?.icaoNumber || null,
    registration: apiData.registration || null,
    aircraftType: apiData.aircraft?.icaoCode || apiData.aircraft?.type || null,
    airline: {
      name: apiData.airline?.name || 'Unknown Airline',
      icao: apiData.airline?.icaoCode || null,
      iata: apiData.airline?.iataCode || null
    },
    departure: apiData.departure ? {
      icao: apiData.departure.icao || null,
      iata: apiData.departure.iata || null,
      name: apiData.departure.name || null,
      time: apiData.departure.scheduled || apiData.departure.actual || null
    } : undefined,
    arrival: apiData.arrival ? {
      icao: apiData.arrival.icao || null,
      iata: apiData.arrival.iata || null,
      name: apiData.arrival.name || null,
      time: apiData.arrival.scheduled || apiData.arrival.estimated || null
    } : undefined,
    position: {
      latitude: apiData.lat || apiData.latitude || 0,
      longitude: apiData.lng || apiData.longitude || 0,
      altitude: apiData.alt || apiData.altitude || 0,
      heading: apiData.dir || apiData.heading || 0,
      groundSpeed: apiData.speed || 0,
      verticalSpeed: apiData.verticalSpeed || 0,
      timestamp: apiData.timestamp || new Date().toISOString()
    },
    status: apiData.status || 'active',
    route: apiData.route || null,
    progress: apiData.progress || null,
    squawk: apiData.squawk || null
  };
}
