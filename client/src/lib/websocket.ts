import { useEffect, useState, useRef } from 'react';
import { LiveFlight, MapFilter } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useWebSocket(filters: MapFilter) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [flights, setFlights] = useState<LiveFlight[]>([]);
  const { toast } = useToast();
  
  // Use refs to track reconnection state
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = useRef(10);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelay = useRef(3000); // 3 seconds initial delay
  
  // Create a ref to store the latest flights to prevent stale data in callbacks
  const latestFlights = useRef<LiveFlight[]>([]);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    latestFlights.current = flights;
  }, [flights]);
  
  // Initialize WebSocket connection using refs to avoid circular dependencies
  useEffect(() => {
    // References for functions to avoid circular dependencies
    const connectWebSocketRef = useRef<() => WebSocket | null>();
    const attemptReconnectRef = useRef<() => void>();
    
    // Define the reconnect function first
    attemptReconnectRef.current = () => {
      if (reconnectAttempts.current >= maxReconnectAttempts.current) {
        console.log(`Max reconnect attempts (${maxReconnectAttempts.current}) reached.`);
        toast({
          title: "Connection Failed",
          description: "Could not reconnect to the flight data server. Please refresh the page to try again.",
          variant: "destructive",
          duration: 6000,
        });
        return;
      }
      
      reconnectAttempts.current++;
      // Exponential backoff with a max of 30 seconds
      const delay = Math.min(reconnectDelay.current * Math.pow(1.5, reconnectAttempts.current - 1), 30000);
      console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts.current}) in ${delay/1000} seconds...`);
      
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      
      reconnectTimeout.current = setTimeout(() => {
        if (connectWebSocketRef.current) {
          connectWebSocketRef.current();
        }
      }, delay);
    };
    
    // Then define the connect function
    connectWebSocketRef.current = () => {
      try {
        // Create WebSocket connection
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log(`Attempting to connect to WebSocket at ${wsUrl}`);
        const ws = new WebSocket(wsUrl);
        
        // Set timeout for connection establishment
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            console.log('WebSocket connection timed out');
            ws.close();
            if (attemptReconnectRef.current) {
              attemptReconnectRef.current();
            }
          }
        }, 10000); // 10 seconds timeout
        
        // Connection opened
        ws.addEventListener('open', () => {
          console.log('Connected to WebSocket server');
          clearTimeout(connectionTimeout);
          setIsConnected(true);
          reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
          
          toast({
            title: "Connected",
            description: "Real-time flight tracking activated",
            duration: 3000,
          });
          
          // Keep connection alive with ping/pong
          pingIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              try {
                ws.send(JSON.stringify({ type: 'ping' }));
              } catch (error) {
                console.error('Error sending ping:', error);
                if (pingIntervalRef.current) {
                  clearInterval(pingIntervalRef.current);
                  pingIntervalRef.current = null;
                }
                if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                  ws.close();
                }
              }
            } else {
              if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
              }
            }
          }, 30000); // Send ping every 30 seconds
          
          // Send initial filter
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({
                type: 'setFilter',
                filter: filters.type
              }));
              console.log(`Sent initial filter: ${filters.type}`);
            } catch (error) {
              console.error('Error sending initial filter:', error);
            }
          }
        });
        
        // Listen for messages
        ws.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle pong responses (server echo of our ping)
            if (data.type === 'pong') {
              console.log('Received pong from server');
              return;
            }
            
            // Handle connection status messages
            if (data.type === 'connectionStatus') {
              console.log('Received connection status update:', data);
              
              if (data.status === 'throttled') {
                // Show user-friendly message about throttling
                toast({
                  title: "Connection throttled",
                  description: data.message || "FlightAware connection is being throttled. Will reconnect automatically.",
                  duration: 8000,
                });
                
                // Update UI as needed to show temporary disruption
                setIsConnected(false);
              }
              
              return;
            }
            
            // Handle error messages
            if (data.type === 'error') {
              console.error('Received error from server:', data);
              
              toast({
                title: "Server Error",
                description: data.message || "An error occurred with the flight data connection.",
                variant: "destructive",
                duration: 8000,
              });
              
              return;
            }
            
            // Support both 'flights' and 'flightUpdate' message types for better compatibility
            if (data.type === 'flights' || data.type === 'flightUpdate') {
              const flightData = data.flights || data.data;
              
              if (Array.isArray(flightData) && flightData.length > 0) {
                // Log data source transparency
                const hasMockData = flightData.some((f: LiveFlight) => 
                  f.id.startsWith('MOCK') || f.id.startsWith('CARGO'));
                
                if (hasMockData) {
                  console.log(`Received ${flightData.length} simulated flights (development mode)`);
                } else {
                  console.log(`Received ${flightData.length} real-time flights from FlightAware`);
                }
                
                // Use a functional update for better state management
                setFlights(prevFlights => {
                  // If we have no previous flights, just use the new data
                  if (prevFlights.length === 0) return flightData;
                  
                  // Create a map for faster lookup by ID
                  const updatedFlightsMap = new Map(
                    flightData.map((flight: LiveFlight) => [flight.id, flight])
                  );
                  
                  // Update existing flights or add new ones
                  const updatedFlights = prevFlights.map(flight => {
                    return updatedFlightsMap.get(flight.id) || flight;
                  });
                  
                  // Add any new flights that weren't in the previous data
                  flightData.forEach((flight: LiveFlight) => {
                    if (!updatedFlights.some(f => f.id === flight.id)) {
                      updatedFlights.push(flight);
                    }
                  });
                  
                  return updatedFlights;
                });
              } else {
                console.warn('Received empty or invalid flight data from WebSocket:', flightData);
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });
        
        // Connection closed
        ws.addEventListener('close', (event) => {
          console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
          clearTimeout(connectionTimeout);
          setIsConnected(false);
          
          // Only show toast on first disconnect to avoid spamming
          if (reconnectAttempts.current === 0) {
            toast({
              title: "Disconnected",
              description: "Lost connection to flight tracking server, attempting to reconnect...",
              variant: "destructive",
              duration: 5000,
            });
          }
          
          // Attempt to reconnect
          if (attemptReconnectRef.current) {
            attemptReconnectRef.current();
          }
        });
        
        // Connection error
        ws.addEventListener('error', (error) => {
          console.error('WebSocket error:', error);
          clearTimeout(connectionTimeout);
          
          // Only close if it's still open or connecting
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
          
          setIsConnected(false);
        });
        
        setSocket(ws);
        return ws;
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        return null;
      }
    };
    
    // Start the initial connection
    const ws = connectWebSocketRef.current();
    
    // Clean up on unmount
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, [toast, filters.type]);
  
  // Send updated filters to server
  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({
          type: 'setFilter',
          filter: filters.type
        }));
        console.log(`Sent updated filter: ${filters.type}`);
      } catch (error) {
        console.error('Error sending filter update:', error);
      }
    }
  }, [socket, filters.type]);

  return { flights, isConnected };
}