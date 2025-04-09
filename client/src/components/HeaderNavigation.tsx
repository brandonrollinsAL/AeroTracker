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
  const activeButtonClass = filters.showLiveTracking 
    ? 'bg-accent-orange hover:bg-accent-orange/90 text-text-light transition-all duration-300 hover:shadow-buttonHover transform hover:scale-105'
    : 'bg-primary-blue hover:bg-primary-blue/90 text-text-light transition-all duration-300 hover:shadow-buttonHover transform hover:scale-105';
    
  const inactiveButtonClass = isDarkMode
    ? 'border-primary-blue-dark/30 hover:bg-primary-blue-dark/20 text-primary-blue-ultraLight transition-all duration-300 hover:shadow-glowSmall transform hover:scale-105'
    : 'border-primary-blue/20 hover:bg-primary-blue/10 text-primary-blue-dark transition-all duration-300 hover:shadow-glowSmall transform hover:scale-105';
  
  // Cockpit-inspired frosted glass effect
  const headerBgClass = isDarkMode 
    ? 'bg-primary-blue-dark/95 backdrop-blur-frosted shadow-md border-b border-primary-blue/20' 
    : 'bg-bg-primary/95 backdrop-blur-frosted shadow-sm border-b border-metallic/30';

  return (
    <div className={`w-full flex items-center justify-center ${headerBgClass} sticky top-0 z-50`}>
      <div className="flex items-center justify-center gap-3 py-3 animate-fade-in max-w-7xl mx-auto px-4">
        <TooltipProvider>
          {/* Weather button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={filters.showWeather ? "default" : "outline"}
                className={`rounded-md px-3 py-2 h-10 font-heading ${
                  filters.showWeather ? activeButtonClass : inactiveButtonClass
                }`}
                onClick={() => onFilterChange({ showWeather: !filters.showWeather })}
              >
                <Cloud className={`h-4 w-4 mr-2 ${filters.showWeather ? 'text-white animate-pulse' : ''}`} />
                <span className="text-sm font-label">Weather</span>
                {filters.showWeather && (
                  <span className="absolute inset-0 rounded-md bg-white/10 animate-pulse"></span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-white text-primary-blue-dark border border-metallic font-body">
              <p>Toggle NEXRAD weather radar overlay</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Flight Paths button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={filters.showFlightPaths ? "default" : "outline"}
                className={`rounded-md px-3 py-2 h-10 font-heading ${
                  filters.showFlightPaths ? activeButtonClass : inactiveButtonClass
                }`}
                onClick={() => onFilterChange({ showFlightPaths: !filters.showFlightPaths })}
              >
                <Route className={`h-4 w-4 mr-2 ${filters.showFlightPaths ? 'text-white' : ''}`} />
                <span className="text-sm font-label">Flight Paths</span>
                {filters.showFlightPaths && (
                  <span className="absolute inset-0 rounded-md bg-white/10 animate-pulse"></span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-white text-primary-blue-dark border border-metallic font-body">
              <p>Show detailed flight trajectories and routes</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Airports button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={filters.showAirports ? "default" : "outline"}
                className={`rounded-md px-3 py-2 h-10 font-heading ${
                  filters.showAirports ? activeButtonClass : inactiveButtonClass
                }`}
                onClick={() => onFilterChange({ showAirports: !filters.showAirports })}
              >
                <MapPin className={`h-4 w-4 mr-2 ${filters.showAirports ? 'text-white' : ''}`} />
                <span className="text-sm font-label">Airports</span>
                {filters.showAirports && (
                  <span className="absolute inset-0 rounded-md bg-white/10 animate-pulse"></span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-white text-primary-blue-dark border border-metallic font-body">
              <p>Display international and domestic airport locations</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Live Tracking button - using accent orange for active state */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={filters.showLiveTracking ? "default" : "outline"}
                className={`rounded-md px-3 py-2 h-10 font-heading relative overflow-hidden ${
                  filters.showLiveTracking ? activeButtonClass : inactiveButtonClass
                }`}
                onClick={() => onFilterChange({ showLiveTracking: !filters.showLiveTracking })}
              >
                <Plane className={`h-4 w-4 mr-2 ${filters.showLiveTracking ? 'text-white' : ''}`} />
                <span className="text-sm font-label">Live Tracking</span>
                {filters.showLiveTracking && (
                  <span className="absolute inset-0 rounded-md bg-white/10 animate-pulse"></span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-white text-primary-blue-dark border border-metallic font-body">
              <p>Enable real-time global flight tracking via FlightAware</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Divider */}
          <div className="h-8 w-px bg-metallic/30 mx-1"></div>
          
          {/* Zoom controls with cockpit-inspired styling */}
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 rounded-md ${inactiveButtonClass} relative overflow-hidden`}
                  onClick={onZoomIn}
                >
                  <Plus className="h-5 w-5" />
                  <span className="absolute inset-0 bg-aviation-blue-light/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-primary-blue-dark border border-metallic font-body">
                <p>Zoom in for detailed view</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 rounded-md ${inactiveButtonClass} relative overflow-hidden`}
                  onClick={onZoomOut}
                >
                  <Minus className="h-5 w-5" />
                  <span className="absolute inset-0 bg-aviation-blue-light/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-primary-blue-dark border border-metallic font-body">
                <p>Zoom out for broader coverage</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 rounded-md ${inactiveButtonClass} relative overflow-hidden`}
                  onClick={onMyLocation}
                >
                  <Navigation className="h-5 w-5" />
                  <span className="absolute inset-0 bg-aviation-blue-light/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-primary-blue-dark border border-metallic font-body">
                <p>Center map on your current location</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}