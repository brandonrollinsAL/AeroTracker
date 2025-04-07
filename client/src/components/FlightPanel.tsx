import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapFilter, LiveFlight } from "@/types";
import { Plane, Info, Clock, Navigation, Search, Filter, BarChart2 } from "lucide-react";
import FlightAnalytics from './FlightAnalytics';

interface FlightPanelProps {
  flights: LiveFlight[];
  selectedFlight: LiveFlight | null;
  onSelectFlight: (flight: LiveFlight) => void;
  totalFlights: number;
  filters: MapFilter;
}

export default function FlightPanel({ flights, selectedFlight, onSelectFlight, totalFlights, filters }: FlightPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Filter flights based on search term and filter type
  const filteredFlights = flights.filter(flight => {
    const matchesSearch = !searchTerm 
      || (flight.callsign && flight.callsign.toLowerCase().includes(searchTerm.toLowerCase()))
      || (flight.flightNumber && flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      || (flight.departure?.icao && flight.departure.icao.toLowerCase().includes(searchTerm.toLowerCase()))
      || (flight.arrival?.icao && flight.arrival.icao.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return matchesSearch;
  });

  return (
    <div className="w-full md:w-1/4 bg-white h-[calc(100vh-64px)] border-l overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-blue-500 font-semibold text-base flex items-center">
            <Plane className="h-4 w-4 mr-2" />
            Flight Tracker
          </h2>
          
          <FlightAnalytics 
            flights={flights} 
            filters={filters}
          />
        </div>
        
        <div className="flex items-center mt-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search flights..."
              className="h-8 pl-8 text-sm rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <p className="text-gray-500 text-xs mt-2">
          Showing {filteredFlights.length} of {totalFlights} flights
        </p>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto">
        {filteredFlights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="rounded-full bg-blue-100 p-3 mb-3">
              <Info className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-gray-500 text-sm mb-1">No flights available</p>
            <p className="text-gray-400 text-xs">Either no flights match your filter criteria or we're waiting for data from the server.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFlights.map(flight => (
              <Card 
                key={flight.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedFlight?.id === flight.id ? 'border-blue-500 shadow-sm' : 'border-gray-200'
                }`}
                onClick={() => onSelectFlight(flight)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-sm">
                      {flight.callsign || flight.flightNumber}
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      flight.status === 'active' ? 'bg-green-100 text-green-700' :
                      flight.status === 'delayed' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex-1 pr-1 border-r border-gray-200">
                      <div className="text-xs text-gray-500">From</div>
                      <div className="text-sm">{flight.departure?.icao || 'N/A'}</div>
                    </div>
                    <div className="flex-1 pl-2">
                      <div className="text-xs text-gray-500">To</div>
                      <div className="text-sm">{flight.arrival?.icao || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">Altitude</div>
                      <div>{flight.position.altitude.toLocaleString()} ft</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Speed</div>
                      <div>{flight.position.groundSpeed} mph</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Aircraft</div>
                      <div>{flight.aircraftType || 'Unknown'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}