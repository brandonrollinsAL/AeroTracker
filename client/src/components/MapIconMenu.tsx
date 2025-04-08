import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  MapIcon, 
  BarChart3Icon, 
  PlusIcon, 
  MinusIcon,
  Cloud,
  Route,
  MapPin,
  Filter,
  Layers,
  Navigation,
  Zap,
  LayoutGrid
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
            <Button 
              size="sm"
              className={`flex items-center h-7 px-3 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-[#003a65] to-[#4995fd] hover:from-[#003a65]/90 hover:to-[#4995fd]/90 text-white' 
                  : 'bg-gradient-to-r from-[#4995fd] to-[#003a65] hover:from-[#0a4995] hover:to-[#4995fd] text-white'
              } rounded-md transition-all duration-200 relative overflow-hidden group`}
              style={{
                boxShadow: '0 2px 5px rgba(73, 149, 253, 0.3)'
              }}
            >
              <div className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <MapIcon className="h-3.5 w-3.5 mr-1.5 relative z-10" />
              <span className="text-xs font-medium relative z-10">Map</span>
            </Button>
            
            <div className="mx-1 h-5 w-px bg-[#4995fd]/20"></div>
            
            <Button 
              variant="ghost" 
              size="sm"
              className={`flex items-center h-7 px-3 rounded-md ${
                isDarkMode 
                  ? 'text-[#a0d0ec] hover:text-white hover:bg-[#003a65]/40 border border-[#003a65]/30' 
                  : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/20'
              } relative overflow-hidden group`}
              style={{
                background: isDarkMode
                  ? 'linear-gradient(to right, rgba(0,58,101,0.3), rgba(73,149,253,0.1))'
                  : 'linear-gradient(to right, rgba(73,149,253,0.05), rgba(160,208,236,0.1))',
                boxShadow: isDarkMode
                  ? 'inset 0 1px 1px rgba(73,149,253,0.1)'
                  : 'inset 0 1px 1px rgba(255,255,255,0.7)'
              }}
            >
              <div className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-[#4995fd]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <BarChart3Icon className="h-3.5 w-3.5 mr-1.5 relative z-10" />
              <span className="text-xs relative z-10">Stats</span> 
            </Button>
            
            <div className="mx-1 h-5 w-px bg-[#4995fd]/20"></div>
            
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
                  >
                    <Layers size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Map Layers</TooltipContent>
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
          </div>
          
          <div className="border-l border-[#4995fd]/10 pl-2 ml-1 flex items-center space-x-2">
            {/* Flight Tracking Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`
                    rounded h-7 text-xs px-2.5 group relative overflow-hidden
                    ${isDarkMode 
                      ? 'border-[#4995fd]/30 text-[#a0d0ec] hover:border-[#4995fd]/60 hover:bg-[#003a65]/80'
                      : 'border-[#4995fd]/20 text-[#003a65] hover:border-[#4995fd]/50 hover:bg-[#4995fd]/10'
                    }
                    transition-all duration-200
                  `}
                  style={{
                    background: isDarkMode 
                      ? 'linear-gradient(180deg, rgba(0,58,101,0.5) 0%, rgba(0,43,76,0.5) 100%)' 
                      : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,248,255,0.95) 100%)',
                    boxShadow: isDarkMode 
                      ? '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(73,149,253,0.05)' 
                      : '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(73,149,253,0.03)'
                  }}
                  onClick={() => {
                    // Trigger flight tracking tab
                    window.dispatchEvent(new CustomEvent('select-tab', { detail: { tab: 'map' }}));
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4995fd]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="material-icons mr-1.5 text-xs relative z-10" style={{ fontSize: '14px', color: isDarkMode ? '#a0d0ec' : '#4995fd' }}>flight</span>
                  <span className="relative z-10 group-hover:font-medium transition-all duration-300">Track Flights</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-medium">
                Flight Tracking
              </TooltipContent>
            </Tooltip>
            
            {/* Route Optimization Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`
                    rounded h-7 text-xs px-2.5 group relative overflow-hidden
                    ${isDarkMode 
                      ? 'border-[#4995fd]/30 text-[#a0d0ec] hover:border-[#4995fd]/60 hover:bg-[#003a65]/80'
                      : 'border-[#4995fd]/20 text-[#003a65] hover:border-[#4995fd]/50 hover:bg-[#4995fd]/10'
                    }
                    transition-all duration-200
                  `}
                  style={{
                    background: isDarkMode 
                      ? 'linear-gradient(180deg, rgba(0,58,101,0.5) 0%, rgba(0,43,76,0.5) 100%)' 
                      : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,248,255,0.95) 100%)',
                    boxShadow: isDarkMode 
                      ? '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(73,149,253,0.05)' 
                      : '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(73,149,253,0.03)'
                  }}
                  onClick={() => {
                    // Trigger route optimization tab
                    window.dispatchEvent(new CustomEvent('select-tab', { detail: { tab: 'tools' }}));
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4995fd]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <Route className={`h-3 w-3 mr-1.5 relative z-10 group-hover:text-[#4995fd] transition-colors duration-300 ${
                    isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'
                  }`} />
                  <span className="relative z-10 group-hover:font-medium transition-all duration-300">Optimize Routes</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-medium">
                Route Optimization
              </TooltipContent>
            </Tooltip>
            
            {/* More Filters Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`
                    rounded h-7 text-xs px-2.5 group relative overflow-hidden
                    ${isDarkMode 
                      ? 'border-[#4995fd]/30 text-[#a0d0ec] hover:border-[#4995fd]/60 hover:bg-[#003a65]/80'
                      : 'border-[#4995fd]/20 text-[#003a65] hover:border-[#4995fd]/50 hover:bg-[#4995fd]/10'
                    }
                    transition-all duration-200
                  `}
                  style={{
                    background: isDarkMode 
                      ? 'linear-gradient(180deg, rgba(0,58,101,0.5) 0%, rgba(0,43,76,0.5) 100%)' 
                      : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,248,255,0.95) 100%)',
                    boxShadow: isDarkMode 
                      ? '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(73,149,253,0.05)' 
                      : '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(73,149,253,0.03)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4995fd]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <Filter className={`h-3 w-3 mr-1.5 relative z-10 group-hover:text-[#4995fd] transition-colors duration-300 ${
                    isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'
                  }`} />
                  <span className="relative z-10 group-hover:font-medium transition-all duration-300">More Filters</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-medium">
                Advanced Filters
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {/* Right section */}
        <div className="flex items-center space-x-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`
                  rounded-md h-7 px-2.5 group relative overflow-hidden
                  ${isDarkMode 
                    ? 'border border-[#4995fd]/30 text-[#a0d0ec] hover:border-[#4995fd]/60 hover:bg-[#003a65]/50'
                    : 'border border-[#4995fd]/20 text-[#003a65] hover:border-[#4995fd]/50 hover:bg-[#4995fd]/10'
                  }
                  transition-all duration-200
                `}
              >
                <LayoutGrid className={`h-3.5 w-3.5 mr-1.5 ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`} />
                <span className="text-xs">Grid</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs font-medium">
              Toggle Grid
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`
                  rounded-md h-7 px-2.5 group relative overflow-hidden
                  ${isDarkMode 
                    ? 'border border-[#4995fd]/30 text-[#a0d0ec] hover:border-[#4995fd]/60 hover:bg-[#003a65]/50'
                    : 'border border-[#4995fd]/20 text-[#003a65] hover:border-[#4995fd]/50 hover:bg-[#4995fd]/10'
                  }
                  transition-all duration-200
                `}
              >
                <Zap className={`h-3.5 w-3.5 mr-1.5 ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`} />
                <span className="text-xs">Tracks</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs font-medium">
              Show Flight Tracks
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}