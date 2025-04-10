import net from 'net';
import tls from 'tls';
import { LiveFlight, Aircraft, MapFilter } from '@shared/schema';
import { storage } from '../storage';
import { broadcastMessage } from '../webSocket';

// Get FlightAware credentials from environment variables
const FLIGHTAWARE_USERNAME = process.env.FLIGHTAWARE_USERNAME;
const FLIGHTAWARE_PASSWORD = process.env.FLIGHTAWARE_PASSWORD;

// Always use REAL flight data with FlightAware credentials
// Never use mock data even if credentials are not available
let USE_MOCK_DATA = false; // Force to always use real data, never use mock
let FALLBACK_TO_MOCK = false; // Never fall back to mock data

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
const MAX_RECONNECT_ATTEMPTS = 30; // Increased for better resilience
const RECONNECT_DELAY = 5000; // Base reconnect delay in milliseconds

// Track connection phases for better debugging
enum ConnectionPhase {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  AUTHENTICATING = 'authenticating',
  AUTHENTICATED = 'authenticated',
  SUBSCRIBING = 'subscribing',
  SUBSCRIBED = 'subscribed'
}

let connectionPhase: ConnectionPhase = ConnectionPhase.DISCONNECTED;
let lastConnectionAttempt = 0;
let connectionRetryJitter = () => Math.floor(Math.random() * 1000); // Add randomness to reconnect delay

/**
 * Initialize connection to FlightAware Firehose
 */
// Connection throttling manager
let isConnectionThrottled = false;
let throttleTimer: NodeJS.Timeout | null = null;

function startConnectionThrottling(duration: number): void {
  isConnectionThrottled = true;
  
  // Clear any existing throttle timer
  if (throttleTimer) {
    clearTimeout(throttleTimer);
  }
  
  console.log(`Starting connection throttling for ${duration/1000} seconds`);
  
  // Set a timer to release the throttle
  throttleTimer = setTimeout(() => {
    console.log('Connection throttling period ended');
    isConnectionThrottled = false;
    reconnectAttempts = 0;
    throttleTimer = null;
  }, duration);
}

