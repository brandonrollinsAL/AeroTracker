import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardWidget, LiveFlight, Airport, MapFilter } from '@shared/schema';
import FlightMap from '@/components/FlightMap';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Cloud, Plane, Info, Map, BarChart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define interfaces for our weather and stats data
interface WeatherData {
  location: string;
  temperature: number;
  conditions: string;
  wind: string;
  visibility: string;
  pressure: string;
  humidity: string;
}

interface StatsData {
  activeFlights: number;
  airports: number;
  avgAltitude: number;
  avgSpeed: number;
}

interface WidgetProps {
  widget: DashboardWidget;
  className?: string;
  onEditWidget?: (widget: DashboardWidget) => void;
  onDeleteWidget?: (widgetId: string) => void;
}

// This is the wrapper component that decides which specific widget to render
export function Widget({ widget, className, onEditWidget, onDeleteWidget }: WidgetProps) {
  let WidgetComponent: React.FC<WidgetProps>;

  // Select the right component based on widget type
  switch (widget.type) {
    case 'map':
      WidgetComponent = MapWidget;
      break;
    case 'flightList':
      WidgetComponent = FlightListWidget;
      break;
    case 'weatherInfo':
      WidgetComponent = WeatherInfoWidget;
      break;
    case 'airportInfo':
      WidgetComponent = AirportInfoWidget;
      break;
    case 'flightDetails':
      WidgetComponent = FlightDetailsWidget;
      break;
    case 'stats':
      WidgetComponent = StatsWidget;
      break;
    default:
      // Fallback to a basic widget if type is unknown
      WidgetComponent = BasicWidget;
  }

  return (
    <WidgetComponent 
      widget={widget} 
      className={className} 
      onEditWidget={onEditWidget} 
      onDeleteWidget={onDeleteWidget} 
    />
  );
}

// Basic widget component that just displays the widget title and type
export function BasicWidget({ widget, className }: WidgetProps) {
  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-muted-foreground text-xs">
          Widget type: {widget.type}
        </div>
      </CardContent>
    </Card>
  );
}

