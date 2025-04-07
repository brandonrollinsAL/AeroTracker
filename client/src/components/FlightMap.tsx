import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapControls from './MapControls';
import MapFilters from './MapFilters';
import AirportMarker from './AirportMarker';
import { LiveFlight, MapFilter, Airport } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Info, Zap, Wind, Eye, Layers, Maximize, Minimize, FullscreenIcon } from 'lucide-react';
import axios from 'axios';

// Fix the default icon issue with Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom airplane icon
const createAirplaneIcon = (heading: number) => {
  return L.divIcon({
    html: `<span class="material-icons text-primary" style="transform: rotate(${heading}deg)">flight</span>`,
    className: 'airplane-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

interface FlightMapProps {
  flights: LiveFlight[];
  selectedFlight: LiveFlight | null;
  onFlightSelect: (flight: LiveFlight) => void;
  filters: MapFilter;
  onFilterChange: (filters: Partial<MapFilter>) => void;
  isConnected: boolean;
  isDarkMode?: boolean;
}

// Component to update the map view if selectedFlight changes
function MapUpdater({ flight }: { flight: LiveFlight | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (flight) {
      map.setView(
        [flight.position.latitude, flight.position.longitude],
        10,
        { animate: true }
      );
    }
  }, [map, flight]);
  
  return null;
}

// Component to handle direct map control
function MapControlButtons({ 
  isDarkMode, 
  toggleFullscreen, 
  isFullscreen,
  showFlightTrails,
  toggleFlightTrails
}: { 
  isDarkMode: boolean,
  toggleFullscreen: () => void,
  isFullscreen: boolean,
  showFlightTrails: boolean,
  toggleFlightTrails: () => void
}) {
  const map = useMap();
  
  const handleZoomIn = () => {
    map.zoomIn();
  };
  
  const handleZoomOut = () => {
    map.zoomOut();
  };
  
  const handleMyLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      map.setView(
        [position.coords.latitude, position.coords.longitude],
        10,
        { animate: true }
      );
    }, (error) => {
      console.error('Error getting location:', error);
    });
  };
  
  const buttonClass = isDarkMode 
    ? "bg-neutral-800 rounded-full shadow-md hover:bg-neutral-700 h-9 w-9 border-neutral-700" 
    : "bg-white rounded-full shadow-md hover:bg-neutral-100 h-9 w-9";
    
  const iconClass = isDarkMode ? "text-neutral-200" : "text-neutral-800";
  
  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[900]">
      <TooltipProvider>
        <UITooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={buttonClass}
              onClick={handleZoomIn}
            >
              <span className={`material-icons ${iconClass}`}>add</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">Zoom in</p>
          </TooltipContent>
        </UITooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <UITooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={buttonClass}
              onClick={handleZoomOut}
            >
              <span className={`material-icons ${iconClass}`}>remove</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">Zoom out</p>
          </TooltipContent>
        </UITooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <UITooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={buttonClass}
              onClick={toggleFlightTrails}
            >
              <span className={`material-icons ${iconClass} ${showFlightTrails ? 'text-primary' : ''}`}>
                timeline
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">{showFlightTrails ? 'Hide' : 'Show'} flight trails</p>
          </TooltipContent>
        </UITooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <UITooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={buttonClass}
              onClick={handleMyLocation}
            >
              <span className={`material-icons ${iconClass}`}>my_location</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">Go to my location</p>
          </TooltipContent>
        </UITooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <UITooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={buttonClass}
              onClick={toggleFullscreen}
            >
              <span className={`material-icons ${iconClass}`}>
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">{isFullscreen ? 'Exit' : 'Enter'} fullscreen</p>
          </TooltipContent>
        </UITooltip>
      </TooltipProvider>
    </div>
  );
}

