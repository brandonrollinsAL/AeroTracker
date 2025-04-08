import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  PlusIcon, 
  MinusIcon,
  Cloud,
  Route,
  MapPin,
  Navigation,
  Plane
} from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MapFilter } from '@/types';

interface MapHorizontalControlsProps {
  filters: MapFilter;
  onFilterChange: (filters: Partial<MapFilter>) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
  isDarkMode: boolean;
}

export default function MapHorizontalControls({ 
  filters, 
  onFilterChange, 
  onZoomIn, 
  onZoomOut, 
  onMyLocation,
  isDarkMode 
}: MapHorizontalControlsProps) {
  
  return (
    <TooltipProvider>
      <div 
        className={`py-1 px-2 mx-auto max-w-full sticky top-16 z-40 transition-all duration-300 flex items-center justify-center ${
          isDarkMode 
            ? 'bg-[#002b4c]/95 border-b border-[#003a65]/40' 
            : 'bg-white/95 border-b border-[#4995fd]/20'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {/* Weather overlay toggle */}
          <Button
            variant={filters.showWeather ? "default" : "ghost"}
            size="sm"
            className={`rounded-md h-8 px-3 ${
              isDarkMode
                ? (filters.showWeather ? 'bg-[#4995fd]' : 'bg-[#003a65]/60 hover:bg-[#003a65]/80')
                : (filters.showWeather ? 'bg-[#4995fd]' : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20')
            }`}
            onClick={() => onFilterChange({ showWeather: !filters.showWeather })}
          >
            <Cloud className="h-4 w-4 mr-1" />
            <span className="text-xs">Weather</span>
          </Button>
          
          {/* Flight paths toggle */}
          <Button
            variant={filters.showFlightPaths ? "default" : "ghost"}
            size="sm"
            className={`rounded-md h-8 px-3 ${
              isDarkMode
                ? (filters.showFlightPaths ? 'bg-[#4995fd]' : 'bg-[#003a65]/60 hover:bg-[#003a65]/80')
                : (filters.showFlightPaths ? 'bg-[#4995fd]' : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20')
            }`}
            onClick={() => onFilterChange({ showFlightPaths: !filters.showFlightPaths })}
          >
            <Route className="h-4 w-4 mr-1" />
            <span className="text-xs">Flight Paths</span>
          </Button>
          
          {/* Airports toggle */}
          <Button
            variant={filters.showAirports ? "default" : "ghost"}
            size="sm"
            className={`rounded-md h-8 px-3 ${
              isDarkMode
                ? (filters.showAirports ? 'bg-[#4995fd]' : 'bg-[#003a65]/60 hover:bg-[#003a65]/80')
                : (filters.showAirports ? 'bg-[#4995fd]' : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20')
            }`}
            onClick={() => onFilterChange({ showAirports: !filters.showAirports })}
          >
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-xs">Airports</span>
          </Button>
          
          {/* Live tracking toggle */}
          <Button
            variant={filters.showLiveTracking ? "default" : "ghost"}
            size="sm"
            className={`rounded-md h-8 px-3 ${
              isDarkMode
                ? (filters.showLiveTracking ? 'bg-[#4995fd]' : 'bg-[#003a65]/60 hover:bg-[#003a65]/80')
                : (filters.showLiveTracking ? 'bg-[#4995fd]' : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20')
            }`}
            onClick={() => onFilterChange({ showLiveTracking: !filters.showLiveTracking })}
          >
            <Plane className="h-4 w-4 mr-1" />
            <span className="text-xs">Live Tracking</span>
          </Button>
          
          {/* Map controls grouped together */}
          <div className="flex items-center gap-1 ml-1">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-md h-8 px-2 ${
                isDarkMode
                  ? 'bg-[#003a65]/60 hover:bg-[#003a65]/80'
                  : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20'
              }`}
              onClick={onZoomIn}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-md h-8 px-2 ${
                isDarkMode
                  ? 'bg-[#003a65]/60 hover:bg-[#003a65]/80'
                  : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20'
              }`}
              onClick={onZoomOut}
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-md h-8 px-2 ${
                isDarkMode
                  ? 'bg-[#003a65]/60 hover:bg-[#003a65]/80'
                  : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20'
              }`}
              onClick={onMyLocation}
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}