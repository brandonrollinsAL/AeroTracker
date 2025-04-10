import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useFlightMapContext } from '@/hooks/use-flight-map-context';

interface MapZoomBoundsMonitorProps {
  onZoomChange?: (zoom: number) => void;
}

// Component to monitor and update map zoom and bounds
export function MapZoomBoundsMonitor({ onZoomChange }: MapZoomBoundsMonitorProps) {
  const map = useMap();
  const { 
    setMapBounds, 
    setMapZoom,
    filterFlightsByBounds 
  } = useFlightMapContext();
  
  useEffect(() => {
    // Get initial values
    const initialZoom = map.getZoom();
    setMapZoom(initialZoom);
    
    const initialBounds = map.getBounds();
    setMapBounds(initialBounds);
    filterFlightsByBounds(initialBounds);
    
    // Set up event handlers
    const handleZoomEnd = () => {
      const zoom = map.getZoom();
      setMapZoom(zoom);
      if (onZoomChange) {
        onZoomChange(zoom);
      }
    };
    
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      setMapBounds(bounds);
      filterFlightsByBounds(bounds);
    };
    
    map.on('zoomend', handleZoomEnd);
    map.on('moveend', handleMoveEnd);
    
    // Clean up event handlers on unmount
    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('moveend', handleMoveEnd);
    };
  }, [map, setMapBounds, setMapZoom, filterFlightsByBounds, onZoomChange]);
  
  return null;
}

export default MapZoomBoundsMonitor;