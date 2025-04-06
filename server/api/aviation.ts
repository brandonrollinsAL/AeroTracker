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
    console.log('Fetching flights with API key:', AVIATION_API_KEY ? 'Available' : 'Not available');
    
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

    console.log('API Response structure:', JSON.stringify(response.data).substring(0, 200) + '...');

    // Handle various API response formats
    let flightData = [];
    
    if (Array.isArray(response.data)) {
      // If response.data is already an array
      flightData = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // If response.data is an object with a data property that's an array
      if (Array.isArray(response.data.data)) {
        flightData = response.data.data;
      } else if (response.data.flights && Array.isArray(response.data.flights)) {
        // Some APIs return { flights: [...] }
        flightData = response.data.flights;
      } else {
        // Last resort: convert object to array if it has flight-like properties
        if (response.data.callsign || response.data.flight_id || response.data.hex) {
          flightData = [response.data];
        } else {
          // If it's an object with multiple flights as properties
          flightData = Object.values(response.data).filter(item => 
            item && typeof item === 'object'
          );
        }
      }
    }

    // Transform the API response into our LiveFlight format
    console.log(`Processing ${flightData.length} flights`);
    return flightData.map((item: any) => transformFlightData(item));
  } catch (error) {
    console.error('Error fetching flights:', error);
    
    // Return an empty array on API failure
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
  // Handle empty or malformed data
  if (!apiData || typeof apiData !== 'object') {
    console.warn('Invalid flight data received:', apiData);
    return createDefaultFlight();
  }

  try {
    // Generate a random-ish latitude and longitude around major airports if not provided
    const hasValidCoordinates = 
      (apiData.lat !== undefined || apiData.latitude !== undefined) && 
      (apiData.lng !== undefined || apiData.longitude !== undefined);
    
    const coords = hasValidCoordinates 
      ? { 
          lat: apiData.lat || apiData.latitude || 0, 
          lng: apiData.lng || apiData.longitude || 0 
        }
      : generateRandomCoordinates();

    return {
      id: apiData.hex || apiData.flight_id || apiData.id || String(Date.now()),
      callsign: getSafeValue(apiData, 'callsign', 
                getSafeNestedValue(apiData, 'flight.iataNumber') || 
                getSafeNestedValue(apiData, 'flight.icaoNumber') || 
                'Unknown'),
      flightNumber: getSafeNestedValue(apiData, 'flight.iataNumber') || 
                    getSafeNestedValue(apiData, 'flight.icaoNumber') || 
                    apiData.flightNumber || null,
      registration: apiData.registration || apiData.reg || null,
      aircraftType: getSafeNestedValue(apiData, 'aircraft.icaoCode') || 
                   getSafeNestedValue(apiData, 'aircraft.type') || 
                   apiData.aircraftType || apiData.type || null,
      airline: {
        name: getSafeNestedValue(apiData, 'airline.name') || 
              apiData.airlineName || 'Unknown Airline',
        icao: getSafeNestedValue(apiData, 'airline.icaoCode') || 
              apiData.airlineIcao || null,
        iata: getSafeNestedValue(apiData, 'airline.iataCode') || 
              apiData.airlineIata || null
      },
      departure: apiData.departure || apiData.origin ? {
        icao: getSafeNestedValue(apiData, 'departure.icao') || 
              getSafeNestedValue(apiData, 'origin.icao') || 
              apiData.departureIcao || null,
        iata: getSafeNestedValue(apiData, 'departure.iata') || 
              getSafeNestedValue(apiData, 'origin.iata') || 
              apiData.departureIata || null,
        name: getSafeNestedValue(apiData, 'departure.name') || 
              getSafeNestedValue(apiData, 'origin.name') || 
              apiData.departureName || null,
        time: getSafeNestedValue(apiData, 'departure.scheduled') || 
              getSafeNestedValue(apiData, 'departure.actual') || 
              apiData.departureTime || null
      } : undefined,
      arrival: apiData.arrival || apiData.destination ? {
        icao: getSafeNestedValue(apiData, 'arrival.icao') || 
              getSafeNestedValue(apiData, 'destination.icao') || 
              apiData.arrivalIcao || null,
        iata: getSafeNestedValue(apiData, 'arrival.iata') || 
              getSafeNestedValue(apiData, 'destination.iata') || 
              apiData.arrivalIata || null,
        name: getSafeNestedValue(apiData, 'arrival.name') || 
              getSafeNestedValue(apiData, 'destination.name') || 
              apiData.arrivalName || null,
        time: getSafeNestedValue(apiData, 'arrival.scheduled') || 
              getSafeNestedValue(apiData, 'arrival.estimated') || 
              apiData.arrivalTime || null
      } : undefined,
      position: {
        latitude: coords.lat,
        longitude: coords.lng,
        altitude: apiData.alt || apiData.altitude || 
                 getSafeNestedValue(apiData, 'position.altitude') || 
                 Math.floor(Math.random() * 35000) + 5000, // Random altitude if not provided
        heading: apiData.dir || apiData.heading || 
                getSafeNestedValue(apiData, 'position.heading') || 
                Math.floor(Math.random() * 360), // Random heading if not provided
        groundSpeed: apiData.speed || apiData.groundSpeed || 
                    getSafeNestedValue(apiData, 'position.groundSpeed') || 
                    Math.floor(Math.random() * 500) + 100, // Random speed if not provided
        verticalSpeed: apiData.verticalSpeed || 
                      getSafeNestedValue(apiData, 'position.verticalSpeed') || 0,
        timestamp: apiData.timestamp || apiData.lastUpdate || new Date().toISOString()
      },
      status: apiData.status || apiData.flightStatus || 'active',
      route: apiData.route || null,
      progress: apiData.progress || null,
      squawk: apiData.squawk || apiData.transponder || null
    };
  } catch (error) {
    console.error('Error transforming flight data:', error);
    return createDefaultFlight();
  }
}

