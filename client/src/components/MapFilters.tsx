import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapFilter } from "@/types";

interface MapFiltersProps {
  filters: MapFilter;
  onFilterChange: (filters: Partial<MapFilter>) => void;
}

export default function MapFilters({ filters, onFilterChange }: MapFiltersProps) {
  const handleTypeChange = (type: MapFilter['type']) => {
    onFilterChange({ type });
  };

  const handleToggleWeather = (checked: boolean) => {
    onFilterChange({ showWeather: checked });
  };

  const handleToggleFlightPaths = (checked: boolean) => {
    onFilterChange({ showFlightPaths: checked });
  };

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-xs">
      <div className="flex flex-col space-y-3">
        <h3 className="font-medium text-sm text-neutral-800">Map Filters</h3>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.type === 'all' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full text-xs h-7"
            onClick={() => handleTypeChange('all')}
          >
            All Flights
          </Button>
          
          <Button
            variant={filters.type === 'commercial' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full text-xs h-7"
            onClick={() => handleTypeChange('commercial')}
          >
            Commercial
          </Button>
          
          <Button
            variant={filters.type === 'private' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full text-xs h-7"
            onClick={() => handleTypeChange('private')}
          >
            Private
          </Button>
          
          <Button
            variant={filters.type === 'cargo' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full text-xs h-7"
            onClick={() => handleTypeChange('cargo')}
          >
            Cargo
          </Button>
        </div>
        
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
      </div>
    </div>
  );
}
