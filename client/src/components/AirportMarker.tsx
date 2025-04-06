import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Airport } from '@/types';

interface AirportMarkerProps {
  airport: Airport;
}

// Create a custom icon for airports
const createAirportIcon = (size: 'large' | 'medium' | 'small' | undefined) => {
  const iconSize = size === 'large' ? 14 : size === 'medium' ? 12 : 10;
  
  return L.divIcon({
    html: `<div class="bg-blue-600 rounded-full" style="width: ${iconSize}px; height: ${iconSize}px;"></div>`,
    className: 'airport-icon',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2]
  });
};

export default function AirportMarker({ airport }: AirportMarkerProps) {
  return (
    <Marker
      position={[airport.latitude, airport.longitude]}
      icon={createAirportIcon(airport.size)}
    >
      <Popup>
        <div className="text-sm">
          <div className="font-bold">{airport.name}</div>
          <div className="text-xs">{airport.code}</div>
          <div>{airport.city}, {airport.country}</div>
          {airport.type && (
            <div className="text-xs mt-1 text-neutral-500">
              {airport.type.charAt(0).toUpperCase() + airport.type.slice(1)} Airport
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}