import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FlightItem from "./FlightItem";
import { LiveFlight } from "@/types";
import { Skeleton } from '@/components/ui/skeleton';

interface FlightListProps {
  flights: LiveFlight[];
  onFlightSelect: (flight: LiveFlight) => void;
  isConnected: boolean;
}

export default function FlightList({ flights, onFlightSelect, isConnected }: FlightListProps) {
  const [sortBy, setSortBy] = useState<string>("updated");
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };
  
  // Sort flights based on selected sort criteria
  const sortedFlights = [...flights].sort((a, b) => {
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
    <div className="w-full md:w-1/3 lg:w-1/4 h-screen overflow-y-auto border-l border-neutral-200 bg-white">
      <div className="sticky top-0 bg-white z-10 border-b border-neutral-200 p-4">
        <h2 className="font-semibold text-neutral-800">Active Flights</h2>
        <div className="flex justify-between items-center mt-2">
          <div>
            <span className="text-xs text-neutral-500">Showing</span>
            <span className="text-xs font-medium ml-1">{flights.length}</span>
            <span className="text-xs text-neutral-500 ml-1">flights</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-neutral-600 mr-2">Sort:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="text-xs border border-neutral-200 rounded p-1 h-8">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Recently Updated</SelectItem>
                <SelectItem value="airline">Airline</SelectItem>
                <SelectItem value="flightNumber">Flight Number</SelectItem>
                <SelectItem value="departure">Departure Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {!isConnected ? (
        // Show loading skeletons when not connected
        Array(5).fill(0).map((_, index) => (
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
        ))
      ) : sortedFlights.length > 0 ? (
        // Show actual flight data
        sortedFlights.map((flight) => (
          <FlightItem 
            key={flight.id} 
            flight={flight} 
            onClick={() => onFlightSelect(flight)} 
          />
        ))
      ) : (
        // Show no flights message
        <div className="p-8 text-center text-neutral-500">
          <span className="material-icons text-4xl mb-2">flight_off</span>
          <p>No flights match the current filters</p>
        </div>
      )}
    </div>
  );
}