// Map widget that shows flight positions
export function MapWidget({ widget, className }: WidgetProps) {
  const { data: flights, isLoading } = useQuery<LiveFlight[]>({
    queryKey: ['/api/flights'],
    staleTime: 30000, // 30 seconds
  });

  // Use useState for selected flight
  const [selectedFlight, setSelectedFlight] = useState<LiveFlight | null>(null);
  
  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Map className="w-4 h-4 mr-2 text-primary" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative" style={{ height: '300px' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : flights && flights.length > 0 ? (
          // We're reusing the existing FlightMap component with customized settings
          <FlightMap 
            flights={flights}
            selectedFlight={selectedFlight}
            onFlightSelect={setSelectedFlight}
            filters={widget.settings?.filters as MapFilter || { type: 'all', showFlightPaths: true, showAirports: true }}
            onFilterChange={() => {}}
            isDarkMode={false}
            isConnected={true}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">No flight data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Flight list widget that shows a list of flights
export function FlightListWidget({ widget, className }: WidgetProps) {
  const { data: flights, isLoading } = useQuery<LiveFlight[]>({
    queryKey: ['/api/flights'],
    staleTime: 30000, // 30 seconds
  });

  // Apply filters from widget settings
  const filteredFlights = React.useMemo(() => {
    if (!flights) return [];
    
    let filtered = [...flights];
    
    // Apply widget-specific filters
    const filterSettings = widget.settings?.filters;
    if (filterSettings) {
      // Apply airline filter
      if (filterSettings.airline && typeof filterSettings.airline === 'string') {
        filtered = filtered.filter(f => {
          // Check if airline is an object with name property
          if (f.airline && typeof f.airline === 'object' && 'name' in f.airline && typeof f.airline.name === 'string') {
            return f.airline.name.toLowerCase().includes(filterSettings.airline.toLowerCase());
          }
          // If airline is a string (legacy format)
          else if (f.airline && typeof f.airline === 'string') {
            return f.airline.toLowerCase().includes(filterSettings.airline.toLowerCase());
          }
          return false;
        });
      }
      
      // Apply altitude filter
      if (filterSettings.minAltitude !== undefined && filterSettings.maxAltitude !== undefined) {
        filtered = filtered.filter(f => {
          const altitude = f.position?.altitude;
          if (altitude === undefined) return false;
          return altitude >= filterSettings.minAltitude! && altitude <= filterSettings.maxAltitude!;
        });
      }
      
      // Apply aircraft type filter
      if (filterSettings.aircraftType) {
        filtered = filtered.filter(f => {
          if (typeof f.aircraftType === 'string' && typeof filterSettings.aircraftType === 'string') {
            return f.aircraftType.toLowerCase().includes(filterSettings.aircraftType.toLowerCase());
          }
          return false;
        });
      }
    }
    
    // Apply sorting
    if (widget.settings?.sortBy) {
      const sortBy = widget.settings.sortBy;
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'callsign':
            return (a.callsign || '').localeCompare(b.callsign || '');
          case 'altitude':
            return (b.position?.altitude || 0) - (a.position?.altitude || 0);
          case 'speed':
            return (b.position?.groundSpeed || 0) - (a.position?.groundSpeed || 0);
          default:
            return 0;
        }
      });
    }
    
    // Limit the number of flights to display
    return filtered.slice(0, widget.settings?.maxItems || 10);
  }, [flights, widget.settings]);

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Plane className="w-4 h-4 mr-2 text-primary" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredFlights.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-1 divide-y">
              {filteredFlights.map((flight) => (
                <div key={flight.id} className="p-3 hover:bg-muted/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{flight.callsign || flight.flightNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {flight.departure?.icao} → {flight.arrival?.icao}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{flight.position?.altitude?.toLocaleString()} ft</div>
                      <div className="text-xs text-muted-foreground">
                        {flight.position?.groundSpeed} kts
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground text-sm">No flights match your criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Weather information widget
export function WeatherInfoWidget({ widget, className }: WidgetProps) {
  const locationCode = widget.settings?.locationCode || 'KJFK'; // Default to JFK if not set
  
  const { data: weatherData, isLoading } = useQuery<WeatherData>({
    queryKey: [`/api/weather/${locationCode}`],
    staleTime: 900000, // 15 minutes
  });

  return (
    <Card className={`${className}`}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Cloud className="w-4 h-4 mr-2 text-primary" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : weatherData ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">{locationCode}</h3>
                <p className="text-sm text-muted-foreground">
                  {weatherData.location || 'Weather Information'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{weatherData.temperature}°C</div>
                <Badge variant="outline">{weatherData.conditions}</Badge>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Wind</p>
                <p className="font-medium">{weatherData.wind || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Visibility</p>
                <p className="font-medium">{weatherData.visibility || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pressure</p>
                <p className="font-medium">{weatherData.pressure || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Humidity</p>
                <p className="font-medium">{weatherData.humidity || 'N/A'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No weather data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Airport information widget
export function AirportInfoWidget({ widget, className }: WidgetProps) {
  const airportCode = widget.settings?.airportCode || 'KJFK'; // Default to JFK if not set
  
  const { data: airport, isLoading } = useQuery<Airport>({
    queryKey: [`/api/airports/${airportCode}`],
    staleTime: 3600000, // 1 hour
  });

  return (
    <Card className={`${className}`}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Info className="w-4 h-4 mr-2 text-primary" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : airport ? (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{airport.code}</h3>
              <p className="text-sm text-muted-foreground">{airport.name}</p>
              <p className="text-sm text-muted-foreground">{airport.city}, {airport.country}</p>
            </div>
            
            <Separator className="my-3" />
            
            <div className="grid grid-cols-2 gap-3 text-sm mt-3">
              <div>
                <p className="text-muted-foreground">Latitude</p>
                <p className="font-medium">{airport.latitude?.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Longitude</p>
                <p className="font-medium">{airport.longitude?.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Elevation</p>
                <p className="font-medium">{airport.elevation || 'N/A'} ft</p>
              </div>
              <div>
                <p className="text-muted-foreground">Time Zone</p>
                <p className="font-medium">{airport.timeZone || 'N/A'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No airport data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Flight details widget
export function FlightDetailsWidget({ widget, className }: WidgetProps) {
  const flightId = widget.settings?.flightId;
  
  const { data: flight, isLoading } = useQuery<LiveFlight>({
    queryKey: [`/api/flights/${flightId}`],
    staleTime: 30000, // 30 seconds
    enabled: !!flightId,
  });

  return (
    <Card className={`${className}`}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Plane className="w-4 h-4 mr-2 text-primary" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : flight ? (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{flight.callsign || flight.flightNumber}</h3>
              <p className="text-sm text-muted-foreground">
                {typeof flight.airline === 'string' ? flight.airline : ''} {flight.flightNumber}
              </p>
              <div className="mt-2 flex justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-medium">{flight.departure?.icao}</p>
                  <p className="text-xs">{typeof flight.departure?.name === 'string' ? flight.departure.name : ''}</p>
                </div>
                <div className="text-center">
                  <Plane className="h-5 w-5 inline-block text-primary transform rotate-90" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">To</p>
                  <p className="font-medium">{flight.arrival?.icao}</p>
                  <p className="text-xs">{typeof flight.arrival?.name === 'string' ? flight.arrival.name : ''}</p>
                </div>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="grid grid-cols-2 gap-3 text-sm mt-3">
              <div>
                <p className="text-muted-foreground">Altitude</p>
                <p className="font-medium">{flight.position?.altitude?.toLocaleString() || 'N/A'} ft</p>
              </div>
              <div>
                <p className="text-muted-foreground">Speed</p>
                <p className="font-medium">{flight.position?.groundSpeed || 'N/A'} kts</p>
              </div>
              <div>
                <p className="text-muted-foreground">Heading</p>
                <p className="font-medium">{flight.position?.heading || 'N/A'}°</p>
              </div>
              <div>
                <p className="text-muted-foreground">Aircraft</p>
                <p className="font-medium">{flight.aircraftType || 'N/A'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              {flightId ? 'Flight not found' : 'No flight selected'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Statistics widget
export function StatsWidget({ widget, className }: WidgetProps) {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
    staleTime: 900000, // 15 minutes
  });

  return (
    <Card className={`${className}`}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <BarChart className="w-4 h-4 mr-2 text-primary" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-3 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Active Flights</p>
              <p className="text-2xl font-bold">{stats.activeFlights}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Airports</p>
              <p className="text-2xl font-bold">{stats.airports}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Avg. Altitude</p>
              <p className="text-2xl font-bold">{stats.avgAltitude}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Avg. Speed</p>
              <p className="text-2xl font-bold">{stats.avgSpeed}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No statistics available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}