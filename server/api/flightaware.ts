import net from 'net';
import tls from 'tls';
import { LiveFlight, Aircraft, MapFilter } from '@shared/schema';
import { storage } from '../storage';
import { broadcastMessage } from '../webSocket';

// Get FlightAware credentials from environment variables
const FLIGHTAWARE_USERNAME = process.env.FLIGHTAWARE_USERNAME;
const FLIGHTAWARE_PASSWORD = process.env.FLIGHTAWARE_PASSWORD;

// Flag to use mock data for development
// Use REAL flight data with FlightAware credentials
// Only use mock data if credentials are not available or after max connection failures
const USE_MOCK_DATA = !FLIGHTAWARE_USERNAME || !FLIGHTAWARE_PASSWORD;
let FALLBACK_TO_MOCK = USE_MOCK_DATA;

// Helper variables for timing broadcasts
let lastBroadcastTime = 0;

function getLastBroadcastTime(): number {
  return lastBroadcastTime;
}

function setLastBroadcastTime(time: number): void {
  lastBroadcastTime = time;
}

// FlightAware Firehose connection details
const FIREHOSE_HOST = 'firehose.flightaware.com';
const FIREHOSE_PORT = 1501;

let socket: tls.TLSSocket | null = null;
let dataBuffer = '';
let flightCache = new Map<string, LiveFlight>();
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10; // Increased from 5 to improve reliability
const RECONNECT_DELAY = 5000; // 5 seconds

/**
 * Initialize connection to FlightAware Firehose
 */
export function initializeFlightAwareConnection() {
  // If using mock data, skip real connection
  if (USE_MOCK_DATA) {
    console.log('Using mock data for flight information - skipping FlightAware connection');
    isConnected = true; // Set connected state to true
    
    // Since we're using mock data, populate the cache with mock flights
    const mockFlights = generateMockFlights(50);
    flightCache = new Map();
    mockFlights.forEach(flight => {
      flightCache.set(flight.id, flight);
    });
    
    // Broadcast the mock data immediately
    broadcastMessage('flights', mockFlights);
    storage.cacheFlightData(mockFlights).catch(err => {
      console.error('Error caching mock flight data:', err);
    });
    
    return;
  }
  
  if (!FLIGHTAWARE_USERNAME || !FLIGHTAWARE_PASSWORD) {
    console.error('FlightAware credentials not found in environment variables');
    return;
  }

  console.log('Initializing FlightAware Firehose connection...');
  
  try {
    // Create TLS socket connection with improved options
    socket = tls.connect({
      host: FIREHOSE_HOST,
      port: FIREHOSE_PORT,
      rejectUnauthorized: true
    });
    
    // Set socket options after connection
    socket.setTimeout(30000); // 30 seconds timeout
    socket.setKeepAlive(true, 60000); // Enable TCP keep-alive with 60 seconds delay

    // Handle socket events
    socket.on('secureConnect', () => {
      console.log('Connected to FlightAware Firehose');
      isConnected = true;
      reconnectAttempts = 0;
      
      // Send authentication credentials
      if (socket) {
        socket.write(`live username ${FLIGHTAWARE_USERNAME} password ${FLIGHTAWARE_PASSWORD}\n`);
        
        // Subscribe to flight position updates
        socket.write('live all\n');
      }
    });

    socket.on('data', (data) => {
      try {
        const chunk = data.toString();
        dataBuffer += chunk;
        
        // Process complete lines
        const lines = dataBuffer.split('\n');
        dataBuffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          processFlightData(line);
        }
      } catch (error) {
        console.error('Error processing FlightAware data:', error);
      }
    });

    socket.on('error', (error) => {
      console.error('FlightAware connection error:', error);
      isConnected = false;
      attemptReconnect();
    });

    socket.on('close', () => {
      console.log('FlightAware connection closed');
      isConnected = false;
      attemptReconnect();
    });
    
    socket.on('timeout', () => {
      console.log('FlightAware connection timeout');
      isConnected = false;
      socket?.end();
      attemptReconnect();
    });
    
  } catch (error) {
    console.error('Failed to initialize FlightAware connection:', error);
    isConnected = false;
    attemptReconnect();
  }
}

/**
 * Attempt to reconnect to FlightAware
 */
function attemptReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`);
    
    // If we've failed to connect after max attempts, switch to mock data
    if (!USE_MOCK_DATA) {
      console.log('Switching to mock flight data after connection failures');
      
      // Generate and use mock flights
      const mockFlights = generateMockFlights(50);
      flightCache = new Map();
      mockFlights.forEach(flight => {
        flightCache.set(flight.id, flight);
      });
      
      // Broadcast the mock data immediately
      broadcastMessage('flights', mockFlights);
      storage.cacheFlightData(mockFlights).catch(err => {
        console.error('Error caching mock flight data:', err);
      });
    }
    
    return;
  }
  
  reconnectAttempts++;
  console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${RECONNECT_DELAY/1000} seconds...`);
  
  setTimeout(() => {
    initializeFlightAwareConnection();
  }, RECONNECT_DELAY);
}

/**
 * Process a line of data from FlightAware
 */
function processFlightData(line: string) {
  try {
    // Skip system messages and keep-alives
    if (line.startsWith('live msg') || line.startsWith('clock') || line.startsWith('auth')) {
      if (line.startsWith('auth ')) {
        const authResult = line.split(' ')[1];
        if (authResult === 'failed') {
          console.error('FlightAware authentication failed. Please check your credentials.');
        } else if (authResult === 'ok') {
          console.log('FlightAware authentication successful.');
        }
      }
      return;
    }

    // Parse the flight data
    const fields = line.split(' ');
    
    // Check if this is a position update
    if (fields[0] === 'pos' && fields.length >= 10) {
      const flight = parsePositionUpdate(fields);
      if (flight) {
        flightCache.set(flight.id, flight);
      }
    }
    // Check if this is a flight info update
    else if (fields[0] === 'flight' && fields.length >= 5) {
      updateFlightInfo(fields);
    }
    
    // Periodically broadcast updates and cache to storage
    const now = Date.now();
    if (now - getLastBroadcastTime() > 1000) { // Broadcast every 1 second for better real-time response
      setLastBroadcastTime(now);
      const flights = Array.from(flightCache.values());
      broadcastMessage('flights', flights);
      storage.cacheFlightData(flights).catch(err => {
        console.error('Error caching flight data:', err);
      });
    }
  } catch (error) {
    console.error('Error processing flight data line:', error, line);
  }
}

/**
 * Parse a position update message from FlightAware
 */
function parsePositionUpdate(fields: string[]): LiveFlight | null {
  try {
    // Format: pos [hexid] [lat] [lon] [altitude] [heading] [groundspeed] [update_type] [updated] [squawk]
    const id = fields[1];
    const latitude = parseFloat(fields[2]);
    const longitude = parseFloat(fields[3]);
    const altitude = parseInt(fields[4], 10);
    const heading = parseInt(fields[5], 10);
    const groundSpeed = parseInt(fields[6], 10);
    const timestamp = new Date(parseInt(fields[8], 10) * 1000).toISOString();
    const squawk = fields[9] !== 'none' ? fields[9] : undefined;
    
    // Get existing flight data or create new
    const existingFlight = flightCache.get(id);
    
    // Create or update the flight object
    const flight: LiveFlight = {
      id,
      callsign: existingFlight?.callsign || id,
      flightNumber: existingFlight?.flightNumber,
      registration: existingFlight?.registration,
      aircraftType: existingFlight?.aircraftType,
      airline: existingFlight?.airline || {
        name: 'Unknown Airline',
        icao: '',
      },
      departure: existingFlight?.departure,
      arrival: existingFlight?.arrival,
      position: {
        latitude,
        longitude,
        altitude,
        heading,
        groundSpeed,
        verticalSpeed: existingFlight?.position?.verticalSpeed || 0,
        timestamp
      },
      status: existingFlight?.status || 'active',
      route: existingFlight?.route,
      progress: existingFlight?.progress,
      squawk
    };
    
    return flight;
  } catch (error) {
    console.error('Error parsing position update:', error);
    return null;
  }
}

/**
 * Update flight information based on a flight info message
 */
function updateFlightInfo(fields: string[]) {
  try {
    // Format: flight [hexid] [ident/callsign] [origin] [destination]
    const id = fields[1];
    const callsign = fields[2];
    const origin = fields[3] !== 'none' ? fields[3] : undefined;
    const destination = fields[4] !== 'none' ? fields[4] : undefined;
    
    // Get existing flight data
    const existingFlight = flightCache.get(id);
    if (!existingFlight) return;
    
    // Update flight with new info
    existingFlight.callsign = callsign;
    existingFlight.flightNumber = callsign;
    
    if (origin) {
      existingFlight.departure = {
        icao: origin,
        iata: undefined,
        name: undefined,
        time: undefined
      };
    }
    
    if (destination) {
      existingFlight.arrival = {
        icao: destination,
        iata: undefined,
        name: undefined,
        time: undefined
      };
    }
    
    // Update the cache
    flightCache.set(id, existingFlight);
  } catch (error) {
    console.error('Error updating flight info:', error);
  }
}

