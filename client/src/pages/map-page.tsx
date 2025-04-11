import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { LiveFlight } from '@shared/schema';
import { Loader2, ArrowLeft, Info, Layers, Filter, SquareStack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Define a type for map filter options
type MapFilterType = 'all' | 'commercial' | 'private' | 'cargo' | 'favorites';

// Fix for Leaflet marker icon - normally we'd use webpack but we're using Vite
// This would typically be in a separate file but including it here for simplicity
const createAircraftIcon = (heading: number = 0) => {
  // Create a custom icon that works with TypeScript
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iaC1mdWxsIHctZnVsbCI+PHBhdGggZD0iTTIyIDE2LjkydjNhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNSAxOS41IDAgMCAxLTYtNiAxOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjdBMiAyIDAgMCAxIDQuMTEgMmgzYTIgMiAwIDAgMSAyIDEuNzIgMTIuODQgMTIuODQgMCAwIDAgLjcgMi44MSAyIDIgMCAwIDEtLjQ1IDIuMTFMOC4wOSA5LjkxYTE2IDE2IDAgMCAwIDYgNmwxLjI3LTEuMjdhMiAyIDAgMCAxIDIuMTEtLjQ1IDEyLjg0IDEyLjg0IDAgMCAwIDIuODEuN0EyIDIgMCAwIDEgMjIgMTYuOTJ6Ij48L3BhdGg+PC9zdmc+',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: `aircraft-icon rotate-${Math.round(heading / 15) * 15}`,
    // Add rotation via CSS class instead of inline style
  });
};

// Component to center map on a specific flight
const MapCenterAdjuster = ({ flight }: { flight?: LiveFlight }) => {
  const map = useMap();
  
  useEffect(() => {
    if (flight && flight.position) {
      map.setView(
        [flight.position.latitude, flight.position.longitude],
        10, // zoom level
        { animate: true }
      );
    }
  }, [flight, map]);
  
  return null;
};

