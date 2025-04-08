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

interface MapIconMenuProps {
  filters: MapFilter;
  onFilterChange: (filters: Partial<MapFilter>) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
  isDarkMode: boolean;
}

export default function MapIconMenu({ 
  filters, 
  onFilterChange, 
  onZoomIn, 
  onZoomOut, 
  onMyLocation,
  isDarkMode 
}: MapIconMenuProps) {
  
  return (
    <TooltipProvider>
      <div 
        className={`py-2 px-6 flex items-center justify-center sticky top-16 z-40 transition-all duration-300 ${
          isDarkMode 
            ? 'bg-[#002b4c]/95 border-b border-[#003a65]/40' 
            : 'bg-white/95 border-b border-[#4995fd]/20'
        }`}
      >
        <div className="flex flex-wrap items-center justify-center gap-5">
          {/* Weather overlay toggle */}
          <div className="flex flex-col items-center">
            <Button
              variant={filters.showWeather ? "default" : "ghost"}
              size="sm"
              className={`rounded-full h-10 w-10 mb-1 ${
                isDarkMode
                  ? (filters.showWeather ? 'bg-[#4995fd]' : 'bg-[#003a65]/60 hover:bg-[#003a65]/80')
                  : (filters.showWeather ? 'bg-[#4995fd]' : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20')
              }`}
              onClick={() => onFilterChange({ showWeather: !filters.showWeather })}
            >
              <Cloud className="h-5 w-5" />
            </Button>
            <span className={`text-xs ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}>
              Weather
            </span>
          </div>
          
          {/* Flight paths toggle */}
          <div className="flex flex-col items-center">
            <Button
              variant={filters.showFlightPaths ? "default" : "ghost"}
              size="sm"
              className={`rounded-full h-10 w-10 mb-1 ${
                isDarkMode
                  ? (filters.showFlightPaths ? 'bg-[#4995fd]' : 'bg-[#003a65]/60 hover:bg-[#003a65]/80')
                  : (filters.showFlightPaths ? 'bg-[#4995fd]' : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20')
              }`}
              onClick={() => onFilterChange({ showFlightPaths: !filters.showFlightPaths })}
            >
              <Route className="h-5 w-5" />
            </Button>
            <span className={`text-xs ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}>
              Flight Paths
            </span>
          </div>
          
          {/* Airports toggle */}
          <div className="flex flex-col items-center">
            <Button
              variant={filters.showAirports ? "default" : "ghost"}
              size="sm"
              className={`rounded-full h-10 w-10 mb-1 ${
                isDarkMode
                  ? (filters.showAirports ? 'bg-[#4995fd]' : 'bg-[#003a65]/60 hover:bg-[#003a65]/80')
                  : (filters.showAirports ? 'bg-[#4995fd]' : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20')
              }`}
              onClick={() => onFilterChange({ showAirports: !filters.showAirports })}
            >
              <MapPin className="h-5 w-5" />
            </Button>
            <span className={`text-xs ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}>
              Airports
            </span>
          </div>
          
          {/* Live tracking toggle */}
          <div className="flex flex-col items-center">
            <Button
              variant={filters.showLiveTracking ? "default" : "ghost"}
              size="sm"
              className={`rounded-full h-10 w-10 mb-1 ${
                isDarkMode
                  ? (filters.showLiveTracking ? 'bg-[#4995fd]' : 'bg-[#003a65]/60 hover:bg-[#003a65]/80')
                  : (filters.showLiveTracking ? 'bg-[#4995fd]' : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20')
              }`}
              onClick={() => onFilterChange({ showLiveTracking: !filters.showLiveTracking })}
            >
              <Plane className="h-5 w-5" />
            </Button>
            <span className={`text-xs ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}>
              Live Tracking
            </span>
          </div>
          
          {/* Map navigation controls */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full h-10 w-10 mb-1 ${
                isDarkMode
                  ? 'bg-[#003a65]/60 hover:bg-[#003a65]/80'
                  : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20'
              }`}
              onClick={onZoomIn}
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
            <span className={`text-xs ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}>
              Zoom In
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full h-10 w-10 mb-1 ${
                isDarkMode
                  ? 'bg-[#003a65]/60 hover:bg-[#003a65]/80'
                  : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20'
              }`}
              onClick={onZoomOut}
            >
              <MinusIcon className="h-5 w-5" />
            </Button>
            <span className={`text-xs ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}>
              Zoom Out
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full h-10 w-10 mb-1 ${
                isDarkMode
                  ? 'bg-[#003a65]/60 hover:bg-[#003a65]/80'
                  : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20'
              }`}
              onClick={onMyLocation}
            >
              <Navigation className="h-5 w-5" />
            </Button>
            <span className={`text-xs ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}>
              My Location
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}