export default function FlightMap({ 
  flights, 
  selectedFlight, 
  onFlightSelect,
  filters,
  onFilterChange,
  isConnected,
  isDarkMode = false
}: FlightMapProps) {
  const mapRef = useRef<L.Map>(null);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loadingAirports, setLoadingAirports] = useState(false);
  
  // Default center if no flights are available
  const defaultCenter: [number, number] = [37.0902, -95.7129]; // US center
  const defaultZoom = 5;

  // Fetch airports when showAirports is enabled
  useEffect(() => {
    if (filters.showAirports && airports.length === 0) {
      setLoadingAirports(true);
      
      axios.get('/api/airports')
        .then(response => {
          setAirports(response.data);
        })
        .catch(error => {
          console.error('Error fetching airports:', error);
        })
        .finally(() => {
          setLoadingAirports(false);
        });
    }
  }, [filters.showAirports, airports.length]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleMyLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      mapRef.current?.setView(
        [position.coords.latitude, position.coords.longitude],
        10,
        { animate: true }
      );
    }, (error) => {
      console.error('Error getting location:', error);
    });
  };

  // State for fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFlightTrails, setShowFlightTrails] = useState(filters.showFlightPaths);
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };
  
  // Generate flight path for a selected flight
  const generateFlightPath = (flight: LiveFlight): [number, number][] => {
    // For demonstration only - in a real app, this would use actual flight path data
    // For now, we'll create a simple path based on current position and planned departure/arrival
    const path: [number, number][] = [];
    
    if (flight.departure?.icao && flight.position) {
      // Simulate a departure location (for demo purposes)
      const departureLocation: [number, number] = [
        flight.position.latitude - 2,
        flight.position.longitude - 2
      ];
      
      path.push(departureLocation);
    }
    
    // Add current position
    path.push([flight.position.latitude, flight.position.longitude]);
    
    if (flight.arrival?.icao) {
      // Simulate an arrival location (for demo purposes)
      const arrivalLocation: [number, number] = [
        flight.position.latitude + 2,
        flight.position.longitude + 2
      ];
      
      path.push(arrivalLocation);
    }
    
    return path;
  };

  return (
    <div className={`w-full md:w-2/3 lg:w-3/4 relative h-[50vh] md:h-[calc(100vh-4rem)] p-2 ${
      isDarkMode ? 'bg-neutral-900' : 'bg-white'
    } ${isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen p-0' : ''}`}>
      <div className={`w-full h-full ${isDarkMode ? 'bg-neutral-900' : 'bg-white'} rounded-sm overflow-hidden`}>
        {!isConnected && (
          <Alert variant="destructive" className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Connecting to flight data server...</AlertDescription>
          </Alert>
        )}
        
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {flights.map((flight) => (
            <React.Fragment key={flight.id}>
              <Marker
                position={[flight.position.latitude, flight.position.longitude]}
                icon={createAirplaneIcon(flight.position.heading)}
                eventHandlers={{
                  click: () => onFlightSelect(flight)
                }}
              >
                <Tooltip direction="top" offset={[0, -20]} permanent={selectedFlight?.id === flight.id}>
                  <div className="text-xs font-medium">
                    {flight.callsign || flight.flightNumber}
                  </div>
                </Tooltip>
                
                <Popup>
                  <div className="text-sm">
                    <div className="font-bold">{flight.callsign || flight.flightNumber}</div>
                    <div>{flight.departure?.icao} → {flight.arrival?.icao}</div>
                    <div>Alt: {flight.position.altitude.toLocaleString()} ft</div>
                    <div>Speed: {flight.position.groundSpeed} mph</div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onFlightSelect(flight)}
                      className="mt-2 w-full"
                    >
                      <span className="material-icons mr-1 text-sm">info</span>
                      Details
                    </Button>
                  </div>
                </Popup>
              </Marker>
              
              {/* Add flight path if enabled and flight has a route */}
              {showFlightTrails && (
                <Polyline 
                  positions={generateFlightPath(flight)}
                  pathOptions={{ 
                    color: selectedFlight?.id === flight.id ? '#3b82f6' : '#94a3b8',
                    weight: selectedFlight?.id === flight.id ? 3 : 2,
                    dashArray: selectedFlight?.id === flight.id ? '' : '5, 5',
                    opacity: selectedFlight?.id === flight.id ? 0.8 : 0.5
                  }}
                />
              )}
            </React.Fragment>
          ))}
          
          {/* Display airports if enabled */}
          {filters.showAirports && airports.map(airport => (
            <AirportMarker key={airport.id} airport={airport} />
          ))}
          
          {/* Weather overlay would go here if enabled */}
          {filters.showWeather && (
            // This would be a weather overlay component
            <></>
          )}
          
          {/* Loading indicator for airports */}
          {loadingAirports && (
            <div className="absolute top-4 right-4 bg-white rounded-md shadow-md p-2 z-[1000]">
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="text-xs text-neutral-700">Loading airports...</span>
              </div>
            </div>
          )}
          
          <MapUpdater flight={selectedFlight} />
          <MapControlButtons 
            isDarkMode={isDarkMode}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            showFlightTrails={showFlightTrails}
            toggleFlightTrails={() => {
              setShowFlightTrails(!showFlightTrails);
              onFilterChange({ showFlightPaths: !showFlightTrails });
            }}
          />
        </MapContainer>
        
        <MapFilters 
          filters={filters} 
          onFilterChange={onFilterChange}
        />
      </div>
    </div>
  );
}