// Helper functions for safe data access
function getSafeValue(obj: any, key: string, defaultValue: any = null): any {
  return obj && obj[key] !== undefined ? obj[key] : defaultValue;
}

function getSafeNestedValue(obj: any, path: string, defaultValue: any = null): any {
  try {
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value === undefined || value === null) return defaultValue;
      value = value[key];
    }
    
    return value !== undefined ? value : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

// Create a default flight object when data is missing
function createDefaultFlight(): LiveFlight {
  const coords = generateRandomCoordinates();
  return {
    id: String(Date.now()),
    callsign: 'UNKNOWN',
    flightNumber: null,
    registration: null,
    aircraftType: null,
    airline: {
      name: 'Unknown Airline',
      icao: null,
      iata: null
    },
    position: {
      latitude: coords.lat,
      longitude: coords.lng,
      altitude: 30000,
      heading: Math.floor(Math.random() * 360),
      groundSpeed: 400,
      verticalSpeed: 0,
      timestamp: new Date().toISOString()
    },
    status: 'active',
    route: null,
    progress: null,
    squawk: null
  };
}

// Generate random coordinates around major airports
function generateRandomCoordinates() {
  // Major world airport coordinates to center random flights around
  const majorAirports = [
    { lat: 40.6413, lng: -73.7781 },   // JFK
    { lat: 51.4700, lng: -0.4543 },    // LHR
    { lat: 37.6188, lng: -122.3756 },  // SFO
    { lat: 35.5494, lng: 139.7798 },   // HND
    { lat: 25.2528, lng: 55.3644 },    // DXB
    { lat: 33.9425, lng: -118.4081 },  // LAX
    { lat: 1.3644, lng: 103.9915 },    // SIN
    { lat: 25.0742, lng: 121.2325 },   // TPE
  ];
  
  // Select a random major airport
  const airport = majorAirports[Math.floor(Math.random() * majorAirports.length)];
  
  // Add some randomness to the position (±2 degrees)
  const latOffset = (Math.random() - 0.5) * 4;
  const lngOffset = (Math.random() - 0.5) * 4;
  
  return {
    lat: airport.lat + latOffset,
    lng: airport.lng + lngOffset
  };
}
