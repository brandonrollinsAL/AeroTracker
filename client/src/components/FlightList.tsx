import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import FlightItem from "./FlightItem";
import { LiveFlight } from "@/types";
import { Skeleton } from '@/components/ui/skeleton';
import { Star, StarOff } from 'lucide-react';

interface FlightListProps {
  flights: LiveFlight[];
  onFlightSelect: (flight: LiveFlight) => void;
  isConnected: boolean;
  favoriteFlights?: LiveFlight[];
  onAddToFavorites?: (flight: LiveFlight) => void;
  onRemoveFromFavorites?: (flightId: string) => void;
}

export default function FlightList({ 
  flights, 
  onFlightSelect, 
  isConnected,
  favoriteFlights = [],
  onAddToFavorites,
  onRemoveFromFavorites
}: FlightListProps) {
  const [sortBy, setSortBy] = useState<string>("updated");
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };
  
  // Sort flights based on selected sort criteria
  const sortedFlights = Array.isArray(flights) ? [...flights].sort((a, b) => {
    if (sortBy === "updated") {
      return new Date(b.position.timestamp).getTime() - new Date(a.position.timestamp).getTime();
    } else if (sortBy === "airline") {
      return (a.airline?.name || "").localeCompare(b.airline?.name || "");
    } else if (sortBy === "flightNumber") {
      return (a.flightNumber || a.callsign || "").localeCompare(b.flightNumber || b.callsign || "");
    } else if (sortBy === "departure") {
      const aTime = a.departure?.time ? new Date(a.departure.time).getTime() : 0;
      const bTime = b.departure?.time ? new Date(b.departure.time).getTime() : 0;
      return aTime - bTime;
    }
    return 0;
  }) : [];

  // Check if a flight is in favorites
  const isFlightFavorited = (flightId: string): boolean => {
    return favoriteFlights.some(f => f.id === flightId);
  };

  // Handle adding to favorites
  const handleAddToFavorites = (flight: LiveFlight) => {
    if (onAddToFavorites) {
      onAddToFavorites(flight);
    }
  };

  // Handle removing from favorites
  const handleRemoveFromFavorites = (flightId: string) => {
    if (onRemoveFromFavorites) {
      onRemoveFromFavorites(flightId);
    }
  };

  // Render flight list with favorite toggle buttons
  const renderFlightList = (flightList: LiveFlight[]) => {
    if (!isConnected) {
      return Array(5).fill(0).map((_, index) => (
        <div key={index} className="border-b border-neutral-200 p-4">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-5 w-20 rounded" />
              <Skeleton className="h-4 w-40 mt-1 rounded" />
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-4 w-16 mt-1 rounded" />
            </div>
          </div>
          <div className="mt-3">
            <Skeleton className="h-8 w-full rounded" />
          </div>
          <div className="flex justify-between items-center mt-3">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        </div>
      ));
    }

    if (flightList.length === 0) {
      return (
        <div className="p-8 text-center text-neutral-500">
          <span className="material-icons text-4xl mb-2">flight_off</span>
          <p>No flights match the current filters</p>
        </div>
      );
    }

    return flightList.map((flight) => (
      <div key={flight.id} className="relative">
        <FlightItem 
          key={flight.id} 
          flight={flight} 
          onClick={() => onFlightSelect(flight)} 
        />
        {onAddToFavorites && onRemoveFromFavorites && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 h-8 w-8" 
            onClick={() => isFlightFavorited(flight.id) 
              ? handleRemoveFromFavorites(flight.id) 
              : handleAddToFavorites(flight)
            }
          >
            {isFlightFavorited(flight.id) ? (
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            ) : (
              <Star className="h-4 w-4 text-neutral-400" />
            )}
          </Button>
        )}
      </div>
    ));
  };

  // Get sorted favorites
  const sortedFavorites = [...favoriteFlights].sort((a, b) => {
    if (sortBy === "updated") {
      return new Date(b.position.timestamp).getTime() - new Date(a.position.timestamp).getTime();
    } else if (sortBy === "airline") {
      return (a.airline?.name || "").localeCompare(b.airline?.name || "");
    } else if (sortBy === "flightNumber") {
      return (a.flightNumber || a.callsign || "").localeCompare(b.flightNumber || b.callsign || "");
    } else if (sortBy === "departure") {
      const aTime = a.departure?.time ? new Date(a.departure.time).getTime() : 0;
      const bTime = b.departure?.time ? new Date(b.departure.time).getTime() : 0;
      return aTime - bTime;
    }
    return 0;
  });

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 h-screen overflow-y-auto border-l aviation-panel-sidebar">
      <div className="sticky top-0 z-10 p-4 aviation-glass backdrop-blur-md">
        <h2 className="font-bold text-lg bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(90deg, var(--aviation-blue-dark), var(--aviation-blue-medium))' }}>
          Flight Tracker
        </h2>
        <div className="flex justify-between items-center mt-2">
          <div className="aviation-data-highlight px-2 py-1 rounded-md text-xs">
            <span className="text-xs opacity-80">Showing</span>
            <span className="text-xs font-bold ml-1">{Array.isArray(flights) ? flights.length : 0}</span>
            <span className="text-xs opacity-80 ml-1">flights</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs mr-2 font-medium" style={{ color: 'var(--aviation-blue-dark)' }}>Sort:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger 
                className="text-xs rounded-full h-8 px-3 aviation-select-trigger"
                style={{ 
                  borderColor: 'rgba(85, 255, 221, 0.3)', 
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="aviation-select-content">
                <SelectItem value="updated" className="aviation-select-item">Recently Updated</SelectItem>
                <SelectItem value="airline" className="aviation-select-item">Airline</SelectItem>
                <SelectItem value="flightNumber" className="aviation-select-item">Flight Number</SelectItem>
                <SelectItem value="departure" className="aviation-select-item">Departure Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Tabs for All Flights and Favorites */}
      <Tabs defaultValue="all" className="w-full aviation-tabs">
        <div className="sticky top-[104px] z-10 aviation-glass px-2 py-1">
          <TabsList 
            className="w-full grid grid-cols-2 aviation-tabs-list"
            style={{ 
              background: 'rgba(10, 73, 149, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(85, 255, 221, 0.15)'
            }}
          >
            <TabsTrigger 
              value="all" 
              className="aviation-tab data-[state=active]:aviation-tab-active"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              All Flights
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="aviation-tab data-[state=active]:aviation-tab-active"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={favoriteFlights.length > 0 ? "var(--aviation-blue-light)" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Favorites
              {favoriteFlights.length > 0 && (
                <span 
                  className="ml-1.5 text-xs rounded-full h-5 w-5 flex items-center justify-center aviation-pulse"
                  style={{ 
                    background: 'linear-gradient(to right, var(--aviation-blue-accent), var(--aviation-teal-color))',
                    color: 'var(--aviation-blue-dark)',
                    fontWeight: 'bold',
                    boxShadow: '0 0 8px rgba(85, 255, 221, 0.5)'
                  }}
                >
                  {favoriteFlights.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="m-0">
          {renderFlightList(sortedFlights)}
        </TabsContent>
        
        <TabsContent value="favorites" className="m-0">
          {favoriteFlights.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-4">
              <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(10, 73, 149, 0.1), rgba(85, 255, 221, 0.1))' }}>
                <Star className="h-8 w-8" style={{ color: 'var(--aviation-blue-accent)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--aviation-blue-dark)' }}>No favorites yet</h3>
              <p className="text-sm text-center opacity-70 max-w-xs">
                Add flights to your favorites by clicking the star icon on any flight
              </p>
            </div>
          ) : (
            renderFlightList(sortedFavorites)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
