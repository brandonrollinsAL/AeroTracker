import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { LiveFlight } from '@/types';

// Create a custom divIcon for flight clusters with enhanced visual presentation
// Following WCAG 2.1 AA contrast guidelines (minimum 4.5:1 for normal text)
const createClusterIcon = (count: number) => {
  // Size scales with count but is capped to ensure consistent proportions
  const size = Math.min(count * 5 + 30, 60);
  
  // The outer circle has a distinct border for better visibility
  // Inner circle uses high-contrast text (white on dark blue = 12.63:1 ratio)
  return L.divIcon({
    html: `
      <div class="flight-cluster" role="img" aria-label="${count} aircraft in this area">
        <div class="flight-cluster-inner">
          <span class="text-white font-bold">${count}</span>
        </div>
        <span class="sr-only">Group of ${count} aircraft in this area. Click to see details.</span>
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
        permanent={false}
      >
        <div className="p-3 rounded-lg shadow-md">
          <div className="font-bold text-sm mb-1 text-aviation-blue-dark">{count} Aircraft</div>
          <div className="text-xs text-aviation-blue-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
            Click to zoom in
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
};

export default FlightClusterMarker;