/**
 * Generate mock flight data for development
 */
function generateMockFlights(count: number = 30): LiveFlight[] {
  console.log(`Generating ${count} mock flights for development`);
  const airlines = [
    { name: 'Delta Air Lines', icao: 'DAL', iata: 'DL' },
    { name: 'American Airlines', icao: 'AAL', iata: 'AA' },
    { name: 'United Airlines', icao: 'UAL', iata: 'UA' },
    { name: 'Southwest Airlines', icao: 'SWA', iata: 'WN' },
    { name: 'Alaska Airlines', icao: 'ASA', iata: 'AS' },
    { name: 'JetBlue Airways', icao: 'JBU', iata: 'B6' },
    { name: 'Air Canada', icao: 'ACA', iata: 'AC' },
    { name: 'British Airways', icao: 'BAW', iata: 'BA' },
    { name: 'Lufthansa', icao: 'DLH', iata: 'LH' },
    { name: 'FedEx Express', icao: 'FDX', iata: 'FX' }
  ];
  
  const aircraftTypes = ['B738', 'A320', 'B77W', 'E170', 'A319', 'B763', 'B752', 'CRJ9', 'A321', 'B737'];
  
  const airports = [
    { icao: 'KATL', iata: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport' },
    { icao: 'KLAX', iata: 'LAX', name: 'Los Angeles International Airport' },
    { icao: 'KORD', iata: 'ORD', name: "O'Hare International Airport" },
    { icao: 'KDFW', iata: 'DFW', name: 'Dallas/Fort Worth International Airport' },
    { icao: 'KDEN', iata: 'DEN', name: 'Denver International Airport' },
    { icao: 'KJFK', iata: 'JFK', name: 'John F. Kennedy International Airport' },
    { icao: 'KSFO', iata: 'SFO', name: 'San Francisco International Airport' },
    { icao: 'KSEA', iata: 'SEA', name: 'Seattle-Tacoma International Airport' },
    { icao: 'KMIA', iata: 'MIA', name: 'Miami International Airport' },
    { icao: 'KLAS', iata: 'LAS', name: 'McCarran International Airport' }
  ];
  
  const statuses: Array<'scheduled' | 'active' | 'landed' | 'cancelled' | 'diverted' | 'delayed'> = 
    ['active', 'active', 'active', 'active', 'delayed', 'scheduled', 'landed'];
  
  const flights: LiveFlight[] = [];
  
  // Define US flight region boundaries
  const usMinLat = 24.0; // Southern tip of Florida
  const usMaxLat = 49.0; // Northern border with Canada
  const usMinLon = -125.0; // West Coast
  const usMaxLon = -66.0; // East Coast
  
  for (let i = 0; i < count; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const aircraftType = aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];
    const depAirport = airports[Math.floor(Math.random() * airports.length)];
    
    // Make sure arrival is different from departure
    let arrIndex = Math.floor(Math.random() * airports.length);
    while (airports[arrIndex].icao === depAirport.icao) {
      arrIndex = Math.floor(Math.random() * airports.length);
    }
    const arrAirport = airports[arrIndex];
    
    // Generate flight number
    const flightNumber = `${airline.iata}${Math.floor(Math.random() * 1000) + 1000}`;
    const callsign = `${airline.icao}${flightNumber.substring(2)}`;
    
    // Generate random position within US flight region
    const latitude = usMinLat + Math.random() * (usMaxLat - usMinLat);
    const longitude = usMinLon + Math.random() * (usMaxLon - usMinLon);
    
    // Generate random altitude between 10000 and 40000 feet
    const altitude = Math.floor(Math.random() * 30000) + 10000;
    
    // Generate random heading (0-359 degrees)
    const heading = Math.floor(Math.random() * 360);
    
    // Generate random ground speed (300-550 knots)
    const groundSpeed = Math.floor(Math.random() * 250) + 300;
    
    // Status weighted towards active
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Generate registration (N + numbers for US aircraft)
    const registration = `N${Math.floor(Math.random() * 9000) + 1000}`;
    
    // Generate timestamp
    const timestamp = new Date().toISOString();
    
    // Generate random progress (0-100%)
    const progress = Math.floor(Math.random() * 101);
    
    flights.push({
      id: `MOCK${i}`,
      callsign,
      flightNumber,
      registration,
      aircraftType,
      airline: {
        name: airline.name,
        icao: airline.icao,
        iata: airline.iata
      },
      departure: {
        icao: depAirport.icao,
        iata: depAirport.iata,
        name: depAirport.name,
        time: new Date(Date.now() - Math.random() * 3600000).toISOString() // Random time in the last hour
      },
      arrival: {
        icao: arrAirport.icao,
        iata: arrAirport.iata,
        name: arrAirport.name,
        time: new Date(Date.now() + Math.random() * 7200000).toISOString() // Random time in next 2 hours
      },
      position: {
        latitude,
        longitude,
        altitude,
        heading,
        groundSpeed,
        verticalSpeed: 0,
        timestamp
      },
      status,
      route: `${depAirport.icao} DCT ${arrAirport.icao}`,
      progress,
      squawk: `${Math.floor(Math.random() * 8999) + 1000}` // 4-digit squawk code
    });
  }
  
  // Add a few sample cargo flights
  for (let i = 0; i < 5; i++) {
    const cargoAirlines = [
      { name: 'FedEx Express', icao: 'FDX', iata: 'FX' },
      { name: 'UPS Airlines', icao: 'UPS', iata: '5X' },
      { name: 'Atlas Air', icao: 'GTI', iata: '5Y' },
      { name: 'Cargolux', icao: 'CLX', iata: 'CV' },
      { name: 'ABX Air', icao: 'ABX', iata: 'GB' }
    ];
    
    const airline = cargoAirlines[Math.floor(Math.random() * cargoAirlines.length)];
    const aircraftType = ['B744', 'B748', 'B763', 'B77L', 'MD11'][Math.floor(Math.random() * 5)];
    const depAirport = airports[Math.floor(Math.random() * airports.length)];
    let arrIndex = Math.floor(Math.random() * airports.length);
    while (airports[arrIndex].icao === depAirport.icao) {
      arrIndex = Math.floor(Math.random() * airports.length);
    }
    const arrAirport = airports[arrIndex];
    
    // Generate cargo flight number
    const flightNumber = `${airline.iata}${Math.floor(Math.random() * 8000) + 1000}`;
    const callsign = `${airline.icao}${flightNumber.substring(2)}`;
    
    flights.push({
      id: `CARGO${i}`,
      callsign,
      flightNumber,
      registration: `N${Math.floor(Math.random() * 9000) + 1000}`,
      aircraftType,
      airline: {
        name: airline.name,
        icao: airline.icao,
        iata: airline.iata
      },
      departure: {
        icao: depAirport.icao,
        iata: depAirport.iata,
        name: depAirport.name,
        time: new Date(Date.now() - Math.random() * 3600000).toISOString()
      },
      arrival: {
        icao: arrAirport.icao,
        iata: arrAirport.iata,
        name: arrAirport.name,
        time: new Date(Date.now() + Math.random() * 7200000).toISOString()
      },
      position: {
        latitude: usMinLat + Math.random() * (usMaxLat - usMinLat),
        longitude: usMinLon + Math.random() * (usMaxLon - usMinLon),
        altitude: Math.floor(Math.random() * 30000) + 10000,
        heading: Math.floor(Math.random() * 360),
        groundSpeed: Math.floor(Math.random() * 250) + 300,
        verticalSpeed: 0,
        timestamp: new Date().toISOString()
      },
      status: 'active',
      route: `${depAirport.icao} DCT ${arrAirport.icao}`,
      progress: Math.floor(Math.random() * 101),
      squawk: `${Math.floor(Math.random() * 8999) + 1000}`
    });
  }
  
  // Add a few private/general aviation flights
  for (let i = 0; i < 5; i++) {
    const aircraftType = ['C172', 'C208', 'PA28', 'BE20', 'BE58'][Math.floor(Math.random() * 5)];
    const depAirport = airports[Math.floor(Math.random() * airports.length)];
    let arrIndex = Math.floor(Math.random() * airports.length);
    while (airports[arrIndex].icao === depAirport.icao) {
      arrIndex = Math.floor(Math.random() * airports.length);
    }
    const arrAirport = airports[arrIndex];
    
    // Generate typical N-number for US private aircraft
    const registration = `N${Math.floor(Math.random() * 9000) + 1000}`;
    const callsign = registration;
    
    flights.push({
      id: `PVT${i}`,
      callsign,
      registration,
      aircraftType,
      airline: undefined,
      departure: {
        icao: depAirport.icao,
        iata: depAirport.iata,
        name: depAirport.name,
        time: new Date(Date.now() - Math.random() * 3600000).toISOString()
      },
      arrival: {
        icao: arrAirport.icao,
        iata: arrAirport.iata,
        name: arrAirport.name,
        time: new Date(Date.now() + Math.random() * 7200000).toISOString()
      },
      position: {
        latitude: usMinLat + Math.random() * (usMaxLat - usMinLat),
        longitude: usMinLon + Math.random() * (usMaxLon - usMinLon),
        altitude: Math.floor(Math.random() * 10000) + 3000, // Lower altitudes for GA
        heading: Math.floor(Math.random() * 360),
        groundSpeed: Math.floor(Math.random() * 100) + 100, // Slower speeds for GA
        verticalSpeed: 0,
        timestamp: new Date().toISOString()
      },
      status: 'active',
      route: `${depAirport.icao} DCT ${arrAirport.icao}`,
      progress: Math.floor(Math.random() * 101),
      squawk: `${Math.floor(Math.random() * 8999) + 1000}`
    });
  }
  
  return flights;
}

