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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  // Animation classes for button hover and active states
  const activeButtonClass = 'bg-primary-blue hover:bg-primary-blue/90 text-text-light transition-all duration-300 hover:shadow-buttonHover transform hover:scale-105';
  const inactiveButtonClass = isDarkMode
    ? 'border-primary-blue-dark/30 hover:bg-primary-blue-dark/20 text-primary-blue-ultraLight transition-all duration-300 hover:shadow-glowSmall transform hover:scale-105'
    : 'border-primary-blue/20 hover:bg-primary-blue/10 text-primary-blue-dark transition-all duration-300 hover:shadow-glowSmall transform hover:scale-105';
  
  // Frosted glass effect
  const headerBgClass = isDarkMode 
    ? 'bg-primary-blue-dark/90 backdrop-blur-frosted shadow-md border-primary-blue/20' 
    : 'bg-bg-primary/90 backdrop-blur-frosted shadow-sm border-primary-blue/10';

  return (
    <div className={`w-full flex items-center justify-center border-b ${headerBgClass} sticky top-0 z-50`}>
      <div className="flex items-center justify-center gap-3 py-3 animate-fade-in">
        <TooltipProvider>
          {/* Weather button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={filters.showWeather ? "default" : "outline"}
                className={`rounded-md px-3 py-2 h-10 ${
                  filters.showWeather ? activeButtonClass : inactiveButtonClass
                }`}
                onClick={() => onFilterChange({ showWeather: !filters.showWeather })}
              >
                <Cloud className="h-4 w-4 mr-2" />
                <span className="text-sm font-label">Weather</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle weather radar overlay</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Flight Paths button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={filters.showFlightPaths ? "default" : "outline"}
                className={`rounded-md px-3 py-2 h-10 ${
                  filters.showFlightPaths ? activeButtonClass : inactiveButtonClass
                }`}
                onClick={() => onFilterChange({ showFlightPaths: !filters.showFlightPaths })}
              >
                <Route className="h-4 w-4 mr-2" />
                <span className="text-sm font-label">Flight Paths</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show or hide flight paths</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Airports button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={filters.showAirports ? "default" : "outline"}
                className={`rounded-md px-3 py-2 h-10 ${
                  filters.showAirports ? activeButtonClass : inactiveButtonClass
                }`}
                onClick={() => onFilterChange({ showAirports: !filters.showAirports })}
              >
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm font-label">Airports</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Display airport locations</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Live Tracking button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={filters.showLiveTracking ? "default" : "outline"}
                className={`rounded-md px-3 py-2 h-10 ${
                  filters.showLiveTracking ? activeButtonClass : inactiveButtonClass
                }`}
                onClick={() => onFilterChange({ showLiveTracking: !filters.showLiveTracking })}
              >
                <Plane className="h-4 w-4 mr-2" />
                <span className="text-sm font-label">Live Tracking</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Enable real-time flight tracking</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Zoom controls */}
          <div className="flex gap-2 ml-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 rounded-md ${inactiveButtonClass}`}
                  onClick={onZoomIn}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom in</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 rounded-md ${inactiveButtonClass}`}
                  onClick={onZoomOut}
                >
                  <Minus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom out</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 rounded-md ${inactiveButtonClass}`}
                  onClick={onMyLocation}
                >
                  <Navigation className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to my location</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}