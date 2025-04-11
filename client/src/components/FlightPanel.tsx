import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapFilter, LiveFlight } from "@/types";
import { 
  Plane, Info, Clock, Navigation, Search, Filter, 
  BarChart2, ArrowUpDown, Check, X, 
  MapPin, Layers, Cloud, RefreshCw, 
  AlertCircle, Locate, Tag
} from "lucide-react";
import FlightAnalytics from './FlightAnalytics';

interface FlightPanelProps {
  flights: LiveFlight[];
  selectedFlight: LiveFlight | null;
  onSelectFlight: (flight: LiveFlight) => void;
  totalFlights: number;
  filters: MapFilter;
  onFilterChange?: (filters: Partial<MapFilter>) => void;
}

export default function FlightPanel({ 
  flights, 
  selectedFlight, 
  onSelectFlight, 
  totalFlights, 
  filters,
  onFilterChange 
}: FlightPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'flights' | 'filters'>('flights');
  const [filterType, setFilterType] = useState<'all' | 'commercial' | 'private' | 'cargo'>(filters.type || 'all');
  const [sortBy, setSortBy] = useState<'airline' | 'altitude' | 'speed' | 'departure' | 'arrival' | 'time'>(filters.sortBy || 'airline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(filters.sortOrder || 'asc');
  const [minAltitude, setMinAltitude] = useState(0);
  const [maxAltitude, setMaxAltitude] = useState(50000);
  const [airlineFilter, setAirlineFilter] = useState(filters.airline || '');
  const [aircraftFilter, setAircraftFilter] = useState(filters.aircraft || '');
  const [tailNumberFilter, setTailNumberFilter] = useState(filters.tailNumber || '');
  
  // Effect to update parent component with filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        type: filterType as 'all' | 'commercial' | 'private' | 'cargo',
        airline: airlineFilter || undefined,
        aircraft: aircraftFilter || undefined,
        tailNumber: tailNumberFilter || undefined,
        sortBy: sortBy as any,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    }
  }, [filterType, airlineFilter, aircraftFilter, tailNumberFilter, sortBy, sortOrder, onFilterChange]);
  
  // Filter flights based on all criteria
  const filteredFlights = flights.filter(flight => {
    // Basic search term matching
    const matchesSearch = !searchTerm 
      || (flight.callsign && flight.callsign.toLowerCase().includes(searchTerm.toLowerCase()))
      || (flight.flightNumber && flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      || (flight.departure?.icao && flight.departure.icao.toLowerCase().includes(searchTerm.toLowerCase()))
      || (flight.arrival?.icao && flight.arrival.icao.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Type filter
    const matchesType = filterType === 'all' || 
      (filterType === 'commercial' && flight.aircraftType?.includes('airliner')) || 
      (filterType === 'private' && flight.aircraftType?.includes('private')) || 
      (filterType === 'cargo' && flight.aircraftType?.includes('cargo'));
    
    // Airline filter
    const matchesAirline = !airlineFilter || (
      typeof flight.airline === 'string' && flight.airline.toLowerCase().includes(airlineFilter.toLowerCase())
    );
    
    // Aircraft type filter
    const matchesAircraft = !aircraftFilter || (
      typeof flight.aircraftType === 'string' && flight.aircraftType.toLowerCase().includes(aircraftFilter.toLowerCase())
    );
    
    // Tail number filter
    const matchesTailNumber = !tailNumberFilter || (
      typeof flight.registration === 'string' && flight.registration.toLowerCase().includes(tailNumberFilter.toLowerCase())
    );
    
    // Altitude filter
    const matchesAltitude = !flight.position?.altitude || (
      flight.position.altitude >= minAltitude && flight.position.altitude <= maxAltitude
    );
    
    return matchesSearch && matchesType && matchesAirline && matchesAircraft && matchesTailNumber && matchesAltitude;
  });

  // Sort flights based on sort criteria
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    if (sortBy === 'airline') {
      const airlineA = typeof a.airline === 'string' ? a.airline : '';
      const airlineB = typeof b.airline === 'string' ? b.airline : '';
      return sortOrder === 'asc' ? airlineA.localeCompare(airlineB) : airlineB.localeCompare(airlineA);
    } else if (sortBy === 'altitude') {
      const altA = a.position?.altitude || 0;
      const altB = b.position?.altitude || 0;
      return sortOrder === 'asc' ? altA - altB : altB - altA;
    } else if (sortBy === 'speed') {
      const speedA = a.position?.groundSpeed || 0;
      const speedB = b.position?.groundSpeed || 0;
      return sortOrder === 'asc' ? speedA - speedB : speedB - speedA;
    } else if (sortBy === 'departure') {
      const depA = a.departure?.icao || '';
      const depB = b.departure?.icao || '';
      return sortOrder === 'asc' ? depA.localeCompare(depB) : depB.localeCompare(depA);
    } else if (sortBy === 'arrival') {
      const arrA = a.arrival?.icao || '';
      const arrB = b.arrival?.icao || '';
      return sortOrder === 'asc' ? arrA.localeCompare(arrB) : arrB.localeCompare(arrA);
    }
    return 0;
  });

  // Helper function to toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  return (
    <div className="w-full md:w-1/3 bg-white h-[calc(100vh-64px)] border-l overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-blue-50">
        <div className="flex justify-between items-center">
          <h2 className="text-blue-600 font-semibold text-base flex items-center">
            <Plane className="h-4 w-4 mr-2" />
            Flight Tracker
          </h2>
          
          <FlightAnalytics 
            flights={flights} 
            filters={filters}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="mt-3">
          <TabsList className="grid grid-cols-2 w-full bg-blue-100">
            <TabsTrigger value="flights" className="text-sm">
              <Plane className="h-3.5 w-3.5 mr-1.5" />
              Flights
            </TabsTrigger>
            <TabsTrigger value="filters" className="text-sm">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filters
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="flights" className="mt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search flights..."
                className="h-9 pl-8 text-sm rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-1">
                <Select
                  value={filterType}
                  onValueChange={(value) => setFilterType(value)}
                >
                  <SelectTrigger className="h-8 text-xs w-[110px]">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Flights</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="cargo">Cargo</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                >
                  <SelectTrigger className="h-8 text-xs w-[110px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="airline">Airline</SelectItem>
                    <SelectItem value="altitude">Altitude</SelectItem>
                    <SelectItem value="speed">Speed</SelectItem>
                    <SelectItem value="departure">Departure</SelectItem>
                    <SelectItem value="arrival">Arrival</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={toggleSortOrder}
              >
                <ArrowUpDown className={`h-4 w-4 ${sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
              </Button>
            </div>
            
            <p className="text-gray-500 text-xs mt-2">
              Showing {sortedFlights.length} of {totalFlights} flights
            </p>
          </TabsContent>
          
          <TabsContent value="filters" className="mt-2 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="airline-filter" className="text-xs font-medium text-gray-600">
                Airline
              </Label>
              <Input 
                id="airline-filter" 
                placeholder="Filter by airline name or code" 
                className="h-8 text-sm rounded-md"
                value={airlineFilter}
                onChange={(e) => setAirlineFilter(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="aircraft-filter" className="text-xs font-medium text-gray-600">
                Aircraft Type
              </Label>
              <Input 
                id="aircraft-filter" 
                placeholder="E.g., B737, A320" 
                className="h-8 text-sm rounded-md"
                value={aircraftFilter}
                onChange={(e) => setAircraftFilter(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="tailnumber-filter" className="text-xs font-medium text-gray-600">
                Tail Number
              </Label>
              <Input 
                id="tailnumber-filter" 
                placeholder="Registration code" 
                className="h-8 text-sm rounded-md"
                value={tailNumberFilter}
                onChange={(e) => setTailNumberFilter(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium text-gray-600">
                  Altitude Range
                </Label>
                <span className="text-xs text-gray-500">
                  {minAltitude.toLocaleString()} - {maxAltitude.toLocaleString()} ft
                </span>
              </div>
              <Slider
                min={0}
                max={50000}
                step={1000}
                value={[minAltitude, maxAltitude]}
                onValueChange={([min, max]) => {
                  setMinAltitude(min);
                  setMaxAltitude(max);
                }}
                className="my-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label 
                htmlFor="livetracking-toggle" 
                className="text-xs font-medium text-gray-600"
              >
                Show Live Tracking
              </Label>
              <Switch
                id="livetracking-toggle"
                checked={filters.showLiveTracking}
                onCheckedChange={(checked) => onFilterChange?.({ showLiveTracking: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label 
                htmlFor="flightpaths-toggle" 
                className="text-xs font-medium text-gray-600"
              >
                Show Flight Paths
              </Label>
              <Switch
                id="flightpaths-toggle"
                checked={filters.showFlightPaths}
                onCheckedChange={(checked) => onFilterChange?.({ showFlightPaths: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label 
                htmlFor="airports-toggle" 
                className="text-xs font-medium text-gray-600"
              >
                Show Airports
              </Label>
              <Switch
                id="airports-toggle"
                checked={filters.showAirports}
                onCheckedChange={(checked) => onFilterChange?.({ showAirports: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label 
                htmlFor="weather-toggle" 
                className="text-xs font-medium text-gray-600"
              >
                Show Weather
              </Label>
              <Switch
                id="weather-toggle"
                checked={filters.showWeather}
                onCheckedChange={(checked) => onFilterChange?.({ showWeather: checked })}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto">
        {sortedFlights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="rounded-full bg-blue-100 p-3 mb-3">
              <Info className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-gray-500 text-sm mb-1">No flights available</p>
            <p className="text-gray-400 text-xs">Either no flights match your filter criteria or we're waiting for data from the server.</p>
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {sortedFlights.map(flight => (
              <Card 
                key={flight.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedFlight?.id === flight.id ? 'border-blue-500 shadow-blue-100' : 'border-gray-200'
                }`}
                onClick={() => onSelectFlight(flight)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-sm text-blue-800">
                      {flight.callsign || flight.flightNumber}
                      {flight.airline && (
                        <span className="text-xs font-normal text-blue-600 ml-1.5">
                          ({flight.airline})
                        </span>
                      )}
                    </div>
                    <Badge className={`text-xs px-1.5 py-0.5 ${
                      flight.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                      flight.status === 'delayed' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-100'
                    }`}>
                      {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center mb-2.5">
                    <div className="flex-1 pr-2 border-r border-gray-200">
                      <div className="text-xs text-gray-500">From</div>
                      <div className="text-sm font-medium">{flight.departure?.icao || 'N/A'}</div>
                    </div>
                    <div className="flex-1 pl-2">
                      <div className="text-xs text-gray-500">To</div>
                      <div className="text-sm font-medium">{flight.arrival?.icao || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500 mb-0.5">Altitude</div>
                      <div className="font-medium">{flight.position?.altitude?.toLocaleString() || 'N/A'} ft</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-0.5">Speed</div>
                      <div className="font-medium">{flight.position?.groundSpeed || 'N/A'} kts</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-0.5">Aircraft</div>
                      <div className="font-medium">{flight.aircraftType || 'Unknown'}</div>
                    </div>
                  </div>
                  
                  {flight.registration && (
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Tag className="h-3 w-3 mr-1" />
                      Registration: <span className="font-medium ml-1">{flight.registration}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}