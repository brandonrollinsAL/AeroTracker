import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { LiveFlight } from '@/types';

// Create a custom divIcon for flight clusters
const createClusterIcon = (count: number) => {
  const size = Math.min(count * 5 + 30, 60); // Size scales with count but is capped
  
  return L.divIcon({
    html: `
      <div class="flight-cluster" role="img" aria-label="${count} aircraft in this area">
        <div class="flight-cluster-inner">
          <span>${count}</span>
        </div>
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

interface FlightClusterMarkerProps {
  id: string;
  count: number;
  position: [number, number];
  flights: LiveFlight[];
  onClick: () => void;
  onFlightSelect: (flight: LiveFlight) => void;
  selectedFlightId?: string | null;
}

const FlightClusterMarker: React.FC<FlightClusterMarkerProps> = ({
  id,
  count,
  position,
  flights,
  onClick,
  onFlightSelect,
  selectedFlightId
}) => {
  // For single flight clusters, delegate to standard flight marker rendering
  if (count === 1) {
    return null; // These will be handled by the regular flight markers
  }
  
  return (
    <Marker
      key={`cluster-${id}`}
      position={position}
      icon={createClusterIcon(count)}
      eventHandlers={{
        click: onClick
      }}
    >
      <Tooltip 
        direction="top"
        offset={[0, -20]}
        className="cluster-tooltip"
      >
        <div className="p-2">
          <div className="font-bold text-sm mb-1">{count} Aircraft</div>
          <div className="text-xs text-neutral-600">Click to zoom in</div>
        </div>
      </Tooltip>
    </Marker>
  );
};

export default FlightClusterMarker;