import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  MapIcon, 
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
  
  const handleToggleWeather = (checked: boolean) => {
    onFilterChange({ showWeather: checked });
  };

  const handleToggleFlightPaths = (checked: boolean) => {
    onFilterChange({ showFlightPaths: checked });
  };

  const handleToggleAirports = (checked: boolean) => {
    onFilterChange({ showAirports: checked });
  };
  
  const handleToggleLiveTracking = (checked: boolean) => {
    onFilterChange({ showLiveTracking: checked });
  };

  return (
    <TooltipProvider>
      <div 
        className={`h-12 py-1.5 px-6 flex items-center justify-between sticky top-16 z-40 transition-all duration-300 backdrop-blur-sm ${
          isDarkMode 
            ? 'bg-[#002b4c]/95 border-b border-[#003a65]/40' 
            : 'bg-white/95 border-b border-[#4995fd]/20'
        }`}
        style={{
          backgroundImage: isDarkMode 
            ? 'linear-gradient(to right, rgba(0,42,77,0.97), rgba(0,58,101,0.97))' 
            : 'linear-gradient(to right, rgba(255,255,255,0.97), rgba(240,248,255,0.97))',
          boxShadow: isDarkMode 
            ? '0 4px 12px rgba(0,42,77,0.4), 0 2px 6px rgba(73,149,253,0.15)' 
            : '0 4px 8px rgba(73,149,253,0.08), 0 2px 4px rgba(73,149,253,0.05)',
          borderImage: isDarkMode
            ? 'linear-gradient(to right, rgba(0,58,101,0.3), rgba(73,149,253,0.3), rgba(0,58,101,0.3)) 1'
            : 'linear-gradient(to right, rgba(73,149,253,0.1), rgba(73,149,253,0.2), rgba(73,149,253,0.1)) 1'
        }}
      >
        {/* Left section - Map toggles */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center p-1.5 bg-[#4995fd]/10 rounded-lg border border-[#4995fd]/20">            
            <div className="px-1 flex items-center space-x-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded p-1 ${
                      isDarkMode
                        ? 'text-[#a0d0ec]/80 hover:text-white hover:bg-[#003a65]/40'
                        : 'text-[#003a65]/70 hover:text-[#003a65] hover:bg-[#4995fd]/10'
                    }`}
                    onClick={onZoomIn}
                  >
                    <PlusIcon size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Zoom In</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded p-1 ${
                      isDarkMode
                        ? 'text-[#a0d0ec]/80 hover:text-white hover:bg-[#003a65]/40'
                        : 'text-[#003a65]/70 hover:text-[#003a65] hover:bg-[#4995fd]/10'
                    }`}
                    onClick={onZoomOut}
                  >
                    <MinusIcon size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Zoom Out</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded p-1 ${
                      isDarkMode
                        ? 'text-[#a0d0ec]/80 hover:text-white hover:bg-[#003a65]/40'
                        : 'text-[#003a65]/70 hover:text-[#003a65] hover:bg-[#4995fd]/10'
                    }`}
                    onClick={onMyLocation}
                  >
                    <Navigation size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">My Location</TooltipContent>
              </Tooltip>
            </div>
          </div>
        
          {/* Toggles */}
          <div className="flex items-center h-7 space-x-3 pl-2 ml-1 border-l border-[#4995fd]/10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Cloud className={`h-3.5 w-3.5 mr-1.5 ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`} />
                  <div 
                    className={`
                      w-9 h-4 rounded-full flex items-center transition-all cursor-pointer 
                      ${filters.showWeather 
                        ? 'bg-gradient-to-r from-[#003a65] to-[#4995fd]' 
                        : isDarkMode ? 'bg-[#003a65]/70' : 'bg-[#4995fd]/10'
                      } 
                      border ${filters.showWeather 
                        ? 'border-[#4995fd]/40' 
                        : isDarkMode ? 'border-[#003a65]/80' : 'border-[#4995fd]/20'
                      }
                    `}
                    onClick={() => handleToggleWeather(!filters.showWeather)}
                    style={{
                      boxShadow: filters.showWeather 
                        ? (isDarkMode ? '0 0 6px rgba(73,149,253,0.4)' : '0 0 4px rgba(73,149,253,0.3)') 
                        : 'none'
                    }}
                  >
                    <div 
                      className={`
                        w-3 h-3 rounded-full transition-all transform mx-0.5 
                        ${filters.showWeather 
                          ? 'bg-white translate-x-5 shadow-md' 
                          : isDarkMode ? 'bg-[#a0d0ec]/90 shadow-sm' : 'bg-white shadow-sm'
                        }
                      `}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-medium">
                Weather Overlay
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Route className={`h-3.5 w-3.5 mr-1.5 ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`} />
                  <div 
                    className={`
                      w-9 h-4 rounded-full flex items-center transition-all cursor-pointer 
                      ${filters.showFlightPaths 
                        ? 'bg-gradient-to-r from-[#003a65] to-[#4995fd]' 
                        : isDarkMode ? 'bg-[#003a65]/70' : 'bg-[#4995fd]/10'
                      } 
                      border ${filters.showFlightPaths 
                        ? 'border-[#4995fd]/40' 
                        : isDarkMode ? 'border-[#003a65]/80' : 'border-[#4995fd]/20'
                      }
                    `}
                    onClick={() => handleToggleFlightPaths(!filters.showFlightPaths)}
                    style={{
                      boxShadow: filters.showFlightPaths 
                        ? (isDarkMode ? '0 0 6px rgba(73,149,253,0.4)' : '0 0 4px rgba(73,149,253,0.3)') 
                        : 'none'
                    }}
                  >
                    <div 
                      className={`
                        w-3 h-3 rounded-full transition-all transform mx-0.5 
                        ${filters.showFlightPaths 
                          ? 'bg-white translate-x-5 shadow-md' 
                          : isDarkMode ? 'bg-[#a0d0ec]/90 shadow-sm' : 'bg-white shadow-sm'
                        }
                      `}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-medium">
                Flight Paths
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <MapPin className={`h-3.5 w-3.5 mr-1.5 ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`} />
                  <div 
                    className={`
                      w-9 h-4 rounded-full flex items-center transition-all cursor-pointer 
                      ${filters.showAirports 
                        ? 'bg-gradient-to-r from-[#003a65] to-[#4995fd]' 
                        : isDarkMode ? 'bg-[#003a65]/70' : 'bg-[#4995fd]/10'
                      } 
                      border ${filters.showAirports 
                        ? 'border-[#4995fd]/40' 
                        : isDarkMode ? 'border-[#003a65]/80' : 'border-[#4995fd]/20'
                      }
                    `}
                    onClick={() => handleToggleAirports(!filters.showAirports)}
                    style={{
                      boxShadow: filters.showAirports 
                        ? (isDarkMode ? '0 0 6px rgba(73,149,253,0.4)' : '0 0 4px rgba(73,149,253,0.3)') 
                        : 'none'
                    }}
                  >
                    <div 
                      className={`
                        w-3 h-3 rounded-full transition-all transform mx-0.5 
                        ${filters.showAirports 
                          ? 'bg-white translate-x-5 shadow-md' 
                          : isDarkMode ? 'bg-[#a0d0ec]/90 shadow-sm' : 'bg-white shadow-sm'
                        }
                      `}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-medium">
                Show Airports
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Plane className={`h-3.5 w-3.5 mr-1.5 ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`} />
                  <div 
                    className={`
                      w-9 h-4 rounded-full flex items-center transition-all cursor-pointer 
                      ${filters.showLiveTracking 
                        ? 'bg-gradient-to-r from-[#003a65] to-[#4995fd]' 
                        : isDarkMode ? 'bg-[#003a65]/70' : 'bg-[#4995fd]/10'
                      } 
                      border ${filters.showLiveTracking 
                        ? 'border-[#4995fd]/40' 
                        : isDarkMode ? 'border-[#003a65]/80' : 'border-[#4995fd]/20'
                      }
                    `}
                    onClick={() => handleToggleLiveTracking(!filters.showLiveTracking)}
                    style={{
                      boxShadow: filters.showLiveTracking 
                        ? (isDarkMode ? '0 0 6px rgba(73,149,253,0.4)' : '0 0 4px rgba(73,149,253,0.3)') 
                        : 'none'
                    }}
                  >
                    <div 
                      className={`
                        w-3 h-3 rounded-full transition-all transform mx-0.5 
                        ${filters.showLiveTracking 
                          ? 'bg-white translate-x-5 shadow-md' 
                          : isDarkMode ? 'bg-[#a0d0ec]/90 shadow-sm' : 'bg-white shadow-sm'
                        }
                      `}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-medium">
                Live Tracking
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Action buttons removed to simplify UI */}
          </div>
        
        {/* Right section removed to simplify UI */}
        <div className="flex items-center space-x-3"></div>
      </div>
    </TooltipProvider>
  );
}