import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import L from 'leaflet';
import { LiveFlight } from '@/types';

// Interface for clustered flights data
interface FlightCluster {
  id: string;
  count: number;
  center: [number, number];
  flights: LiveFlight[];
}

// Context for map state sharing with optimization features
interface FlightMapContextType {
  flights: LiveFlight[];
  visibleFlights: LiveFlight[];
  clusteredFlights: FlightCluster[];
  mapBounds: L.LatLngBounds | null;
  mapZoom: number;
  setMapBounds: React.Dispatch<React.SetStateAction<L.LatLngBounds | null>>;
  setVisibleFlights: React.Dispatch<React.SetStateAction<LiveFlight[]>>;
  setMapZoom: React.Dispatch<React.SetStateAction<number>>;
  filterFlightsByBounds: (bounds: L.LatLngBounds) => void;
  getDetailLevel: () => 'high' | 'medium' | 'low';
}

const FlightMapContext = createContext<FlightMapContextType | null>(null);

export function useFlightMapContext() {
  const context = useContext(FlightMapContext);
  if (!context) {
    throw new Error('useFlightMapContext must be used within a FlightMapProvider');
  }
  return context;
}

interface FlightMapProviderProps {
  children: ReactNode;
  flights: LiveFlight[];
}

const CLUSTER_RADIUS = 50; // pixels

export function FlightMapProvider({ children, flights }: FlightMapProviderProps) {
  const [visibleFlights, setVisibleFlights] = useState<LiveFlight[]>([]);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [clusteredFlights, setClusteredFlights] = useState<FlightCluster[]>([]);
  
  // Function to determine the detail level based on zoom
  const getDetailLevel = useCallback((): 'high' | 'medium' | 'low' => {
    if (mapZoom >= 10) return 'high';
    if (mapZoom >= 7) return 'medium';
    return 'low';
  }, [mapZoom]);

  // Efficient function to filter flights by map bounds
  const filterFlightsByBounds = useCallback((bounds: L.LatLngBounds) => {
    if (!bounds) return;
    
    const filtered = flights.filter(flight => {
      if (!flight.position?.latitude || !flight.position?.longitude) return false;
      
      return bounds.contains([
        flight.position.latitude,
        flight.position.longitude
      ]);
    });
    
    // Update visible flights with those in the current view
    setVisibleFlights(filtered);
    setMapBounds(bounds);
  }, [flights]);

  // Memoized clustering logic - only runs when dependencies change
  useEffect(() => {
    if (!mapBounds || visibleFlights.length === 0) {
      setClusteredFlights([]);
      return;
    }

    // Skip clustering at higher zoom levels for performance
    if (mapZoom >= 8) {
      // At high zoom levels, just map each flight to its own "cluster"
      const individualClusters = visibleFlights.map(flight => ({
        id: flight.id,
        count: 1,
        center: [flight.position?.latitude || 0, flight.position?.longitude || 0] as [number, number],
        flights: [flight]
      }));
      setClusteredFlights(individualClusters);
      return;
    }

    // Create grid-based clusters for lower zoom levels
    const clusters: Record<string, FlightCluster> = {};
    const gridSize = 1 / Math.pow(2, mapZoom) * 2; // Grid size based on zoom level

    visibleFlights.forEach(flight => {
      if (!flight.position?.latitude || !flight.position?.longitude) return;
      
      // Create grid-based key for clustering
      const gridX = Math.floor(flight.position.latitude / gridSize);
      const gridY = Math.floor(flight.position.longitude / gridSize);
      const gridKey = `${gridX}:${gridY}`;
      
      if (!clusters[gridKey]) {
        clusters[gridKey] = {
          id: gridKey,
          count: 0,
          center: [0, 0],
          flights: []
        };
      }
      
      // Update cluster
      const cluster = clusters[gridKey];
      cluster.count++;
      cluster.flights.push(flight);
      
      // Recalculate center (average of all points)
      const lat = (cluster.center[0] * (cluster.count - 1) + flight.position.latitude) / cluster.count;
      const lng = (cluster.center[1] * (cluster.count - 1) + flight.position.longitude) / cluster.count;
      cluster.center = [lat, lng];
    });
    
    setClusteredFlights(Object.values(clusters));
  }, [visibleFlights, mapBounds, mapZoom]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    flights,
    visibleFlights,
    clusteredFlights,
    mapBounds,
    mapZoom,
    setMapBounds,
    setVisibleFlights,
    setMapZoom,
    filterFlightsByBounds,
    getDetailLevel
  }), [
    flights, 
    visibleFlights, 
    clusteredFlights,
    mapBounds, 
    mapZoom, 
    filterFlightsByBounds, 
    getDetailLevel
  ]);
  
  return (
    <FlightMapContext.Provider value={contextValue}>
      {children}
    </FlightMapContext.Provider>
  );
}