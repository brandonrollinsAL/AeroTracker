import React, { useState, useMemo } from 'react';
import { Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LiveFlight } from '@/types';
import { useFlightMapContext } from '@/hooks/use-flight-map-context';
import FlightClusterMarker from './FlightClusterMarker';

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

interface ClusteredFlightLayerProps {
  selectedFlight: LiveFlight | null;
  onFlightSelect: (flight: LiveFlight) => void;
  filters: any;
}

const ClusteredFlightLayer: React.FC<ClusteredFlightLayerProps> = ({
  selectedFlight,
  onFlightSelect,
  filters
}) => {
  const map = useMap();
  const { visibleFlights, clusteredFlights, mapZoom, getDetailLevel } = useFlightMapContext();
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  
  // Choose appropriate rendering based on zoom level/detail level
  const detailLevel = getDetailLevel();
  
  // Handle cluster click - zoom to contain all flights in cluster
  const handleClusterClick = (clusterId: string) => {
    const cluster = clusteredFlights.find(c => c.id === clusterId);
    if (cluster) {
      if (cluster.count <= 3) {
        // For small clusters, just select the first flight
        onFlightSelect(cluster.flights[0]);
      } else if (mapZoom >= 10) {
        // At high zoom, expand the cluster
        setExpandedClusterId(clusterId === expandedClusterId ? null : clusterId);
      } else {
        // Generate bounds to contain all flights in the cluster
        const bounds = L.latLngBounds(
          cluster.flights
            .filter(f => f.position?.latitude && f.position?.longitude)
            .map(f => [f.position!.latitude, f.position!.longitude])
        );
        
        // Add some padding
        bounds.pad(0.3);
        
        // Fly to the bounds
        map.flyToBounds(bounds, { duration: 1 });
      }
    }
  };
  
  // Selected flight path
  const selectedFlightPath = useMemo(() => {
    if (!selectedFlight) return null;
    
    return (
      <Polyline
        positions={generateFlightPath(selectedFlight)}
        pathOptions={{
          color: '#F97316',
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 5',
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />
    );
  }, [selectedFlight]);
  
  // Efficient rendering based on zoom level
  return (
    <>
      {/* Render clusters at low zoom levels */}
      {detailLevel !== 'high' && clusteredFlights.map(cluster => (
        <FlightClusterMarker
          key={`cluster-${cluster.id}`}
          id={cluster.id}
          count={cluster.count}
          position={cluster.center}
          flights={cluster.flights}
          onClick={() => handleClusterClick(cluster.id)}
          onFlightSelect={onFlightSelect}
          selectedFlightId={selectedFlight?.id}
        />
      ))}
      
      {/* Render individual flights at high zoom levels or when a cluster is expanded */}
      {(detailLevel === 'high' ? visibleFlights : 
        expandedClusterId 
          ? clusteredFlights.find(c => c.id === expandedClusterId)?.flights || []
          : []
      ).map(flight => (
        <Marker
          key={flight.id}
          position={[flight.position?.latitude || 0, flight.position?.longitude || 0]}
          icon={createAirplaneIcon(
            flight.position?.heading || 0, 
            selectedFlight?.id === flight.id,
            flight.position?.altitude || 0
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
            aria-label={`Flight ${flight.callsign || flight.flightNumber} information`}
          >
            <div className="text-xs font-bold aviation-callsign-gradient px-2 py-0.5 rounded-full"
              style={{ 
                whiteSpace: 'nowrap',
                color: '#F3F4F6',
                backgroundColor: '#1E3A8A',
                border: '1px solid rgba(249, 115, 22, 0.4)'
              }}
            >
              <span className="mr-1">{flight.callsign || flight.flightNumber}</span>
              <span className="text-[10px] opacity-80">
                {flight.position?.altitude 
                  ? `${Math.round(flight.position.altitude / 100) * 100}ft` 
                  : ''}
              </span>
            </div>
          </Tooltip>
        </Marker>
      ))}
      
      {/* Flight path for selected flight */}
      {selectedFlightPath}
    </>
  );
};

export default ClusteredFlightLayer;