import { useEffect, useState } from 'react';
import { LiveFlight, MapFilter } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useWebSocket(filters: MapFilter) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [flights, setFlights] = useState<LiveFlight[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    // Connection opened
    ws.addEventListener('open', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "Real-time flight tracking activated",
        duration: 3000,
      });
      
      // Send initial filter
      ws.send(JSON.stringify({
        type: 'setFilter',
        filter: filters.type
      }));
    });
    
    // Listen for messages
    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'flightUpdate') {
          setFlights(data.flights);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Connection closed
    ws.addEventListener('close', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Lost connection to flight tracking server",
        variant: "destructive",
      });
    });
    
    // Connection error
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    });
    
    setSocket(ws);
    
    // Clean up on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [toast]);
  
  // Send updated filters to server
  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'setFilter',
        filter: filters.type
      }));
    }
  }, [socket, filters.type]);

  return { flights, isConnected };
}
