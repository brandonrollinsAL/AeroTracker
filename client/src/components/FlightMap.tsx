import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapControls from './MapControls';
import MapFilters from './MapFilters';
import AirportMarker from './AirportMarker';
import { LiveFlight, MapFilter, Airport } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
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

export default function FlightMap({ 
  flights, 
  selectedFlight, 
  onFlightSelect,
  filters,
  onFilterChange,
  isConnected
}: FlightMapProps) {
  const mapRef = useRef<L.Map | null>(null);
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

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
  };
  
  // Define the type for the whenReady event
  interface MapReadyEvent {
    target: L.Map;
  }

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

  return (
    <div className="w-full md:w-2/3 lg:w-3/4 bg-neutral-200 relative h-[50vh] md:h-[calc(100vh-4rem)]">
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
        whenReady={(event: MapReadyEvent) => handleMapReady(event.target)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {flights.map((flight) => (
          <Marker
            key={flight.id}
            position={[flight.position.latitude, flight.position.longitude]}
            icon={createAirplaneIcon(flight.position.heading)}
            eventHandlers={{
              click: () => onFlightSelect(flight)
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold">{flight.callsign || flight.flightNumber}</div>
                <div>{flight.departure?.icao} → {flight.arrival?.icao}</div>
                <div>Alt: {flight.position.altitude} ft</div>
                <div>Speed: {flight.position.groundSpeed} mph</div>
              </div>
            </Popup>
          </Marker>
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
      </MapContainer>
      
      <MapControls 
        onZoomIn={handleZoomIn} 
        onZoomOut={handleZoomOut} 
        onMyLocation={handleMyLocation} 
      />
      
      <MapFilters 
        filters={filters} 
        onFilterChange={onFilterChange}
      />
    </div>
  );
}
