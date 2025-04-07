import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapFilter, LiveFlight } from "@/types";
import { Plane, Info, Clock, Navigation } from "lucide-react";

interface FlightPanelProps {
  flights: LiveFlight[];
  selectedFlight: LiveFlight | null;
  onSelectFlight: (flight: LiveFlight) => void;
  totalFlights: number;
}

export default function FlightPanel({ flights, selectedFlight, onSelectFlight, totalFlights }: FlightPanelProps) {
  return (
    <div className="w-full md:w-1/4 bg-white h-[calc(100vh-64px)] border-l overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-blue-500 font-semibold text-base flex items-center">
          <Plane className="h-4 w-4 mr-2" />
          Flight Tracker
        </h2>
        <p className="text-gray-500 text-xs mt-0.5">
          Showing {totalFlights} flights
        </p>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto">
        {flights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="rounded-full bg-blue-100 p-3 mb-3">
              <Info className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-gray-500 text-sm mb-1">No flights available</p>
            <p className="text-gray-400 text-xs">Either no flights match your filter criteria or we're waiting for data from the server.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {flights.map(flight => (
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