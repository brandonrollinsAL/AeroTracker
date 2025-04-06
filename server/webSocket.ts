import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { fetchFlights, initializeFlightAwareConnection, closeFlightAwareConnection } from './api/flightaware';
import { LiveFlight } from '@shared/schema';
import { storage } from './storage';

let wss: WebSocketServer;
let clients: Map<WebSocket, { filters?: { type: string } }> = new Map();
let flightUpdateInterval: NodeJS.Timeout | null = null;
let cachedFlights: LiveFlight[] = [];

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
        
        // Handle filter updates
        if (data.type === 'setFilter') {
          const clientData = clients.get(ws) || {};
          clients.set(ws, { 
            ...clientData,
            filters: { type: data.filter }
          });
          
          // Send filtered flights
          if (cachedFlights.length > 0) {
            const filteredFlights = filterFlights(cachedFlights, data.filter);
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

  return wss;
}

function startFlightUpdates() {
  // Update flights every 10 seconds
  flightUpdateInterval = setInterval(async () => {
    try {
      // Fetch new flight data
      console.log(`Fetching flights (${cachedFlights.length} in cache) with filter: all`);
      const flights = await fetchFlights('all');
      
      if (!flights || flights.length === 0) {
        console.log('No flights returned from the API');
        return;
      }
      
      // Cache the flights
      cachedFlights = flights;
      await storage.cacheFlightData(flights);
      
      // Broadcast to all connected clients with their specific filters
      clients.forEach((data, client) => {
        if (client.readyState === WebSocket.OPEN) {
          const filterType = data.filters?.type || 'all';
          const filteredFlights = filterFlights(flights, filterType);
          
          sendFlightData(client, filteredFlights);
        }
      });
    } catch (error) {
      console.error('Error fetching flight updates:', error);
    }
  }, 10000); // 10 seconds
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
      type: 'flightUpdate',
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
        client.send(JSON.stringify({
          type,
          data,
          timestamp: new Date().toISOString()
        }));
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
  
  // Close FlightAware connection
  closeFlightAwareConnection();
  
  if (wss) {
    wss.close();
  }
}