export function initializeFlightAwareConnection() {
  // Don't attempt to connect if we're in throttling mode
  if (isConnectionThrottled) {
    console.log('Connection attempt blocked by throttling');
    return;
  }
  
  // Track connection attempts for throttling
  lastConnectionAttempt = Date.now();
  connectionPhase = ConnectionPhase.CONNECTING;
  
  // Ensure mock data is never used
  USE_MOCK_DATA = false;
  FALLBACK_TO_MOCK = false;
  
  // Verify FlightAware credentials
  if (!FLIGHTAWARE_USERNAME || !FLIGHTAWARE_PASSWORD) {
    console.error('⚠️ FlightAware credentials not found in environment variables');
    
    // Send a clear error message to clients
    broadcastMessage('error', {
      message: 'FlightAware credentials are missing. Please provide valid API credentials in your environment variables.',
      code: 'FLIGHTAWARE_MISSING_CREDENTIALS'
    });
    
    // Don't attempt to connect without credentials
    return;
  }
  
  // Validate that credentials appear to be in the correct format (basic check)
  if (FLIGHTAWARE_USERNAME.length < 3 || FLIGHTAWARE_PASSWORD.length < 4) {
    console.error('⚠️ FlightAware credentials appear to be invalid (too short)');
    
    broadcastMessage('error', {
      message: 'FlightAware credentials appear to be invalid. Please check your API credentials.',
      code: 'FLIGHTAWARE_INVALID_CREDENTIALS'
    });
    
    // Still attempt to connect, but warn about potential issues
  }

  console.log('Initializing FlightAware Firehose connection...');
  
  try {
    // Create TLS socket connection with options optimized for FlightAware Firehose
    console.log('Creating TLS socket to FlightAware Firehose...');
    socket = tls.connect({
      host: FIREHOSE_HOST,
      port: FIREHOSE_PORT,
      rejectUnauthorized: false,      // Allow self-signed certificates
      servername: FIREHOSE_HOST,      // Set Server Name Indication (SNI)
      minVersion: 'TLSv1.2',          // Only use TLS 1.2+
      enableTrace: true,              // Enable tracking of TLS negotiation
      requestCert: true               // Request a certificate from server
    });
    
    // Set socket options after connection for reliability
    socket.setTimeout(120000);           // 120 seconds timeout (increased for greater reliability)
    socket.setKeepAlive(true, 15000);    // Enable TCP keep-alive with 15 seconds delay
    socket.setNoDelay(true);             // Disable Nagle's algorithm for smaller packets

    // Handle socket events
    socket.on('secureConnect', () => {
      console.log('Connected to FlightAware Firehose');
      console.log(`Using credentials - Username: ${FLIGHTAWARE_USERNAME ? FLIGHTAWARE_USERNAME.substring(0, 3) + '...' : 'undefined'}, Password: ${FLIGHTAWARE_PASSWORD ? '*****' : 'undefined'}`);
      isConnected = true;
      reconnectAttempts = 0;
      
      // Send authentication credentials in both formats (JSON and traditional)
      if (socket) {
        // Try traditional format first
        const authCommand = `live username ${FLIGHTAWARE_USERNAME} password ${FLIGHTAWARE_PASSWORD}\n`;
        console.log('Sending authentication command to FlightAware...');
        socket.write(authCommand);
        
        // Also try JSON format auth after a small delay
        setTimeout(() => {
          if (socket && socket.writable) {
            const jsonAuthCommand = JSON.stringify({
              type: "auth",
              username: FLIGHTAWARE_USERNAME,
              password: FLIGHTAWARE_PASSWORD
            }) + "\n";
            console.log('Sending JSON authentication command to FlightAware...');
            socket.write(jsonAuthCommand);
          }
        }, 500);
        
        // Subscribe to flight position updates after a small delay to ensure auth is processed
        setTimeout(() => {
          console.log('Sending subscription commands for various data types');
          if (socket && socket.writable) {
            // Try both formats - traditional and JSON
            socket.write('live all\n');
            
            setTimeout(() => {
              if (socket && socket.writable) {
                const jsonSubscribeAll = JSON.stringify({
                  type: "subscribe",
                  channel: "all"
                }) + "\n";
                socket.write(jsonSubscribeAll);
              }
            }, 500);
            
            // Add a 1 second delay between commands
            setTimeout(() => {
              console.log('Sending additional subscription commands');
              if (socket && socket.writable) {
                // Try both formats for position updates
                socket.write('live position_all\n'); // Traditional format
                
                setTimeout(() => {
                  if (socket && socket.writable) {
                    const jsonSubscribePositions = JSON.stringify({
                      type: "subscribe",
                      channel: "position_all"
                    }) + "\n";
                    socket.write(jsonSubscribePositions);
                  }
                }, 500);
                
                // Try both formats for airborne aircraft
                setTimeout(() => {
                  if (socket && socket.writable) {
                    socket.write('live airborne_all\n'); // Traditional format
                    
                    setTimeout(() => {
                      if (socket && socket.writable) {
                        const jsonSubscribeAirborne = JSON.stringify({
                          type: "subscribe",
                          channel: "airborne_all"
                        }) + "\n";
                        socket.write(jsonSubscribeAirborne);
                      }
                    }, 500);
                  }
                }, 1000);
              }
            }, 2000);
          } else {
            console.error('Socket is null or not writable when trying to send subscription command');
          }
        }, 3000);
      }
    });

    socket.on('data', (data) => {
      try {
        const chunk = data.toString();
        
        // Add data to buffer
        dataBuffer += chunk;
        
        // Log received data for debugging
        if (chunk.trim()) {
          console.log('🔶 Received data from FlightAware (length:', chunk.length, '):');
          
          // Check for JSON format error responses or auth responses first
          if (chunk.includes('"type":"error"') || chunk.includes('"type":"auth"') || 
              chunk.includes('auth ') || chunk.includes('error')) {
            
            console.log('==========================================');
            console.log(chunk);
            console.log('==========================================');
            
            // Try to parse as JSON first
            let isJsonError = false;
            try {
              // Look for complete JSON objects in the chunk
              const jsonMatches = chunk.match(/(\{.*?\})/g);
              if (jsonMatches) {
                for (const jsonStr of jsonMatches) {
                  try {
                    const jsonObj = JSON.parse(jsonStr);
                    
                    // Handle error response
                    if (jsonObj.type === "error") {
                      isJsonError = true;
                      console.error(`❌ FlightAware API error: ${jsonObj.error_msg}`);
                      
                      // Handle connection limit exceeded
                      if (jsonObj.error_msg && jsonObj.error_msg.includes("Maximum simultaneous connection")) {
                        console.error('CONNECTION LIMIT EXCEEDED - Activating connection throttling');
                        
                        // Close the current connection properly
                        if (socket) {
                          try {
                            socket.removeAllListeners();
                            socket.end();
                            socket.destroy();
                          } catch (e) {
                            console.error('Error while closing socket:', e);
                          }
                          socket = null;
                        }
                        
                        // Use the throttling manager to prevent excessive connection attempts
                        const waitTime = 180000 + Math.floor(Math.random() * 60000); // 3-4 minutes
                        
                        // Notify clients about the throttling
                        broadcastMessage('connectionStatus', {
                          status: 'throttled',
                          message: 'FlightAware connection throttled due to connection limits. Will automatically reconnect when conditions allow.',
                          reconnectIn: waitTime
                        });
                        
                        // Start the throttling period
                        startConnectionThrottling(waitTime);
                        
                        // Schedule a single reconnect attempt after the throttling period
                        setTimeout(() => {
                          console.log('Throttling period completed, attempting reconnection');
                          reconnectAttempts = 0; // Reset attempts counter
                          initializeFlightAwareConnection();
                        }, waitTime + 1000); // Add 1 second buffer after throttling ends
                        
                        isConnected = false;
                        connectionPhase = ConnectionPhase.DISCONNECTED;
                        return;
                      }
                    }
                    
                    // Handle auth response
                    if (jsonObj.type === "auth") {
                      console.log(`🔑 FlightAware JSON auth response: ${JSON.stringify(jsonObj)}`);
                      
                      if (jsonObj.result === "failed") {
                        console.error('❌ FlightAware authentication failed. Please check your credentials.');
                        broadcastMessage('error', {
                          message: 'FlightAware authentication failed. Please update your API credentials.',
                          code: 'FLIGHTAWARE_AUTH_FAILED'
                        });
                        
                        // Properly close the connection on auth failure to trigger reconnect
                        socket?.end();
                        return;
                      } else if (jsonObj.result === "ok") {
                        console.log('✅ FlightAware JSON authentication successful!');
                        // Send a heartbeat command to keep connection alive
                        if (socket && socket.writable) {
                          const keepAliveJson = JSON.stringify({
                            type: "keepalive",
                            interval: 30
                          }) + "\n";
                          socket.write(keepAliveJson);
                        }
                      }
                    }
                  } catch (innerError) {
                    // Individual JSON parsing failed, continue to next match
                    console.log(`Invalid JSON in match: ${jsonStr}`);
                  }
                }
              }
            } catch (jsonError) {
              console.log('Not a JSON error/auth message');
            }
            
            // If not handled as JSON, check for traditional format auth response
            if (!isJsonError && chunk.includes('auth ')) {
              const authLine = chunk.split('\n').find((line: string) => line.startsWith('auth '));
              if (authLine) {
                const authParts = authLine.split(' ');
                if (authParts.length >= 2) {
                  const authResult = authParts[1];
                  console.log(`🔑 FlightAware traditional auth response: "${authLine}"`);
                  
                  if (authResult === 'failed') {
                    console.error('❌ FlightAware authentication failed. Please check your credentials.');
                    broadcastMessage('error', {
                      message: 'FlightAware authentication failed. Please update your API credentials.',
                      code: 'FLIGHTAWARE_AUTH_FAILED'
                    });
                    
                    // Properly close the connection on auth failure
                    socket?.end();
                    return;
                  } else if (authResult === 'ok') {
                    console.log('✅ FlightAware traditional authentication successful!');
                    // Send a heartbeat command to keep connection alive
                    if (socket && socket.writable) {
                      socket.write('live keepalive 30\n');
                    }
                  }
                }
              }
            }
          }
        }
        
        // Process complete lines from the buffer
        const lines = dataBuffer.split('\n');
        dataBuffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
        
        if (lines.length > 0) {
          console.log(`Processing ${lines.length} lines from FlightAware`);
          
          // Process each line individually
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine === '') continue;
            
            // Skip already handled auth lines or system messages
            if (trimmedLine.startsWith('auth ') || 
                trimmedLine.startsWith('live msg') || 
                trimmedLine.startsWith('clock')) {
              continue;
            }
            
            // Process flight data
            processFlightData(trimmedLine);
          }
          
          // If we have processed flight data, update our connected status
          isConnected = true;
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
 * Attempt to reconnect to FlightAware with an exponential backoff strategy
 * for better resilience when the API is under high load or experiencing issues
 */
function attemptReconnect() {
  // If socket still exists, ensure it's closed
  if (socket) {
    try {
      socket.removeAllListeners();
      socket.end();
      socket.destroy();
    } catch (e) {
      console.error('Error while closing socket:', e);
    }
    socket = null;
  }

  // Clear the flight cache when connection is lost to avoid stale data
  if (flightCache.size > 0) {
    console.log(`Clearing flight cache with ${flightCache.size} entries due to connection loss`);
    flightCache.clear();
  }
  
  // If connection is already throttled, don't schedule another reconnect
  if (isConnectionThrottled) {
    console.log('Connection attempt blocked by active throttling - will reconnect when throttling ends');
    return;
  }
  
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Entering throttled retry mode.`);
    
    // Send error message to clients so they can display it
    broadcastMessage('error', {
      message: 'Unable to connect to FlightAware. The server will continue trying to reconnect in the background.',
      code: 'FLIGHTAWARE_CONNECTION_FAILED'
    });
    
    // Start extended throttling
    const throttleTime = 60000 + Math.floor(Math.random() * 30000); // 60-90 seconds
    
    // Notify clients about connection status
    broadcastMessage('connectionStatus', {
      status: 'throttled',
      message: 'FlightAware connection retry limit reached. Implementing extended throttling to avoid API rate limits.',
      reconnectIn: throttleTime
    });
    
    // Start throttling
    startConnectionThrottling(throttleTime);
    
    // Schedule a single reconnect after throttling period
    setTimeout(() => {
      console.log('Extended throttling completed, attempting reconnection with reset counter');
      reconnectAttempts = 0;
      initializeFlightAwareConnection();
    }, throttleTime + 1000); // Add 1 second buffer
    
    return;
  }
  
  reconnectAttempts++;
  
  // Exponential backoff with jitter for better distribution of retry attempts
  // Base delay: 5 seconds, max: 60 seconds
  const baseDelay = RECONNECT_DELAY;
  const maxDelay = 60000; // 60 seconds max
  const exponentialDelay = Math.min(baseDelay * Math.pow(1.5, reconnectAttempts - 1), maxDelay);
  
  // Add jitter (±20% of the delay) to prevent synchronized reconnection attempts
  const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
  const finalDelay = Math.max(baseDelay, Math.floor(exponentialDelay + jitter));
  
  console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${Math.round(finalDelay/1000)} seconds...`);
  
  setTimeout(() => {
    console.log(`Reconnect attempt ${reconnectAttempts}: Initializing connection`);
    initializeFlightAwareConnection();
  }, finalDelay);
}

/**
 * Process a line of data from FlightAware
 */
function processFlightData(line: string) {
  try {
    console.log('Processing line:', line); // Log every line for detailed debugging
    
    // Skip system messages and keep-alives
    // Check both for old format messages and JSON system messages
    if (line.startsWith('live msg') || line.startsWith('clock') || line.startsWith('auth')) {
      if (line.startsWith('auth ')) {
        const authResult = line.split(' ')[1];
        console.log(`FlightAware auth response: "${line}"`);
        if (authResult === 'failed') {
          console.error('FlightAware authentication failed. Please check your credentials.');
          
          // When auth fails, let the user know we need updated credentials
          broadcastMessage('error', {
            message: 'FlightAware authentication failed. Please update your API credentials.',
            code: 'FLIGHTAWARE_AUTH_FAILED'
          });
        } else if (authResult === 'ok') {
          console.log('FlightAware authentication successful.');
        } else {
          console.log(`Unknown auth response: ${authResult}`);
        }
      }
      return;
    }
    
    // Also try to parse as JSON and check if it's a system message
    try {
      const jsonData = JSON.parse(line);
      if (jsonData.type === 'livemsg' || jsonData.type === 'clock' || jsonData.type === 'auth') {
        if (jsonData.type === 'auth') {
          console.log(`FlightAware JSON auth response: ${JSON.stringify(jsonData)}`);
          if (jsonData.result === 'failed') {
            console.error('FlightAware authentication failed. Please check your credentials.');
            
            // When auth fails, let the user know we need updated credentials
            broadcastMessage('error', {
              message: 'FlightAware authentication failed. Please update your API credentials.',
              code: 'FLIGHTAWARE_AUTH_FAILED'
            });
          } else if (jsonData.result === 'ok') {
            console.log('FlightAware authentication successful.');
          } else {
            console.log(`Unknown auth response: ${jsonData.result}`);
          }
        }
        return;
      }
    } catch (e) {
      // Not a JSON message, continue processing
    }

    // Try to parse the line as JSON
    try {
      const jsonData = JSON.parse(line);
      console.log('Parsed JSON data:', jsonData.type);
      
      // Check if this is a position update
      if (jsonData.type === 'position') {
        console.log('Processing position update from JSON');
        const flight = parsePositionUpdateFromJson(jsonData);
        if (flight) {
          console.log(`Adding/updating flight ID ${flight.id} in cache`);
          flightCache.set(flight.id, flight);
        } else {
          console.log('Failed to parse position update from JSON');
        }
      }
      // Check if this is a flight info update
      else if (jsonData.type === 'flight') {
        console.log('Processing flight info update from JSON');
        updateFlightInfoFromJson(jsonData);
      } else {
        console.log(`Unhandled JSON message type: ${jsonData.type}, not processing`);
      }
    } catch (jsonError) {
      // Fallback to old space-delimited format
      console.log('Could not parse as JSON, trying old format');
      const fields = line.split(' ');
      console.log(`Parsed line type: ${fields[0]}, fields count: ${fields.length}`);
      
      // Check if this is a position update
      if (fields[0] === 'pos' && fields.length >= 10) {
        console.log('Processing position update:', fields.join(' '));
        const flight = parsePositionUpdate(fields);
        if (flight) {
          console.log(`Adding/updating flight ID ${flight.id} in cache`);
          flightCache.set(flight.id, flight);
        } else {
          console.log('Failed to parse position update');
        }
      }
      // Check if this is a flight info update
      else if (fields[0] === 'flight' && fields.length >= 5) {
        console.log('Processing flight info update:', fields.join(' '));
        updateFlightInfo(fields);
      } else {
        console.log(`Unhandled message type: ${fields[0]}, not processing`);
      }
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
 * Parse a position update message from FlightAware JSON data
 */
function parsePositionUpdateFromJson(jsonData: any): LiveFlight | null {
  try {
    const id = jsonData.id || jsonData.ident || jsonData.hexid;
    if (!id) {
      console.error('Missing ID in flight data:', jsonData);
      return null;
    }
    
    // Extract position data
    const latitude = parseFloat(jsonData.lat);
    const longitude = parseFloat(jsonData.lon);
    const altitude = parseInt(jsonData.alt, 10);
    const heading = parseInt(jsonData.heading, 10);
    const groundSpeed = parseInt(jsonData.gs, 10);
    const timestamp = jsonData.clock ? 
      new Date(parseInt(jsonData.clock, 10) * 1000).toISOString() : 
      new Date().toISOString();
    const squawk = jsonData.squawk !== 'none' ? jsonData.squawk : undefined;
    
    // Get existing flight data or create new
    const existingFlight = flightCache.get(id);
    
    // Create or update the flight object
    const flight: LiveFlight = {
      id,
      callsign: jsonData.ident || existingFlight?.callsign || id,
      flightNumber: jsonData.ident || existingFlight?.flightNumber,
      registration: jsonData.reg || existingFlight?.registration,
      aircraftType: jsonData.aircrafttype || existingFlight?.aircraftType,
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
        verticalSpeed: jsonData.vertRate ? parseInt(jsonData.vertRate, 10) : (existingFlight?.position?.verticalSpeed || 0),
        timestamp
      },
      status: existingFlight?.status || 'active',
      route: existingFlight?.route,
      progress: existingFlight?.progress,
      squawk
    };
    
    return flight;
  } catch (error) {
    console.error('Error parsing JSON position update:', error, jsonData);
    return null;
  }
}

/**
 * Update flight information based on a flight info JSON message
 */
function updateFlightInfoFromJson(jsonData: any) {
  try {
    const id = jsonData.id || jsonData.ident || jsonData.hexid;
    if (!id) {
      console.error('Missing ID in flight info data:', jsonData);
      return;
    }
    
    const callsign = jsonData.ident;
    const origin = jsonData.origin !== 'none' ? jsonData.origin : undefined;
    const destination = jsonData.destination !== 'none' ? jsonData.destination : undefined;
    
    // Get existing flight data
    const existingFlight = flightCache.get(id);
    if (!existingFlight) return;
    
    // Update flight with new info
    existingFlight.callsign = callsign;
    existingFlight.flightNumber = callsign;
    
    // If we have registration info, update it
    if (jsonData.reg) {
      existingFlight.registration = jsonData.reg;
    }
    
    // If we have aircraft type info, update it
    if (jsonData.aircrafttype) {
      existingFlight.aircraftType = jsonData.aircrafttype;
    }
    
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
    console.error('Error updating flight info from JSON:', error, jsonData);
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
// Import AviationStack API functions
import { fetchFlightsFromAviationStack } from './aviationstack';

export async function fetchFlights(filterType: MapFilter['type']): Promise<LiveFlight[]> {
  try {
    console.log(`Fetching flights (${flightCache.size} in cache) with filter: ${filterType}`);
    
    // Get flights from FlightAware cache if available
    let flights: LiveFlight[] = [];
    
    if (flightCache.size > 0) {
      // Get flights from FlightAware cache
      flights = Array.from(flightCache.values());
      
      // Filter out any mock flights (ID starts with MOCK, CARGO, or PVT)
      flights = flights.filter(f => 
        !f.id.startsWith('MOCK') && 
        !f.id.startsWith('CARGO') && 
        !f.id.startsWith('PVT')
      );
    } 
    // If FlightAware has no data, try to use AviationStack as fallback
    else if (!isConnected || flightCache.size === 0) {
      console.log('FlightAware data unavailable, attempting to fetch from AviationStack API');
      
      try {
        const aviationStackFlights = await fetchFlightsFromAviationStack();
        if (aviationStackFlights.length > 0) {
          console.log(`Successfully fetched ${aviationStackFlights.length} flights from AviationStack`);
          flights = aviationStackFlights;
          
          // Also broadcast these flights to connected clients
          broadcastMessage('flights', aviationStackFlights);
          
          // Also cache these flights in storage
          storage.cacheFlightData(aviationStackFlights).catch(err => {
            console.error('Error caching AviationStack flight data:', err);
          });
        } else {
          console.log('No flights returned from AviationStack API');
        }
      } catch (aviationStackError) {
        console.error('Error fetching from AviationStack:', aviationStackError);
      }
    }
    
    // If we still have no flights, attempt to reconnect to FlightAware
    if (flights.length === 0) {
      console.log('No flights returned from any API');
      
      // If not connected to FlightAware, try to connect
      if (!isConnected) {
        initializeFlightAwareConnection();
      }
      
      return [];
    }
    
    // Apply filters
    let filteredFlights = flights;
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
  } catch (error) {
    console.error('Error fetching flights:', error);
    return [];
  }
}

// Import find function from aviationstack
import { findFlightById } from './aviationstack';

/**
 * Fetch details for a specific flight by ID (from cache or AviationStack)
 */
export async function fetchFlightDetails(flightId: string): Promise<LiveFlight | null> {
  try {
    // First try to get flight from FlightAware cache
    const flight = flightCache.get(flightId);
    if (flight) {
      return flight;
    }
    
    // If not in FlightAware cache, try AviationStack
    console.log(`Flight ${flightId} not found in FlightAware cache, trying AviationStack`);
    const aviationStackFlight = findFlightById(flightId);
    if (aviationStackFlight) {
      console.log(`Found flight ${flightId} in AviationStack cache`);
      return aviationStackFlight;
    }
    
    console.log(`Flight ${flightId} not found in any cache`);
    return null;
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
      manufacturer: null,
      model: null,
      variant: null,
      airline: null, // Using null because the schema allows it
      manufacturerSerialNumber: null,
      age: null,
      category: null,
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