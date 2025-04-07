import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useContext } from "react";
import { SlidersHorizontal, X, Cloud, MapPin, Plane, Route, Filter } from "lucide-react";
import { MapFilter } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MapFiltersProps {
  filters: MapFilter;
  onFilterChange: (filters: Partial<MapFilter>) => void;
  isDarkMode?: boolean;
}

export default function MapFilters({ filters, onFilterChange, isDarkMode = false }: MapFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleTypeChange = (type: MapFilter['type']) => {
    onFilterChange({ type });
  };

  const handleToggleWeather = (checked: boolean) => {
    onFilterChange({ showWeather: checked });
  };

  const handleToggleFlightPaths = (checked: boolean) => {
    onFilterChange({ showFlightPaths: checked });
  };

  const handleToggleAirports = (checked: boolean) => {
    onFilterChange({ showAirports: checked });
  };

  const handleSortChange = (value: string) => {
    if (value) {
      onFilterChange({ sortBy: value as MapFilter['sortBy'] });
    }
  };

  const handleSortOrderChange = (value: string) => {
    if (value) {
      onFilterChange({ sortOrder: value as MapFilter['sortOrder'] });
    }
  };

  const handlePurposeChange = (value: string) => {
    if (value) {
      onFilterChange({ purpose: value as MapFilter['purpose'] });
    }
  };

  const handleAirlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ airline: e.target.value });
  };

  const handleAircraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ aircraft: e.target.value });
  };

  const handleTailNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ tailNumber: e.target.value });
  };

  const clearFilters = () => {
    onFilterChange({
      type: 'all',
      showWeather: false,
      showFlightPaths: false,
      showAirports: false,
      airline: undefined,
      aircraft: undefined,
      tailNumber: undefined,
      purpose: undefined,
      sortBy: undefined,
      sortOrder: undefined
    });
  };

  // Count active advanced filters
  const advancedFilterCount = [
    filters.airline, 
    filters.aircraft, 
    filters.tailNumber, 
    filters.purpose && filters.purpose !== 'all',
    filters.sortBy
  ].filter(Boolean).length;

  return (
    <TooltipProvider>
      <div 
        className={`
          absolute top-[64px] left-0 right-0 md:right-1/4 z-[800]
          ${isDarkMode 
            ? 'bg-[#002b4c]/95 border-b border-[#4995fd]/20' 
            : 'bg-white/95 border-b border-[#4995fd]/10'
          }
          backdrop-filter backdrop-blur-sm
        `}
        style={{
          boxShadow: isDarkMode 
            ? '0 4px 12px rgba(0,42,77,0.4), 0 2px 6px rgba(73,149,253,0.15)' 
            : '0 4px 12px rgba(73,149,253,0.08), 0 2px 4px rgba(73,149,253,0.05)',
          borderImage: isDarkMode
            ? 'linear-gradient(to right, rgba(0,58,101,0.3), rgba(73,149,253,0.3), rgba(0,58,101,0.3)) 1'
            : 'linear-gradient(to right, rgba(73,149,253,0.1), rgba(73,149,253,0.2), rgba(73,149,253,0.1)) 1',
          borderImageSlice: 1,
          padding: '0 16px' // Add padding to ensure content doesn't touch screen edges
        }}
      >
        <div className="mx-4 my-1.5 flex items-center space-x-2 text-xs">
          <div className={`flex items-center mr-1 p-0.5 rounded-md ${isDarkMode ? 'bg-[#003a65]/60 shadow-inner' : 'bg-[#4995fd]/10 shadow-inner'}`} style={{ border: isDarkMode ? '1px solid rgba(73,149,253,0.15)' : '1px solid rgba(73,149,253,0.1)' }}>
            <Button
              variant="ghost"
              size="sm"
              className={`
                h-7 px-2 text-xs rounded-sm font-medium
                ${filters.type === 'all' 
                  ? isDarkMode 
                    ? 'bg-[#4995fd] text-white shadow-md' 
                    : 'bg-[#4995fd] text-white shadow-sm' 
                  : isDarkMode 
                    ? 'text-[#a0d0ec] hover:bg-[#003a65]' 
                    : 'text-[#003a65] hover:bg-[#4995fd]/10'
                }
              `}
              onClick={() => handleTypeChange('all')}
            >
              All
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`
                h-7 px-2 text-xs rounded-sm font-medium
                ${filters.type === 'commercial' 
                  ? isDarkMode 
                    ? 'bg-[#4995fd] text-white shadow-md' 
                    : 'bg-[#4995fd] text-white shadow-sm' 
                  : isDarkMode 
                    ? 'text-[#a0d0ec] hover:bg-[#003a65]' 
                    : 'text-[#003a65] hover:bg-[#4995fd]/10'
                }
              `}
              onClick={() => handleTypeChange('commercial')}
            >
              Commercial
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`
                h-7 px-2 text-xs rounded-sm font-medium
                ${filters.type === 'private' 
                  ? isDarkMode 
                    ? 'bg-[#4995fd] text-white shadow-md' 
                    : 'bg-[#4995fd] text-white shadow-sm' 
                  : isDarkMode 
                    ? 'text-[#a0d0ec] hover:bg-[#003a65]' 
                    : 'text-[#003a65] hover:bg-[#4995fd]/10'
                }
              `}
              onClick={() => handleTypeChange('private')}
            >
              Private
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`
                h-7 px-2 text-xs rounded-sm font-medium
                ${filters.type === 'cargo' 
                  ? isDarkMode 
                    ? 'bg-[#4995fd] text-white shadow-md' 
                    : 'bg-[#4995fd] text-white shadow-sm' 
                  : isDarkMode 
                    ? 'text-[#a0d0ec] hover:bg-[#003a65]' 
                    : 'text-[#003a65] hover:bg-[#4995fd]/10'
                }
              `}
              onClick={() => handleTypeChange('cargo')}
            >
              Cargo
            </Button>
          </div>
          
          <div className="flex items-center h-7 space-x-3 pl-2 ml-1 border-l border-[#4995fd]/10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Cloud className={`h-4 w-4 mr-1.5 ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`} />
                  <div 
                    className={`
                      w-10 h-4 rounded-full flex items-center transition-all cursor-pointer 
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
                          ? 'bg-white translate-x-6 shadow-md' 
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
                  <Route className={`h-4 w-4 mr-1.5 ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`} />
                  <div 
                    className={`
                      w-10 h-4 rounded-full flex items-center transition-all cursor-pointer 
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
                          ? 'bg-white translate-x-6 shadow-md' 
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
                  <MapPin className={`h-4 w-4 mr-1.5 ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`} />
                  <div 
                    className={`
                      w-10 h-4 rounded-full flex items-center transition-all cursor-pointer 
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
                          ? 'bg-white translate-x-6 shadow-md' 
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

          <div className="ml-auto">
            <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <PopoverTrigger asChild>
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
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#4995fd]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  <Filter className={`h-3 w-3 mr-1.5 relative z-10 group-hover:text-[#4995fd] transition-colors duration-300 ${
                    isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'
                  }`} />
                  <span className="relative z-10 group-hover:font-medium transition-all duration-300">Advanced</span>
                  {advancedFilterCount > 0 && (
                    <span className={`
                      ml-1.5 w-4 h-4 rounded-full text-[10px] font-medium flex items-center justify-center relative z-10
                      ${isDarkMode 
                        ? 'bg-gradient-to-r from-[#003a65] to-[#4995fd] text-white'
                        : 'bg-gradient-to-r from-[#4995fd] to-[#a0d0ec] text-white'
                      }
                    `}
                    style={{
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 0 0 1px rgba(73,149,253,0.3)'
                    }}
                    >
                      {advancedFilterCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              
              <PopoverContent 
                className={`
                  w-80 p-4 border rounded-lg 
                  ${isDarkMode 
                    ? 'bg-[#002b4c] border-[#4995fd]/20'
                    : 'bg-white border-[#4995fd]/10'
                  }
                `}
                style={{
                  boxShadow: isDarkMode 
                    ? '0 10px 25px -5px rgba(0,0,0,0.4), 0 8px 10px -6px rgba(0,0,0,0.2), 0 0 0 1px rgba(73,149,253,0.1)' 
                    : '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05), 0 0 0 1px rgba(73,149,253,0.05)',
                  borderImage: isDarkMode
                    ? 'linear-gradient(to bottom, rgba(73,149,253,0.3), rgba(0,58,101,0.1)) 1'
                    : 'linear-gradient(to bottom, rgba(73,149,253,0.2), rgba(160,208,236,0.05)) 1',
                  borderImageSlice: 1
                }}
                sideOffset={8}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>
                    Advanced Filters
                  </h3>
                  {advancedFilterCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`
                        h-6 px-2 text-xs flex items-center gap-1 
                        ${isDarkMode 
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                          : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                        }
                      `}
                      onClick={clearFilters}
                    >
                      <X className="h-3 w-3" /> Clear All
                    </Button>
                  )}
                </div>
                
                <Tabs defaultValue="filters" className="mt-1">
                  <TabsList 
                    className={`
                      w-full mb-3 p-1 rounded-md
                      ${isDarkMode 
                        ? 'bg-[#003a65]/60' 
                        : 'bg-[#4995fd]/5'
                      }
                    `}
                    style={{
                      border: isDarkMode 
                        ? '1px solid rgba(73,149,253,0.15)' 
                        : '1px solid rgba(73,149,253,0.1)',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    <TabsTrigger 
                      value="filters" 
                      className={`
                        flex-1 text-xs relative overflow-hidden
                        ${isDarkMode
                          ? 'data-[state=active]:bg-gradient-to-r from-[#003a65] to-[#4995fd] data-[state=active]:text-white data-[state=active]:shadow'
                          : 'data-[state=active]:bg-gradient-to-r from-[#4995fd] to-[#a0d0ec] data-[state=active]:text-white data-[state=active]:shadow-sm'
                        }
                        group transition-all duration-300
                      `}
                      style={{
                        boxShadow: isDarkMode 
                          ? 'data-[state=active]:0 2px 5px rgba(0,58,101,0.4)'
                          : 'data-[state=active]:0 2px 5px rgba(73,149,253,0.3)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#a0d0ec]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-data-[state=active]:opacity-30"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#4995fd]/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 group-data-[state=active]:hidden"></div>
                      <Filter className="h-3 w-3 mr-1.5 relative z-10 group-data-[state=active]:text-white group-hover:text-[#4995fd] transition-colors duration-300" />
                      <span className="relative z-10 group-hover:font-medium transition-all duration-300">Filters</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="display" 
                      className={`
                        flex-1 text-xs relative overflow-hidden
                        ${isDarkMode
                          ? 'data-[state=active]:bg-gradient-to-r from-[#003a65] to-[#4995fd] data-[state=active]:text-white data-[state=active]:shadow'
                          : 'data-[state=active]:bg-gradient-to-r from-[#4995fd] to-[#a0d0ec] data-[state=active]:text-white data-[state=active]:shadow-sm'
                        }
                        group transition-all duration-300
                      `}
                      style={{
                        boxShadow: isDarkMode 
                          ? 'data-[state=active]:0 2px 5px rgba(0,58,101,0.4)'
                          : 'data-[state=active]:0 2px 5px rgba(73,149,253,0.3)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#a0d0ec]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-data-[state=active]:opacity-30"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#4995fd]/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 group-data-[state=active]:hidden"></div>
                      <Plane className="h-3 w-3 mr-1.5 relative z-10 group-data-[state=active]:text-white group-hover:text-[#4995fd] transition-colors duration-300" />
                      <span className="relative z-10 group-hover:font-medium transition-all duration-300">Display</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="sort" 
                      className={`
                        flex-1 text-xs relative overflow-hidden
                        ${isDarkMode
                          ? 'data-[state=active]:bg-gradient-to-r from-[#003a65] to-[#4995fd] data-[state=active]:text-white data-[state=active]:shadow'
                          : 'data-[state=active]:bg-gradient-to-r from-[#4995fd] to-[#a0d0ec] data-[state=active]:text-white data-[state=active]:shadow-sm'
                        }
                        group transition-all duration-300
                      `}
                      style={{
                        boxShadow: isDarkMode 
                          ? 'data-[state=active]:0 2px 5px rgba(0,58,101,0.4)'
                          : 'data-[state=active]:0 2px 5px rgba(73,149,253,0.3)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#a0d0ec]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-data-[state=active]:opacity-30"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#4995fd]/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 group-data-[state=active]:hidden"></div>
                      <SlidersHorizontal className="h-3 w-3 mr-1.5 relative z-10 group-data-[state=active]:text-white group-hover:text-[#4995fd] transition-colors duration-300" />
                      <span className="relative z-10 group-hover:font-medium transition-all duration-300">Sort</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="filters" className="mt-2 space-y-3.5">
                    <div className="space-y-1.5">
                      <Label 
                        htmlFor="airline-filter" 
                        className={`text-xs font-medium ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}
                      >
                        Airline
                      </Label>
                      <Input 
                        id="airline-filter" 
                        placeholder="Filter by airline name or code" 
                        className={`
                          h-8 text-sm 
                          ${isDarkMode 
                            ? 'bg-[#003a65]/50 border-[#4995fd]/20 text-white placeholder:text-white/40' 
                            : 'border-[#4995fd]/20 text-[#003a65] placeholder:text-[#003a65]/40'
                          }
                          focus-visible:ring-[#4995fd]/30 focus-visible:border-[#4995fd]
                        `}
                        style={{
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                        }}
                        value={filters.airline || ''}
                        onChange={handleAirlineChange}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label 
                        htmlFor="aircraft-filter" 
                        className={`text-xs font-medium ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}
                      >
                        Aircraft Type
                      </Label>
                      <Input 
                        id="aircraft-filter" 
                        placeholder="E.g., B737, A320" 
                        className={`
                          h-8 text-sm 
                          ${isDarkMode 
                            ? 'bg-[#003a65]/50 border-[#4995fd]/20 text-white placeholder:text-white/40' 
                            : 'border-[#4995fd]/20 text-[#003a65] placeholder:text-[#003a65]/40'
                          }
                          focus-visible:ring-[#4995fd]/30
                        `}
                        value={filters.aircraft || ''}
                        onChange={handleAircraftChange}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label 
                        htmlFor="tailnumber-filter" 
                        className={`text-xs font-medium ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}
                      >
                        Tail Number
                      </Label>
                      <Input 
                        id="tailnumber-filter" 
                        placeholder="Registration code" 
                        className={`
                          h-8 text-sm 
                          ${isDarkMode 
                            ? 'bg-[#003a65]/50 border-[#4995fd]/20 text-white placeholder:text-white/40' 
                            : 'border-[#4995fd]/20 text-[#003a65] placeholder:text-[#003a65]/40'
                          }
                          focus-visible:ring-[#4995fd]/30
                        `}
                        value={filters.tailNumber || ''}
                        onChange={handleTailNumberChange}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label 
                        htmlFor="purpose-filter" 
                        className={`text-xs font-medium ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}
                      >
                        Flight Purpose
                      </Label>
                      <Select 
                        onValueChange={handlePurposeChange}
                        value={filters.purpose || 'all'}
                      >
                        <SelectTrigger 
                          id="purpose-filter" 
                          className={`
                            h-8 text-sm aviation-select-trigger
                            ${isDarkMode 
                              ? 'bg-[#003a65]/50 border-[#4995fd]/20 text-white' 
                              : 'border-[#4995fd]/20 text-[#003a65]'
                            }
                            focus:ring-[#4995fd]/30
                          `}
                        >
                          <SelectValue placeholder="All purposes" />
                        </SelectTrigger>
                        <SelectContent className={`
                          aviation-select-content text-sm
                          ${isDarkMode 
                            ? 'bg-[#002b4c] border-[#4995fd]/20' 
                            : 'bg-white border-[#4995fd]/20'
                          }
                        `}>
                          <SelectItem value="all" className="aviation-select-item">All purposes</SelectItem>
                          <SelectItem value="passenger" className="aviation-select-item">Passenger</SelectItem>
                          <SelectItem value="freight" className="aviation-select-item">Freight/Cargo</SelectItem>
                          <SelectItem value="military" className="aviation-select-item">Military</SelectItem>
                          <SelectItem value="general" className="aviation-select-item">General Aviation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="display" className="mt-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label 
                        htmlFor="weather-toggle" 
                        className={`text-xs font-medium ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}
                      >
                        Weather Overlay
                      </Label>
                      <Switch
                        id="weather-toggle"
                        checked={filters.showWeather}
                        onCheckedChange={handleToggleWeather}
                        className={`
                          data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#4995fd] data-[state=checked]:to-[#a0d0ec]
                          ${isDarkMode 
                            ? 'border-[#4995fd]/30 bg-[#003a65]/50' 
                            : 'border-[#4995fd]/20'
                          }
                        `}
                        style={{
                          boxShadow: filters.showWeather 
                            ? '0 2px 4px rgba(73,149,253,0.3)' 
                            : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label 
                        htmlFor="flight-paths-toggle" 
                        className={`text-xs font-medium ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}
                      >
                        Flight Paths
                      </Label>
                      <Switch
                        id="flight-paths-toggle"
                        checked={filters.showFlightPaths}
                        onCheckedChange={handleToggleFlightPaths}
                        className={`
                          data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#4995fd] data-[state=checked]:to-[#a0d0ec]
                          ${isDarkMode 
                            ? 'border-[#4995fd]/30 bg-[#003a65]/50' 
                            : 'border-[#4995fd]/20'
                          }
                        `}
                        style={{
                          boxShadow: filters.showFlightPaths 
                            ? '0 2px 4px rgba(73,149,253,0.3)' 
                            : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label 
                        htmlFor="airports-toggle" 
                        className={`text-xs font-medium ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}
                      >
                        Show Airports
                      </Label>
                      <Switch
                        id="airports-toggle"
                        checked={filters.showAirports}
                        onCheckedChange={handleToggleAirports}
                        className={`
                          data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#4995fd] data-[state=checked]:to-[#a0d0ec]
                          ${isDarkMode 
                            ? 'border-[#4995fd]/30 bg-[#003a65]/50' 
                            : 'border-[#4995fd]/20'
                          }
                        `}
                        style={{
                          boxShadow: filters.showAirports 
                            ? '0 2px 4px rgba(73,149,253,0.3)' 
                            : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sort" className="mt-2 space-y-3.5">
                    <div className="space-y-1.5">
                      <Label 
                        htmlFor="sort-by" 
                        className={`text-xs font-medium ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}
                      >
                        Sort By
                      </Label>
                      <Select 
                        onValueChange={handleSortChange}
                        value={filters.sortBy || ''}
                      >
                        <SelectTrigger 
                          id="sort-by" 
                          className={`
                            h-8 text-sm aviation-select-trigger
                            ${isDarkMode 
                              ? 'bg-[#003a65]/50 border-[#4995fd]/20 text-white' 
                              : 'border-[#4995fd]/20 text-[#003a65]'
                            }
                            focus:ring-[#4995fd]/30
                          `}
                        >
                          <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent className={`
                          aviation-select-content text-sm
                          ${isDarkMode 
                            ? 'bg-[#002b4c] border-[#4995fd]/20' 
                            : 'bg-white border-[#4995fd]/20'
                          }
                        `}>
                          <SelectItem value="airline" className="aviation-select-item">Airline</SelectItem>
                          <SelectItem value="altitude" className="aviation-select-item">Altitude</SelectItem>
                          <SelectItem value="speed" className="aviation-select-item">Speed</SelectItem>
                          <SelectItem value="departure" className="aviation-select-item">Departure Airport</SelectItem>
                          <SelectItem value="arrival" className="aviation-select-item">Arrival Airport</SelectItem>
                          <SelectItem value="time" className="aviation-select-item">Departure Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {filters.sortBy && (
                      <div className="space-y-1.5">
                        <Label 
                          htmlFor="sort-order" 
                          className={`text-xs font-medium ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}
                        >
                          Sort Order
                        </Label>
                        <Select 
                          onValueChange={handleSortOrderChange}
                          value={filters.sortOrder || 'asc'}
                        >
                          <SelectTrigger 
                            id="sort-order" 
                            className={`
                              h-8 text-sm aviation-select-trigger
                              ${isDarkMode 
                                ? 'bg-[#003a65]/50 border-[#4995fd]/20 text-white' 
                                : 'border-[#4995fd]/20 text-[#003a65]'
                              }
                              focus:ring-[#4995fd]/30
                            `}
                          >
                            <SelectValue placeholder="Select order" />
                          </SelectTrigger>
                          <SelectContent className={`
                            aviation-select-content text-sm
                            ${isDarkMode 
                              ? 'bg-[#002b4c] border-[#4995fd]/20' 
                              : 'bg-white border-[#4995fd]/20'
                            }
                          `}>
                            <SelectItem value="asc" className="aviation-select-item">Ascending</SelectItem>
                            <SelectItem value="desc" className="aviation-select-item">Descending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
