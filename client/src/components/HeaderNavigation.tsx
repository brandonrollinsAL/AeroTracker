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
  // Professional-themed button classes with enhanced styling
  const activeButtonClass = 'relative bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white font-medium transition-all duration-300 shadow-[0_2px_10px_rgba(37,99,235,0.4)] hover:shadow-[0_4px_15px_rgba(37,99,235,0.5)] hover:translate-y-[-2px] border border-[#60A5FA]/30';
  
  const accentButtonClass = 'relative bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-medium transition-all duration-300 shadow-[0_2px_10px_rgba(59,130,246,0.4)] hover:shadow-[0_4px_15px_rgba(59,130,246,0.5)] hover:translate-y-[-2px] border border-[#93C5FD]/50';
  
  const inactiveButtonClass = isDarkMode
    ? 'relative border border-[#60A5FA]/20 bg-[#002B4C]/80 hover:bg-[#002B4C]/90 text-[#F5F5F5] transition-all duration-300 shadow-[0_2px_6px_rgba(0,43,76,0.3)] hover:shadow-[0_4px_12px_rgba(0,43,76,0.4)] hover:translate-y-[-2px]'
    : 'relative border border-[#2563EB]/20 bg-white hover:bg-[#F0F9FF] text-[#002B4C] transition-all duration-300 shadow-[0_2px_6px_rgba(0,43,76,0.15)] hover:shadow-[0_4px_12px_rgba(0,43,76,0.25)] hover:translate-y-[-2px]';
  
  // Professional frosted glass effect with enhanced styling
  const headerBgClass = isDarkMode 
    ? 'bg-gradient-to-r from-[#002B4C]/90 to-[#003A65]/95 backdrop-blur-[12px] shadow-lg border-b border-[#60A5FA]/30 relative after:absolute after:inset-0 after:bg-gradient-to-b after:from-[#60A5FA]/5 after:to-transparent after:pointer-events-none' 
    : 'bg-gradient-to-r from-[#F0F9FF]/95 to-[#F8FAFC]/95 backdrop-blur-[12px] shadow-md border-b border-[#2563EB]/20 relative after:absolute after:inset-0 after:bg-gradient-to-b after:from-[#60A5FA]/5 after:to-transparent after:pointer-events-none';
    
  // Get the correct button styling based on filter status and type
  const getButtonStyle = (isActive: boolean, isLiveTracking: boolean = false) => {
    if (!isActive) return inactiveButtonClass;
    if (isLiveTracking) return accentButtonClass;
    return activeButtonClass;
  };

  return (
    <div className={`w-full flex items-center justify-center ${headerBgClass} sticky top-0 z-50`}>
      <div className="flex items-center justify-center gap-3 py-3 animate-fade-in max-w-7xl mx-auto px-4 relative z-10">
        <TooltipProvider>
          {/* Weather button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={filters.showWeather ? "default" : "outline"}
                className={`rounded-md px-3 py-2 h-10 font-heading ${
                  getButtonStyle(filters.showWeather)
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
            <TooltipContent className="bg-white border border-[#60A5FA]/30 shadow-md rounded-md p-3 text-[#002B4C] font-body">
              <p className="text-sm">Toggle NEXRAD weather radar overlay</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Flight Paths button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={filters.showFlightPaths ? "default" : "outline"}
                className={`rounded-md px-3 py-2 h-10 font-heading ${
                  getButtonStyle(filters.showFlightPaths)
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
            <TooltipContent className="bg-white border border-[#60A5FA]/30 shadow-md rounded-md p-3 text-[#002B4C] font-body">
              <p className="text-sm">Show detailed flight trajectories and routes</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Airports button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={filters.showAirports ? "default" : "outline"}
                className={`rounded-md px-3 py-2 h-10 font-heading ${
                  getButtonStyle(filters.showAirports)
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
            <TooltipContent className="bg-white border border-[#60A5FA]/30 shadow-md rounded-md p-3 text-[#002B4C] font-body">
              <p className="text-sm">Display international and domestic airport locations</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Live Tracking button - using accent orange for active state */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={filters.showLiveTracking ? "default" : "outline"}
                className={`rounded-md px-3 py-2 h-10 font-heading relative overflow-hidden ${
                  getButtonStyle(filters.showLiveTracking, true)
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
            <TooltipContent className="bg-white border border-[#60A5FA]/30 shadow-md rounded-md p-3 text-[#002B4C] font-body">
              <p className="text-sm">Enable real-time global flight tracking via FlightAware</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Professional divider */}
          <div className="h-8 w-px mx-2 bg-gradient-to-b from-[#2563EB]/10 via-[#60A5FA]/40 to-[#2563EB]/10 shadow-sm"></div>
          
          {/* Zoom controls with cockpit-inspired styling */}
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 rounded-md border border-[#60A5FA]/30 bg-white/90 hover:bg-[#F0F9FF] text-[#002B4C] transition-all duration-300 shadow-md hover:shadow-lg hover:translate-y-[-2px] relative overflow-hidden`}
                  onClick={onZoomIn}
                >
                  <Plus className="h-5 w-5 text-[#2563EB]" />
                  <span className="absolute inset-0 bg-[#60A5FA]/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-white border border-[#60A5FA]/30 shadow-md rounded-md p-3 text-[#002B4C] font-body">
                <p className="text-sm">Zoom in for detailed view</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 rounded-md border border-[#60A5FA]/30 bg-white/90 hover:bg-[#F0F9FF] text-[#002B4C] transition-all duration-300 shadow-md hover:shadow-lg hover:translate-y-[-2px] relative overflow-hidden`}
                  onClick={onZoomOut}
                >
                  <Minus className="h-5 w-5 text-[#2563EB]" />
                  <span className="absolute inset-0 bg-[#60A5FA]/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-white border border-[#60A5FA]/30 shadow-md rounded-md p-3 text-[#002B4C] font-body">
                <p className="text-sm">Zoom out for broader coverage</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 rounded-md border border-[#60A5FA]/30 bg-white/90 hover:bg-[#F0F9FF] text-[#002B4C] transition-all duration-300 shadow-md hover:shadow-lg hover:translate-y-[-2px] relative overflow-hidden`}
                  onClick={onMyLocation}
                >
                  <Navigation className="h-5 w-5 text-[#2563EB]" />
                  <span className="absolute inset-0 bg-[#60A5FA]/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-white border border-[#60A5FA]/30 shadow-md rounded-md p-3 text-[#002B4C] font-body">
                <p className="text-sm">Center map on your current location</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}