import React, { createContext, useContext, useState, ReactNode } from 'react';
import L from 'leaflet';
import { LiveFlight } from '@/types';

// Context for map state sharing
interface FlightMapContextType {
  flights: LiveFlight[];
  visibleFlights: LiveFlight[];
  mapBounds: L.LatLngBounds | null;
  setMapBounds: React.Dispatch<React.SetStateAction<L.LatLngBounds | null>>;
  setVisibleFlights: React.Dispatch<React.SetStateAction<LiveFlight[]>>;
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

export function FlightMapProvider({ children, flights }: FlightMapProviderProps) {
  const [visibleFlights, setVisibleFlights] = useState<LiveFlight[]>([]);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  
  const contextValue = {
    flights,
    visibleFlights,
    mapBounds,
    setMapBounds,
    setVisibleFlights
  };
  
  return (
    <FlightMapContext.Provider value={contextValue}>
      {children}
    </FlightMapContext.Provider>
  );
}