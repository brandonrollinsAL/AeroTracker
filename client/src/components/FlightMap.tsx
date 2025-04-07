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

// Custom airplane icon with aviation blues
const createAirplaneIcon = (heading: number, isSelected: boolean = false, altitude: number = 0) => {
  // Calculate color based on altitude (lower = more cyan, higher = more dark blue)
  const altitudePercent = Math.min(Math.max(altitude / 40000, 0), 1); // Normalize between 0-40,000 ft
  
  let iconColor: string;
  let iconSize: number = isSelected ? 32 : 28;
  let iconClass: string = isSelected ? 'airplane-icon selected' : 'airplane-icon';
  let glowEffect: string = '';
  
  if (isSelected) {
    // Selected flights use the accent cyan with glow
    iconColor = '#55ffdd';
    glowEffect = 'filter: drop-shadow(0 0 8px rgba(85, 255, 221, 0.8));';
  } else {
    // Normal flights use a gradient between cyan and dark blue based on altitude
    if (altitudePercent < 0.2) {
      iconColor = '#55ffdd'; // Low altitude - cyan
    } else if (altitudePercent < 0.5) {
      iconColor = '#2460a7'; // Medium altitude - medium blue
    } else {
      iconColor = '#0a4995'; // High altitude - dark blue
    }
  }
  
  return L.divIcon({
    html: `
      <div class="${iconClass}" style="transform: rotate(${heading}deg); ${glowEffect}">
        <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" 
                fill="${iconColor}" />
        </svg>
      </div>
    `,
    className: 'custom-airplane-icon',
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
  
  return (
    <div className="map-controls">
      <div className="aviation-glass p-1.5 rounded-xl backdrop-blur-md flex flex-col space-y-2 border border-[#55ffdd]/20">
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
            <TooltipContent side="left" className="aviation-tooltip">
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
            <TooltipContent side="left" className="aviation-tooltip">
              <p className="text-xs font-medium">Zoom out</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <Button 
                className={`map-control-button ${showFlightTrails ? 'active' : ''}`}
                onClick={toggleFlightTrails}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3l-5 5.5L8 7l-5 5"/>
                  <path d="M15 3h2v2"/>
                  <path d="M3 12h2v2"/>
                  <path d="M17 17l-5 5.5-4-1.5-5-5"/>
                  <path d="M15 17h2v2"/>
                  <path d="M3 8h2v2"/>
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="aviation-tooltip">
              <p className="text-xs font-medium">{showFlightTrails ? 'Hide' : 'Show'} flight trails</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
        
        <div className="h-px w-full bg-[#55ffdd]/10"></div>
        
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
            <TooltipContent side="left" className="aviation-tooltip">
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
            <TooltipContent side="left" className="aviation-tooltip">
              <p className="text-xs font-medium">{isFullscreen ? 'Exit' : 'Enter'} fullscreen</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
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
  const [currentZoom, setCurrentZoom] = useState(5);
  
  // Default center if no flights are available
  const defaultCenter: [number, number] = [37.0902, -95.7129]; // US center
  const defaultZoom = 5;

  // Fetch airports, even when showAirports is disabled (for improved UX)
  useEffect(() => {
    // Always fetch airports data to have it ready
    if (airports.length === 0) {
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
  }, [airports.length]);
  
  // Component to monitor zoom level changes
  const ZoomMonitor = () => {
    const map = useMap();
    
    useEffect(() => {
      const updateZoom = () => {
        setCurrentZoom(map.getZoom());
      };
      
      // Set initial zoom
      updateZoom();
      
      // Add event listener for zoom changes
      map.on('zoom', updateZoom);
      
      return () => {
        map.off('zoom', updateZoom);
      };
    }, [map]);
    
    return null;
  };

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
    <div className={`w-full md:w-full lg:w-full relative h-[50vh] md:h-[calc(100vh-4rem)] p-0 ${
      isDarkMode ? 'bg-neutral-900' : 'bg-white'
    } ${isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen p-0' : ''}`}>
      <div className={`w-full h-full ${isDarkMode ? 'bg-neutral-900' : 'bg-white'} rounded-sm overflow-hidden pt-[30px]`}>
        {!isConnected && (
          <Alert variant="destructive" className="absolute top-[84px] left-1/2 transform -translate-x-1/2 z-50 w-auto">
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
          
          {Array.isArray(flights) && flights.map((flight) => (
            <React.Fragment key={flight.id}>
              <Marker
                position={[flight.position.latitude, flight.position.longitude]}
                icon={createAirplaneIcon(
                  flight.position.heading, 
                  selectedFlight?.id === flight.id,
                  flight.position.altitude
                )}
                eventHandlers={{
                  click: () => onFlightSelect(flight)
                }}
              >
                <Tooltip 
                  direction="top" 
                  offset={[0, -15]} 
                  permanent={selectedFlight?.id === flight.id}
                  className="aviation-map-tooltip"
                >
                  <div className="text-xs font-bold bg-clip-text text-transparent px-1"
                    style={{ 
                      backgroundImage: 'linear-gradient(90deg, var(--aviation-blue-dark), var(--aviation-blue-light))',
                      whiteSpace: 'nowrap' 
                    }}
                  >
                    {flight.callsign || flight.flightNumber}
                  </div>
                </Tooltip>
                
                <Popup className="aviation-popup">
                  <div className="popup-header bg-gradient-to-r from-[#0a4995] to-[#2460a7] text-white px-3 py-2 -mx-2 -mt-2 rounded-t-lg flex items-center mb-2">
                    <div className="h-7 w-7 rounded-full bg-[#55ffdd]/20 flex items-center justify-center mr-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" 
                              fill="#ffffff" />
                      </svg>
                    </div>
                    <div className="font-bold tracking-wide">{flight.callsign || flight.flightNumber}</div>
                  </div>
                  
                  <div className="pb-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="aviation-data-highlight px-2 py-1 text-xs rounded-md">
                        {flight.departure?.icao || 'N/A'} → {flight.arrival?.icao || 'N/A'}
                      </div>
                      <div className={`aviation-status aviation-status-${flight.status} text-xs py-0.5 px-1.5 rounded-full`}>
                        {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="flex items-center">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#0a4995] to-[#2460a7] flex items-center justify-center mr-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" 
                                  fill="#ffffff" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-500 uppercase font-medium">Altitude</div>
                          <div className="text-xs font-bold text-[#0a4995]">{flight.position.altitude.toLocaleString()} ft</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#55ffdd] to-[#449999] flex items-center justify-center mr-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-500 uppercase font-medium">Speed</div>
                          <div className="text-xs font-bold text-[#0a4995]">{flight.position.groundSpeed} mph</div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => onFlightSelect(flight)}
                      className="w-full mt-1 aviation-btn-accent text-xs py-1 h-auto"
                    >
                      View Flight Details
                    </Button>
                  </div>
                </Popup>
              </Marker>
              
              {/* Add flight path if enabled and flight has a route */}
              {showFlightTrails && (
                <Polyline 
                  positions={generateFlightPath(flight)}
                  pathOptions={{ 
                    color: selectedFlight?.id === flight.id ? '#55ffdd' : '#2460a7',
                    weight: selectedFlight?.id === flight.id ? 3 : 2,
                    dashArray: selectedFlight?.id === flight.id ? '' : '5, 8',
                    opacity: selectedFlight?.id === flight.id ? 0.9 : 0.6,
                    className: selectedFlight?.id === flight.id ? 'flight-path-active' : 'flight-path'
                  }}
                />
              )}
            </React.Fragment>
          ))}
          
          {/* Display airports if enabled */}
          {filters.showAirports && airports.map(airport => (
            <AirportMarker 
              key={airport.id} 
              airport={airport} 
              currentZoom={currentZoom} 
            />
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
          <ZoomMonitor />
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