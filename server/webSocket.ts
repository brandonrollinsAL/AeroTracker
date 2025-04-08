import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { fetchFlights, initializeFlightAwareConnection, closeFlightAwareConnection } from './api/flightaware';
import { LiveFlight } from '@shared/schema';
import { storage } from './storage';

let wss: WebSocketServer;
let clients: Map<WebSocket, { filters?: { type: string } }> = new Map();
let flightUpdateInterval: NodeJS.Timeout | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let cachedFlights: LiveFlight[] = [];

// Constants for intervals
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const FLIGHT_UPDATE_INTERVAL = 1000; // 1 second
const ANIMATION_INTERVAL = 250; // 250ms for smooth animation

export function setupWebSocketServer(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    clients.set(ws, {});

    // Send initial flight data
    if (cachedFlights.length > 0) {
      sendFlightData(ws, cachedFlights);
    }

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle ping/pong for keeping connection alive
        if (data.type === 'ping') {
          // Respond with pong to keep connection alive
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }));
          }
          return;
        }
        
        // Handle filter updates - support both 'setFilter' and 'filter' message types
        if (data.type === 'setFilter' || data.type === 'filter') {
          const filterType = data.filter || data.filterType || 'all';
          const clientData = clients.get(ws) || {};
          clients.set(ws, { 
            ...clientData,
            filters: { type: filterType }
          });
          
          console.log(`Client set filter to: ${filterType}`);
          
          // Send filtered flights
          if (cachedFlights.length > 0) {
            const filteredFlights = filterFlights(cachedFlights, filterType);
            sendFlightData(ws, filteredFlights);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clients.delete(ws);
    });
  });

  // Initialize connection to FlightAware
  initializeFlightAwareConnection();

  // Start the flight update interval if it hasn't already been started
  if (!flightUpdateInterval) {
    startFlightUpdates();
  }
  
  // Set up a heartbeat to check for stale connections
  heartbeatInterval = setInterval(() => {
    wss.clients.forEach(client => {
      // Check if client is still connected
      if (client.readyState === WebSocket.OPEN) {
        // Send a ping heartbeat
        try {
          client.ping();
        } catch (error) {
          console.error('Error sending ping heartbeat:', error);
          // If ping fails and client is still in OPEN state, terminate the connection
          if (client.readyState === WebSocket.OPEN) {
            client.terminate();
          }
        }
      } else if (client.readyState !== WebSocket.CONNECTING) {
        // For any non-connecting non-open clients, terminate to clean up
        client.terminate();
      }
    });
  }, HEARTBEAT_INTERVAL);
  
  // Attempt to send initial data if we have none - this helps ensure clients always get data
  setTimeout(async () => {
    try {
      if (cachedFlights.length === 0) {
        const flights = await fetchFlights('all');
        if (flights && flights.length > 0) {
          cachedFlights = flights;
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              sendFlightData(client, flights);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching initial flight data:', error);
    }
  }, 3000);

  return wss;
}

function startFlightUpdates() {
  // Update flights at defined interval for high-frequency real-time live data
  flightUpdateInterval = setInterval(async () => {
    try {
      // Fetch new flight data
      console.log(`Fetching flights (${cachedFlights.length} in cache) with filter: all`);
      const flights = await fetchFlights('all');
      
      if (!flights || flights.length === 0) {
        console.log('No flights returned from the API');
        // If no flights are returned but we have cached data, use that to maintain continuity
        if (cachedFlights.length > 0) {
          broadcastCachedFlights();
        }
        return;
      }
      
      // Check if we have real flight data (not mock)
      const hasMockData = flights.some(f => f.id.startsWith('MOCK') || f.id.startsWith('CARGO'));
      const hasRealData = flights.some(f => !f.id.startsWith('MOCK') && !f.id.startsWith('CARGO'));
      
      // Log the data source for transparency
      if (hasRealData) {
        console.log(`Broadcasting ${flights.length} live flights from FlightAware`);
      } else if (hasMockData) {
        console.log(`Broadcasting ${flights.length} simulated flights (no live connection)`);
      }
      
      // Update flight positions to simulate smooth movement
      const updatedFlights = flights.map(flight => ({
        ...flight,
        // Add a small random variation to positions for smoother animation
        position: {
          ...flight.position,
          latitude: flight.position.latitude + (Math.random() * 0.001 - 0.0005),
          longitude: flight.position.longitude + (Math.random() * 0.001 - 0.0005),
          timestamp: new Date().toISOString()
        }
      }));
      
      // Cache the flights
      cachedFlights = updatedFlights;
      await storage.cacheFlightData(updatedFlights);
      
      // Broadcast to all connected clients with their specific filters
      broadcastCachedFlights();
    } catch (error) {
      console.error('Error fetching flight updates:', error);
      
      // Still broadcast cached data even on error to maintain continuity
      if (cachedFlights.length > 0) {
        broadcastCachedFlights();
      }
    }
  }, FLIGHT_UPDATE_INTERVAL); // Continuous real-time updates as requested by user
  
  // Additional high-frequency update for smooth animations
  // This sends small position interpolations between main updates
  setInterval(() => {
    if (cachedFlights.length > 0) {
      try {
        // Create a subtle movement update to all flights for smooth animation
        const interpolatedFlights = cachedFlights.map(flight => {
          if (!flight || !flight.position || typeof flight.position.heading !== 'number') {
            console.warn(`Invalid flight data found: ${JSON.stringify(flight)}`);
            return flight; // Return unmodified if data is invalid
          }
          
          return {
            ...flight,
            position: {
              ...flight.position,
              // Simulate movement in the direction of heading
              latitude: flight.position.latitude + (Math.sin(flight.position.heading * Math.PI/180) * 0.0003),
              longitude: flight.position.longitude + (Math.cos(flight.position.heading * Math.PI/180) * 0.0003),
              timestamp: new Date().toISOString()
            }
          };
        });
        
        // Update the cache with interpolated positions
        cachedFlights = interpolatedFlights;
        
        // Broadcast the interpolated positions
        broadcastCachedFlights();
      } catch (error) {
        console.error('Error interpolating flight positions:', error);
      }
    }
  }, ANIMATION_INTERVAL); // Update frequently for smoother animation
}

// Helper function to broadcast cached flights to all clients
function broadcastCachedFlights() {
  clients.forEach((data, client) => {
    if (client.readyState === WebSocket.OPEN) {
      const filterType = data.filters?.type || 'all';
      const filteredFlights = filterFlights(cachedFlights, filterType);
      
      sendFlightData(client, filteredFlights);
    }
  });
}

function filterFlights(flights: LiveFlight[], filterType: string): LiveFlight[] {
  if (filterType === 'all') return flights;
  
  return flights.filter(flight => {
    // This is a simplistic implementation - in a real system you would
    // have more sophisticated logic to determine flight types
    if (filterType === 'commercial') {
      // Commercial flights usually have airline info and are operated by commercial carriers
      return flight.airline?.name != null;
    } else if (filterType === 'private') {
      // Private flights often have no airline info
      return flight.airline?.name == null;
    } else if (filterType === 'cargo') {
      // Cargo flights might be identified by specific airlines or callsigns
      // This is just an example - would need real logic
      return flight.callsign?.includes('CARGO') || 
             flight.airline?.name?.toLowerCase().includes('cargo');
    }
    return true;
  });
}

function sendFlightData(client: WebSocket, flights: LiveFlight[]) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({
      type: 'flights', // Using 'flights' to match the expected type in the client
      flights,
      timestamp: new Date().toISOString()
    }));
  }
}

export function broadcastMessage(type: string, data: any) {
  if (!wss) return;
  
  clients.forEach((_, client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        // If type is 'flights', use a consistent format with sendFlightData
        if (type === 'flights') {
          client.send(JSON.stringify({
            type,
            flights: data,
            timestamp: new Date().toISOString()
          }));
        } else {
          client.send(JSON.stringify({
            type,
            data,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('Error broadcasting message to client:', error);
      }
    }
  });
}

// Clean up when the server shuts down
export function cleanupWebSocketServer() {
  if (flightUpdateInterval) {
    clearInterval(flightUpdateInterval);
    flightUpdateInterval = null;
  }
  
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  
  // Close FlightAware connection
  closeFlightAwareConnection();
  
  if (wss) {
    wss.close();
  }
}
