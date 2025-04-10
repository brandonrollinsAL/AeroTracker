import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FlightMapProvider } from '@/hooks/use-flight-map-context';
import { MapZoomMonitor } from './MapZoomMonitor';
import MapZoomBoundsMonitor from './MapZoomBoundsMonitor';
import MapControls from './MapControls';
import AirportMarker from './AirportMarker';
import WeatherOverlay from './WeatherOverlay';
import WeatherImpactPanel from './WeatherImpactPanel';
import { NexradRadarOverlay } from './NexradRadarOverlay';
import ClusteredFlightLayer from './ClusteredFlightLayer';
import { LiveFlight, MapFilter, Airport } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Info, Zap, Wind, Eye, Layers, Maximize, Minimize, FullscreenIcon, CloudRain } from 'lucide-react';
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

// Custom airplane icon with aviation blues - following the new design system
const createAirplaneIcon = (heading: number, isSelected: boolean = false, altitude: number = 0) => {
  // Calculate color based on altitude following aviation standards
  // Low altitude: use accent orange for better visibility near ground
  // Medium altitude: use primary medium blue
  // High altitude: use primary dark blue
  const altitudePercent = Math.min(Math.max(altitude / 40000, 0), 1); // Normalize between 0-40,000 ft
  
  let iconColor: string;
  let iconSize: number = isSelected ? 36 : 30;
  let iconClass: string = isSelected ? 'airplane-icon selected' : 'airplane-icon';
  let glowEffect: string = '';
  let altitudeClass: string = '';
  
  if (isSelected) {
    // Selected flights use the orange accent with glow for better visibility
    iconColor = '#F97316'; // Aviation accent orange
    glowEffect = 'filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.7));';
  } else {
    // Color scheme based on aviation altitude standards
    if (altitudePercent < 0.2) {
      iconColor = '#F97316'; // Low altitude - accent orange for visibility
      altitudeClass = 'altitude-low';
    } else if (altitudePercent < 0.5) {
      iconColor = '#3B82F6'; // Medium altitude - medium blue
      altitudeClass = 'altitude-medium';
    } else {
      iconColor = '#1E3A8A'; // High altitude - dark blue
      altitudeClass = 'altitude-high';
    }
  }
  
  // Enhanced accessible SVG with proper aria attributes for better SEO
  return L.divIcon({
    html: `
      <div class="${iconClass} ${altitudeClass}" style="transform: rotate(${heading}deg); ${glowEffect}" 
           role="img" aria-label="Aircraft at ${Math.round(altitude)} feet altitude, heading ${Math.round(heading)} degrees">
        <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" 
             xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <title>Aircraft</title>
          <desc>Aircraft icon showing flight direction and altitude</desc>
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" 
                fill="${iconColor}" />
        </svg>
        ${isSelected ? '<span class="pulse-circle"></span>' : ''}
      </div>
    `,
    className: `custom-airplane-icon ${isSelected ? 'selected-aircraft' : ''}`,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize/2]
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
        [flight.position?.latitude || 0, flight.position?.longitude || 0],
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
  
  return (
    <div className="map-controls">
      <div className="aviation-glass p-1.5 rounded-xl backdrop-blur-md flex flex-col space-y-2 border border-[#4995fd]/30">
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <Button 
                className="map-control-button"
                onClick={handleZoomIn}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="aviation-tooltip">
              <p className="text-xs font-medium">Zoom in</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <Button 
                className="map-control-button"
                onClick={handleZoomOut}
              >
                <Minimize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="aviation-tooltip">
              <p className="text-xs font-medium">Zoom out</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <Button 
                className="map-control-button"
                onClick={() => {
                  // This button now does nothing since we only show paths for selected flights
                  // This is just a placeholder for the button UI
                }}
                disabled={true}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                  <path d="M17 3l-5 5.5L8 7l-5 5"/>
                  <path d="M15 3h2v2"/>
                  <path d="M3 12h2v2"/>
                  <path d="M17 17l-5 5.5-4-1.5-5-5"/>
                  <path d="M15 17h2v2"/>
                  <path d="M3 8h2v2"/>
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="aviation-tooltip">
              <p className="text-xs font-medium">Flight trails shown only for selected flights</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
        
        <div className="h-px w-full bg-[#4995fd]/20"></div>
        
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <Button 
                className="map-control-button"
                onClick={handleMyLocation}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="12" y1="2" x2="12" y2="4"/>
                  <line x1="12" y1="20" x2="12" y2="22"/>
                  <line x1="4" y1="12" x2="2" y2="12"/>
                  <line x1="22" y1="12" x2="20" y2="12"/>
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="aviation-tooltip">
              <p className="text-xs font-medium">Go to my location</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <Button 
                className="map-control-button"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                  </svg>
                ) : (
                  <FullscreenIcon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="aviation-tooltip">
              <p className="text-xs font-medium">{isFullscreen ? 'Exit' : 'Enter'} fullscreen</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

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
  
  // Add current position if available
  if (flight.position?.latitude && flight.position?.longitude) {
    path.push([flight.position.latitude, flight.position.longitude]);
  }
  
  if (flight.arrival?.icao && flight.position) {
    // Simulate an arrival location (for demo purposes)
    const arrivalLocation: [number, number] = [
      flight.position.latitude + 2,
      flight.position.longitude + 2
    ];
    
    path.push(arrivalLocation);
  }
  
  // Ensure we have at least 2 points for a valid path
  if (path.length < 2) {
    // Default to a simple point if we don't have enough positioning data
    path.push([0, 0], [0.1, 0.1]);
  }
  
  return path;
};

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
  const [currentZoom, setCurrentZoom] = useState(5);
  
  // Default center if no flights are available
  const defaultCenter: [number, number] = [37.0902, -95.7129]; // US center
  const defaultZoom = 5;
  
  // Handle zoom changes for optimized rendering
  const handleZoomChange = (zoom: number) => {
    setCurrentZoom(zoom);
  };
  
  // Fetch airports, even when showAirports is disabled (for improved UX)
  useEffect(() => {
    // Always fetch airports data to have it ready
    if (airports.length === 0) {
      setLoadingAirports(true);
      
      axios.get('/api/airports')
        .then(response => {
          console.log('Airport data loaded:', response.data);
          setAirports(response.data);
        })
        .catch(error => {
          console.error('Error fetching airports:', error);
        })
        .finally(() => {
          setLoadingAirports(false);
        });
    }
  }, [airports.length]);
  
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

  return (
    <FlightMapProvider flights={flights}>
      <div className={`w-full relative h-[50vh] md:h-[calc(100vh-4rem)] ${
        isDarkMode ? 'bg-neutral-900' : 'bg-white'
      } ${isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : ''}`}>
        <div className={`w-[95%] mx-auto h-full ${isDarkMode ? 'bg-neutral-900' : 'bg-white'} rounded overflow-hidden pt-[40px] pb-5`}>
        {!isConnected && (
          <Alert variant="destructive" className="absolute top-[84px] left-1/2 transform -translate-x-1/2 z-50 w-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Connecting to flight data server...</AlertDescription>
          </Alert>
        )}
        
        {isConnected && flights.length === 0 && (
          <Alert variant="destructive" className="absolute top-[84px] left-1/2 transform -translate-x-1/2 z-50 w-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No flight data available. Please check FlightAware credentials and permissions.
            </AlertDescription>
          </Alert>
        )}
        
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Optimized flight layer using clustering */}
          <ClusteredFlightLayer
            selectedFlight={selectedFlight}
            onFlightSelect={onFlightSelect}
            filters={filters}
          />
          
          {/* Performance monitoring component */}
          <MapZoomBoundsMonitor onZoomChange={handleZoomChange} />
          
          {/* Display airports if enabled */}
          {filters.showAirports && airports.map(airport => (
            <AirportMarker 
              key={airport.id} 
              airport={airport} 
              currentZoom={currentZoom} 
            />
          ))}
          
          {/* Weather overlay */}
          {filters.showWeather && (
            <WeatherOverlay 
              enabled={filters.showWeather}
              airportCode={selectedFlight?.departure?.icao || selectedFlight?.arrival?.icao} 
              zoom={currentZoom}
            />
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
          <MapZoomMonitor />
          <MapControlButtons 
            isDarkMode={isDarkMode}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            showFlightTrails={false}
            toggleFlightTrails={() => {
              // This doesn't actually toggle trails anymore since 
              // we only show paths for selected flights
            }}
          />
        </MapContainer>
      </div>
    </div>
    </FlightMapProvider>
  );
}