export default function MapPage() {
  const [, setLocation] = useLocation();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const flightId = searchParams.get('flight');
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<MapFilterType>('all');
  const [showLabels, setShowLabels] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<LiveFlight | null>(null);
  
  // Fetch all flights
  const { data: flights, isLoading: isLoadingFlights } = useQuery<LiveFlight[]>({
    queryKey: ['/api/flights', filterType],
    staleTime: 30000, // 30 seconds
  });
  
  // Fetch specific flight details if flightId is provided
  const { data: highlightedFlight, isLoading: isLoadingHighlightedFlight } = useQuery<LiveFlight>({
    queryKey: [`/api/flights/${flightId}`],
    staleTime: 30000, // 30 seconds
    enabled: !!flightId,
  });
  
  useEffect(() => {
    if (highlightedFlight) {
      setSelectedFlight(highlightedFlight);
    }
  }, [highlightedFlight]);
  
  // Handle errors
  useEffect(() => {
    if (!flights && !isLoadingFlights) {
      toast({
        title: 'Error',
        description: 'Could not fetch flight data. Please try again.',
        variant: 'destructive',
      });
    }
  }, [flights, isLoadingFlights, toast]);
  
  // Format altitude for display
  const formatAltitude = (altitude?: number) => {
    if (altitude === undefined) return 'N/A';
    return altitude.toLocaleString() + ' ft';
  };
  
  // Format speed for display
  const formatSpeed = (speed?: number) => {
    if (speed === undefined) return 'N/A';
    return speed + ' kts';
  };
  
  // Get airline name from flight data
  const getAirlineName = (flight?: LiveFlight) => {
    if (!flight) return 'Unknown Airline';
    if (typeof flight.airline === 'string') return flight.airline;
    if (flight.airline && 'name' in flight.airline) return flight.airline.name;
    return flight.callsign || flight.flightNumber || 'Unknown Flight';
  };
  
  // Handle flight selection
  const handleFlightSelect = (flight: LiveFlight) => {
    setSelectedFlight(flight);
  };
  
  // Handle view details button click
  const handleViewDetails = (flightId: string) => {
    setLocation(`/flight-details?flight=${flightId}`);
  };
  
  // Handle back button click
  const handleBack = () => {
    setLocation('/');
  };
  
  // Apply filters to flights
  const filteredFlights = flights?.filter(flight => {
    if (filterType === 'all') return true;
    
    if (filterType === 'commercial') {
      // Commercial flights usually have airline info
      return flight.airline !== undefined;
    }
    
    if (filterType === 'private') {
      // Private flights often have no airline info
      return flight.airline === undefined;
    }
    
    if (filterType === 'cargo') {
      // This is a simplistic filter - in reality you'd check for cargo airlines
      const cargoAirlines = ['FDX', 'UPS', 'ABX', 'GTI', 'CLX'];
      return cargoAirlines.some(code => flight.callsign?.startsWith(code));
    }
    
    return true;
  });

  if (isLoadingFlights && !flights) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Map Header */}
      <div className="p-4 flex justify-between items-center bg-white dark:bg-background border-b">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleBack} className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Live Flight Map</h1>
        </div>
        
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter Flights</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Select value={filterType} onValueChange={(value) => setFilterType(value as MapFilterType)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter Flights" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Flights</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="cargo">Cargo</SelectItem>
            </SelectContent>
          </Select>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Layers className="h-4 w-4 mr-2" />
                Map Layers
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Map Options</SheetTitle>
                <SheetDescription>
                  Customize how the map displays flights and information.
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-labels">Show Flight Labels</Label>
                  <Switch 
                    id="show-labels" 
                    checked={showLabels}
                    onCheckedChange={setShowLabels}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Map Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start" size="sm">
                      Standard
                    </Button>
                    <Button variant="outline" className="justify-start" size="sm">
                      Satellite
                    </Button>
                    <Button variant="outline" className="justify-start" size="sm">
                      Dark
                    </Button>
                    <Button variant="outline" className="justify-start" size="sm">
                      Terrain
                    </Button>
                  </div>
                </div>
              </div>
              
              <SheetFooter>
                <Button variant="outline">Reset to Defaults</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SquareStack className="h-4 w-4 mr-2" />
                Flight List
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Active Flights</SheetTitle>
                <SheetDescription>
                  {filteredFlights?.length || 0} flights currently visible on the map.
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-4">
                <div className="space-y-1 h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                  {filteredFlights?.map(flight => (
                    <div 
                      key={flight.id}
                      className={`p-3 rounded-md hover:bg-muted cursor-pointer transition-colors ${
                        selectedFlight?.id === flight.id ? 'bg-primary/10 border border-primary/20' : ''
                      }`}
                      onClick={() => handleFlightSelect(flight)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{flight.callsign || flight.flightNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {getAirlineName(flight)}
                          </p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {formatAltitude(flight.position?.altitude)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {formatSpeed(flight.position?.groundSpeed)}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(flight.id);
                          }}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredFlights?.length === 0 && (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-muted-foreground">No flights match your filter criteria</p>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={[38.0, -97.0]} // Center of USA by default
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false} // We'll add custom controls
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Add markers for each flight */}
          {filteredFlights?.map(flight => {
            if (!flight.position) return null;
            
            return (
              <Marker
                key={flight.id}
                position={[flight.position.latitude, flight.position.longitude]}
                icon={createAircraftIcon(flight.position.heading)}
                eventHandlers={{
                  click: () => setSelectedFlight(flight),
                }}
              >
                {showLabels && (
                  <Popup>
                    <div className="p-1">
                      <p className="font-bold">{flight.callsign || flight.flightNumber}</p>
                      <p className="text-xs">{getAirlineName(flight)}</p>
                      <Separator className="my-1" />
                      <div className="grid grid-cols-2 gap-x-4 text-xs">
                        <p>Altitude: {formatAltitude(flight.position.altitude)}</p>
                        <p>Speed: {formatSpeed(flight.position.groundSpeed)}</p>
                        <p>From: {flight.departure?.icao || 'N/A'}</p>
                        <p>To: {flight.arrival?.icao || 'N/A'}</p>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleViewDetails(flight.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Popup>
                )}
              </Marker>
            );
          })}
          
          {/* If specific flight is highlighted, center the map on it */}
          {highlightedFlight && highlightedFlight.position && (
            <MapCenterAdjuster flight={highlightedFlight} />
          )}
        </MapContainer>
        
        {/* Flight Info Overlay */}
        {selectedFlight && (
          <Card className="absolute bottom-4 left-4 w-80 z-[1000] shadow-lg">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{selectedFlight.callsign || selectedFlight.flightNumber}</h3>
                  <p className="text-xs text-muted-foreground">
                    {getAirlineName(selectedFlight)} • {selectedFlight.aircraftType || 'Unknown Aircraft'}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedFlight(null)}
                  className="h-6 w-6 p-0"
                >
                  ✕
                </Button>
              </div>
              
              <Separator className="my-2" />
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Altitude</p>
                  <p>{formatAltitude(selectedFlight.position?.altitude)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Speed</p>
                  <p>{formatSpeed(selectedFlight.position?.groundSpeed)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p>{selectedFlight.departure?.icao || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">To</p>
                  <p>{selectedFlight.arrival?.icao || 'N/A'}</p>
                </div>
              </div>
              
              <Button 
                className="w-full mt-3" 
                size="sm"
                onClick={() => handleViewDetails(selectedFlight.id)}
              >
                View Full Details
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}