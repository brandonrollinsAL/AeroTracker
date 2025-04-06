import net from 'net';
import tls from 'tls';
import { LiveFlight, Aircraft, MapFilter } from '@shared/schema';
import { storage } from '../storage';
import { broadcastMessage } from '../webSocket';

// Get FlightAware credentials from environment variables
const FLIGHTAWARE_USERNAME = process.env.FLIGHTAWARE_USERNAME;
const FLIGHTAWARE_PASSWORD = process.env.FLIGHTAWARE_PASSWORD;

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
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000; // 5 seconds

/**
 * Initialize connection to FlightAware Firehose
 */
export function initializeFlightAwareConnection() {
  if (!FLIGHTAWARE_USERNAME || !FLIGHTAWARE_PASSWORD) {
    console.error('FlightAware credentials not found in environment variables');
    return;
  }

  console.log('Initializing FlightAware Firehose connection...');
  
  try {
    // Create TLS socket connection
    socket = tls.connect({
      host: FIREHOSE_HOST,
      port: FIREHOSE_PORT,
      rejectUnauthorized: true
    });

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
    if (now - getLastBroadcastTime() > 5000) { // Broadcast every 5 seconds
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
 * Fetch flights based on the provided filter type (from cache)
 */
export async function fetchFlights(filterType: MapFilter['type']): Promise<LiveFlight[]> {
  try {
    console.log(`Fetching flights (${flightCache.size} in cache) with filter: ${filterType}`);
    
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
      flights = flights.filter(flight => {
        if (filterType === 'commercial') {
          // Commercial flights typically have airline codes in callsign
          return /^[A-Z]{2,3}\d+$/.test(flight.callsign);
        } else if (filterType === 'private') {
          // Private flights typically have N, G, or other registration prefixes
          return /^[A-Z]{1}[A-Z0-9]{1,5}$/.test(flight.callsign);
        } else if (filterType === 'cargo') {
          // Cargo airlines often have specific codes like FDX (FedEx), UPS, etc.
          const cargoAirlines = ['FDX', 'UPS', 'ABX', 'GTI', 'ATN', 'CKS', 'CLX'];
          return cargoAirlines.some(code => flight.callsign.startsWith(code));
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
      airline: null,
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