/**
 * Fetch flights based on the provided filter type (from cache or mock data)
 */
export async function fetchFlights(filterType: MapFilter['type']): Promise<LiveFlight[]> {
  try {
    console.log(`Fetching flights (${flightCache.size} in cache) with filter: ${filterType}`);
    
    // If using mock data, generate and return mock flights
    if (USE_MOCK_DATA) {
      const mockFlights = generateMockFlights(40);
      
      // Cache the mock flights
      mockFlights.forEach(flight => {
        flightCache.set(flight.id, flight);
      });
      
      // Cache to storage
      await storage.cacheFlightData(mockFlights);
      
      // Apply filters
      let filteredFlights = mockFlights;
      if (filterType !== 'all') {
        // Filter flights based on type
        filteredFlights = filteredFlights.filter(flight => {
          if (filterType === 'commercial') {
            // Commercial flights usually have airline info and are operated by commercial carriers
            return flight.airline?.name != null;
          } else if (filterType === 'private') {
            // Private flights often have no airline info or registration as callsign
            return flight.airline?.name == null || flight.callsign === flight.registration;
          } else if (filterType === 'cargo') {
            // Cargo flights might be identified by specific airlines or callsigns
            const cargoAirlines = ['FDX', 'UPS', 'ABX', 'GTI', 'CLX'];
            return cargoAirlines.some(code => flight.callsign?.startsWith(code)) || 
                   flight.airline?.name?.toLowerCase().includes('cargo');
          }
          return true;
        });
      }
      
      return filteredFlights;
    }
    
    // Otherwise use real FlightAware data
    // If not connected to FlightAware, try to connect
    if (!isConnected) {
      initializeFlightAwareConnection();
      // Return cached flights in the meantime
      return await storage.getCachedFlights();
    }
    
    // Get all flights from cache
    let flights = Array.from(flightCache.values());
    
    // Apply filters based on filterType
    if (filterType !== 'all') {
      // Filter flights based on type
      flights = flights.filter(flight => {
        if (filterType === 'commercial') {
          // Commercial flights usually have airline info and are operated by commercial carriers
          return flight.airline?.name != null;
        } else if (filterType === 'private') {
          // Private flights often have no airline info or registration as callsign
          return flight.airline?.name == null || flight.callsign === flight.registration;
        } else if (filterType === 'cargo') {
          // Cargo flights might be identified by specific airlines or callsigns
          const cargoAirlines = ['FDX', 'UPS', 'ABX', 'GTI', 'CLX'];
          return cargoAirlines.some(code => flight.callsign?.startsWith(code)) || 
                 flight.airline?.name?.toLowerCase().includes('cargo');
        }
        return true;
      });
    }
    
    return flights;
  } catch (error) {
    console.error('Error fetching flights:', error);
    return [];
  }
}

/**
 * Fetch details for a specific flight by ID (from cache)
 */
export async function fetchFlightDetails(flightId: string): Promise<LiveFlight | null> {
  try {
    return flightCache.get(flightId) || null;
  } catch (error) {
    console.error('Error fetching flight details:', error);
    return null;
  }
}

/**
 * Fetch aircraft information by registration
 * Note: FlightAware Firehose doesn't provide detailed aircraft info,
 * so we would need to use another API or database for this.
 */
export async function fetchAircraft(registration: string): Promise<Aircraft | null> {
  try {
    // Check if we already have this aircraft in our database
    const existingAircraft = await storage.getAircraftByRegistration(registration);
    if (existingAircraft) {
      return existingAircraft;
    }
    
    // For now, return a basic aircraft record
    // In a production app, you would connect to an aircraft database API
    return {
      id: 0,
      registration,
      type: 'Unknown',
      airline: null, // Using null because the schema allows it
      manufacturerSerialNumber: null,
      age: null,
      details: null
    };
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return null;
  }
}

/**
 * Close the FlightAware connection
 */
export function closeFlightAwareConnection() {
  if (socket) {
    socket.end();
    socket = null;
  }
  isConnected = false;
  console.log('FlightAware connection closed');
}