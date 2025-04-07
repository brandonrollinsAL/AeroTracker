import React from 'react';
import { Button } from "@/components/ui/button";
import { LiveFlight, MapFilter } from '@shared/schema';
import { BarChart2, ChevronRight } from 'lucide-react';

interface FlightAnalyticsProps {
  flights: LiveFlight[];
  filters: MapFilter;
}

export default function FlightAnalytics({ flights, filters }: FlightAnalyticsProps) {
  // Calculate basic statistics
  const activeFlights = flights.filter(flight => flight.status === 'active').length;
  const delayedFlights = flights.filter(flight => flight.status === 'delayed').length;
  const currentFilterType = filters.type.charAt(0).toUpperCase() + filters.type.slice(1);
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      className="rounded-md h-8 px-3 border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100"
      onClick={() => window.alert(`Flight Analytics Summary (${currentFilterType})\n\nActive Flights: ${activeFlights}\nDelayed Flights: ${delayedFlights}\n\nFull analytics dashboard coming soon!`)}
    >
      <BarChart2 className="h-3 w-3 mr-1.5" />
      Flight Stats
      <ChevronRight className="h-3 w-3 ml-1" />
    </Button>
  );
}