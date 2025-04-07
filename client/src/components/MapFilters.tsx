import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Filter, SlidersHorizontal, X, Cloud, Plane, MapPin, Layers } from "lucide-react";
import { MapFilter } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MapFiltersProps {
  filters: MapFilter;
  onFilterChange: (filters: Partial<MapFilter>) => void;
}

export default function MapFilters({ filters, onFilterChange }: MapFiltersProps) {
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
      <div className="absolute top-[64px] left-0 right-0 bg-white flex items-center border-b shadow-sm px-4 py-1.5 z-[900] w-full">
        <div className="flex flex-row items-center">
          <div className="flex gap-1">
            <Button
              variant={filters.type === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-3 py-1 text-xs rounded-md bg-blue-100 hover:bg-blue-200 border-none text-blue-800"
              onClick={() => handleTypeChange('all')}
            >
              All
            </Button>
            
            <Button
              variant={filters.type === 'commercial' ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-3 py-1 text-xs rounded-md border-none"
              onClick={() => handleTypeChange('commercial')}
            >
              Commercial
            </Button>
            
            <Button
              variant={filters.type === 'private' ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-3 py-1 text-xs rounded-md border-none"
              onClick={() => handleTypeChange('private')}
            >
              Private
            </Button>
            
            <Button
              variant={filters.type === 'cargo' ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-3 py-1 text-xs rounded-md border-none"
              onClick={() => handleTypeChange('cargo')}
            >
              Cargo
            </Button>
          </div>

          <div className="border-l h-5 mx-4 border-gray-200"></div>

          {/* Display toggle buttons */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Cloud className="h-4 w-4 mr-1.5 text-blue-500" />
              <button 
                className="flex items-center"
                onClick={() => handleToggleWeather(!filters.showWeather)}
              >
                <div 
                  className={`w-6 h-3 rounded-full flex items-center p-0.5 transition-colors ${filters.showWeather ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <div 
                    className={`w-2 h-2 bg-white rounded-full transition-transform ${filters.showWeather ? 'translate-x-3' : 'translate-x-0'}`}
                  />
                </div>
              </button>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 text-blue-500" />
              <button 
                className="flex items-center"
                onClick={() => handleToggleAirports(!filters.showAirports)}
              >
                <div 
                  className={`w-6 h-3 rounded-full flex items-center p-0.5 transition-colors ${filters.showAirports ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <div 
                    className={`w-2 h-2 bg-white rounded-full transition-transform ${filters.showAirports ? 'translate-x-3' : 'translate-x-0'}`}
                  />
                </div>
              </button>
            </div>
          </div>

          <div className="ml-auto">
            <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-md h-7 text-xs px-2 border-gray-200"
                >
                  <SlidersHorizontal className="h-3 w-3 mr-1.5" />
                  Advanced
                  {advancedFilterCount > 0 && (
                    <span className="ml-1 bg-primary text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center">
                      {advancedFilterCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              
              <PopoverContent className="w-80 p-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-sm">Advanced Filters</h3>
                  {advancedFilterCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={clearFilters}
                    >
                      <X className="h-3 w-3" /> Clear All
                    </Button>
                  )}
                </div>
                <Tabs defaultValue="filters">
                  <TabsList className="w-full mb-2">
                    <TabsTrigger value="filters" className="flex-1">Filters</TabsTrigger>
                    <TabsTrigger value="display" className="flex-1">Display</TabsTrigger>
                    <TabsTrigger value="sort" className="flex-1">Sort</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="filters" className="mt-2 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="airline-filter" className="text-xs text-neutral-600">Airline</Label>
                      <Input 
                        id="airline-filter" 
                        placeholder="Filter by airline name or code" 
                        className="h-8 text-sm"
                        value={filters.airline || ''}
                        onChange={handleAirlineChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="aircraft-filter" className="text-xs text-neutral-600">Aircraft Type</Label>
                      <Input 
                        id="aircraft-filter" 
                        placeholder="E.g., B737, A320" 
                        className="h-8 text-sm"
                        value={filters.aircraft || ''}
                        onChange={handleAircraftChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tailnumber-filter" className="text-xs text-neutral-600">Tail Number</Label>
                      <Input 
                        id="tailnumber-filter" 
                        placeholder="Registration code" 
                        className="h-8 text-sm"
                        value={filters.tailNumber || ''}
                        onChange={handleTailNumberChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="purpose-filter" className="text-xs text-neutral-600">Flight Purpose</Label>
                      <Select 
                        onValueChange={handlePurposeChange}
                        value={filters.purpose || 'all'}
                      >
                        <SelectTrigger id="purpose-filter" className="h-8 text-sm">
                          <SelectValue placeholder="All purposes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All purposes</SelectItem>
                          <SelectItem value="passenger">Passenger</SelectItem>
                          <SelectItem value="freight">Freight/Cargo</SelectItem>
                          <SelectItem value="military">Military</SelectItem>
                          <SelectItem value="general">General Aviation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="display" className="mt-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weather-toggle" className="text-xs text-neutral-600">Weather Overlay</Label>
                      <Switch
                        id="weather-toggle"
                        checked={filters.showWeather}
                        onCheckedChange={handleToggleWeather}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="flight-paths-toggle" className="text-xs text-neutral-600">Flight Paths</Label>
                      <Switch
                        id="flight-paths-toggle"
                        checked={filters.showFlightPaths}
                        onCheckedChange={handleToggleFlightPaths}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="airports-toggle" className="text-xs text-neutral-600">Show Airports</Label>
                      <Switch
                        id="airports-toggle"
                        checked={filters.showAirports}
                        onCheckedChange={handleToggleAirports}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sort" className="mt-2 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="sort-by" className="text-xs text-neutral-600">Sort By</Label>
                      <Select 
                        onValueChange={handleSortChange}
                        value={filters.sortBy || ''}
                      >
                        <SelectTrigger id="sort-by" className="h-8 text-sm">
                          <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="airline">Airline</SelectItem>
                          <SelectItem value="altitude">Altitude</SelectItem>
                          <SelectItem value="speed">Speed</SelectItem>
                          <SelectItem value="departure">Departure Airport</SelectItem>
                          <SelectItem value="arrival">Arrival Airport</SelectItem>
                          <SelectItem value="time">Departure Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {filters.sortBy && (
                      <div className="space-y-2">
                        <Label htmlFor="sort-order" className="text-xs text-neutral-600">Sort Order</Label>
                        <Select 
                          onValueChange={handleSortOrderChange}
                          value={filters.sortOrder || 'asc'}
                        >
                          <SelectTrigger id="sort-order" className="h-8 text-sm">
                            <SelectValue placeholder="Select order" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
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
