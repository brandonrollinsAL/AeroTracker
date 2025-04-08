import React, { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useFlightMapContext } from '@/hooks/use-flight-map-context';
import { NexradRadarOverlay } from './NexradRadarOverlay';
import { Button } from '@/components/ui/button';
import { CloudRain } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

// Component to monitor zoom level and bounds changes and manage map overlays
export function MapZoomMonitor() {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());
  const [showRadar, setShowRadar] = useState(false);
  const { flights, setMapBounds, setVisibleFlights } = useFlightMapContext();
  
  useEffect(() => {
    const updateZoom = () => {
      setCurrentZoom(map.getZoom());
    };
    
    const updateBounds = () => {
      const bounds = map.getBounds();
      setMapBounds(bounds);
      
      // Filter flights based on current map bounds
      if (Array.isArray(flights)) {
        const visible = flights.filter(flight => {
          if (!flight.position?.latitude || !flight.position?.longitude) return false;
          return bounds.contains([flight.position.latitude, flight.position.longitude]);
        });
        setVisibleFlights(visible);
      }
    };
    
    map.on('zoom', updateZoom);
    map.on('moveend', updateBounds);
    
    // Initial bounds calculation
    updateBounds();
    
    return () => {
      map.off('zoom', updateZoom);
      map.off('moveend', updateBounds);
    };
  }, [map, flights, setMapBounds, setVisibleFlights]);
  
  // Return both the NexradRadarOverlay and a control button to toggle it
  return (
    <>
      <NexradRadarOverlay enabled={showRadar} opacity={0.7} zoom={currentZoom} />
      
      <div className="aviation-glass absolute bottom-4 right-4 z-[900] p-1.5 rounded-xl backdrop-blur-md flex space-x-2 border border-[#4995fd]/30">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                className={`map-control-button ${showRadar ? 'active' : ''}`}
                onClick={() => setShowRadar(!showRadar)}
              >
                <CloudRain className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="aviation-tooltip">
              <p className="text-xs font-medium">{showRadar ? 'Hide' : 'Show'} NEXRAD radar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
}