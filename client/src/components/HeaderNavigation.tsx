import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Cloud,
  Route,
  MapPin,
  Plane,
  Plus,
  Minus,
  Navigation
} from 'lucide-react';
import { MapFilter } from '@/types';

interface HeaderNavigationProps {
  filters: MapFilter;
  onFilterChange: (filters: Partial<MapFilter>) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
  isDarkMode: boolean;
}

export default function HeaderNavigation({ 
  filters, 
  onFilterChange, 
  onZoomIn, 
  onZoomOut, 
  onMyLocation,
  isDarkMode 
}: HeaderNavigationProps) {
  return (
    <div className={`w-full flex items-center justify-center border-b border-[#4995fd]/20 ${isDarkMode ? 'bg-[#003a65]/95 shadow-md' : 'bg-white/95 shadow-sm'}`}>
      <div className="flex items-center justify-center gap-2 py-2">
        {/* Weather button */}
        <Button
          variant={filters.showWeather ? "default" : "outline"}
          className={`rounded-md px-3 py-2 h-9 ${
            filters.showWeather 
              ? 'bg-[#4995fd] hover:bg-[#4995fd]/90 text-white' 
              : isDarkMode
                ? 'border-[#4995fd]/30 hover:bg-[#4995fd]/20 text-[#a0d0ec]'
                : 'border-[#4995fd]/20 hover:bg-[#4995fd]/10 text-[#003a65]'
          }`}
          onClick={() => onFilterChange({ showWeather: !filters.showWeather })}
        >
          <Cloud className="h-4 w-4 mr-2" />
          <span className="text-sm">Weather</span>
        </Button>
        
        {/* Flight Paths button */}
        <Button
          variant={filters.showFlightPaths ? "default" : "outline"}
          className={`rounded-md px-3 py-2 h-9 ${
            filters.showFlightPaths 
              ? 'bg-[#4995fd] hover:bg-[#4995fd]/90 text-white' 
              : isDarkMode
                ? 'border-[#4995fd]/30 hover:bg-[#4995fd]/20 text-[#a0d0ec]'
                : 'border-[#4995fd]/20 hover:bg-[#4995fd]/10 text-[#003a65]'
          }`}
          onClick={() => onFilterChange({ showFlightPaths: !filters.showFlightPaths })}
        >
          <Route className="h-4 w-4 mr-2" />
          <span className="text-sm">Flight Paths</span>
        </Button>
        
        {/* Airports button */}
        <Button
          variant={filters.showAirports ? "default" : "outline"}
          className={`rounded-md px-3 py-2 h-9 ${
            filters.showAirports 
              ? 'bg-[#4995fd] hover:bg-[#4995fd]/90 text-white' 
              : isDarkMode
                ? 'border-[#4995fd]/30 hover:bg-[#4995fd]/20 text-[#a0d0ec]'
                : 'border-[#4995fd]/20 hover:bg-[#4995fd]/10 text-[#003a65]'
          }`}
          onClick={() => onFilterChange({ showAirports: !filters.showAirports })}
        >
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-sm">Airports</span>
        </Button>
        
        {/* Live Tracking button */}
        <Button
          variant={filters.showLiveTracking ? "default" : "outline"}
          className={`rounded-md px-3 py-2 h-9 ${
            filters.showLiveTracking 
              ? 'bg-[#4995fd] hover:bg-[#4995fd]/90 text-white' 
              : isDarkMode
                ? 'border-[#4995fd]/30 hover:bg-[#4995fd]/20 text-[#a0d0ec]'
                : 'border-[#4995fd]/20 hover:bg-[#4995fd]/10 text-[#003a65]'
          }`}
          onClick={() => onFilterChange({ showLiveTracking: !filters.showLiveTracking })}
        >
          <Plane className="h-4 w-4 mr-2" />
          <span className="text-sm">Live Tracking</span>
        </Button>
        
        {/* Zoom controls */}
        <div className="flex gap-1 ml-1">
          <Button
            variant="outline"
            size="icon"
            className={`h-9 w-9 rounded-md ${
              isDarkMode 
                ? 'border-[#4995fd]/30 hover:bg-[#4995fd]/20 text-[#a0d0ec]' 
                : 'border-[#4995fd]/20 hover:bg-[#4995fd]/10 text-[#003a65]'
            }`}
            onClick={onZoomIn}
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={`h-9 w-9 rounded-md ${
              isDarkMode 
                ? 'border-[#4995fd]/30 hover:bg-[#4995fd]/20 text-[#a0d0ec]' 
                : 'border-[#4995fd]/20 hover:bg-[#4995fd]/10 text-[#003a65]'
            }`}
            onClick={onZoomOut}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={`h-9 w-9 rounded-md ${
              isDarkMode 
                ? 'border-[#4995fd]/30 hover:bg-[#4995fd]/20 text-[#a0d0ec]' 
                : 'border-[#4995fd]/20 hover:bg-[#4995fd]/10 text-[#003a65]'
            }`}
            onClick={onMyLocation}
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}