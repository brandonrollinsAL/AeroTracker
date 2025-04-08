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

// Control Button with description
const ControlButton = ({ 
  icon, 
  label, 
  onClick, 
  isDarkMode,
  active = false
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void; 
  isDarkMode: boolean;
  active?: boolean;
}) => (
  <div className="flex flex-col items-center mx-3">
    <Button
      variant="ghost"
      size="sm"
      className={`rounded-full h-10 w-10 p-0 flex items-center justify-center mb-1 ${
        isDarkMode
          ? 'bg-[#003a65]/60 text-[#a0d0ec] hover:text-white hover:bg-[#003a65]'
          : 'bg-[#4995fd]/10 text-[#003a65] hover:text-[#003a65] hover:bg-[#4995fd]/20'
      } ${active ? (isDarkMode ? 'bg-[#003a65] ring-2 ring-[#4995fd]/40' : 'bg-[#4995fd]/30 ring-2 ring-[#4995fd]/40') : ''}`}
      onClick={onClick}
    >
      {icon}
    </Button>
    <span className={`text-[10px] font-medium text-center ${
      isDarkMode ? 'text-[#a0d0ec]/90' : 'text-[#003a65]/90'
    }`}>
      {label}
    </span>
  </div>
);

// Toggle Button with description
const ToggleButton = ({ 
  icon, 
  label, 
  active, 
  onChange, 
  isDarkMode 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onChange: (checked: boolean) => void; 
  isDarkMode: boolean; 
}) => (
  <div className="flex flex-col items-center mx-3">
    <div 
      className={`
        flex items-center justify-center rounded-full h-10 w-10 mb-1 cursor-pointer
        ${active
          ? isDarkMode
              ? 'bg-gradient-to-b from-[#003a65] to-[#004d80] ring-2 ring-[#4995fd]/40'
              : 'bg-gradient-to-b from-[#4995fd]/30 to-[#4995fd]/20 ring-2 ring-[#4995fd]/40'
          : isDarkMode
              ? 'bg-[#003a65]/60 hover:bg-[#003a65]/80'
              : 'bg-[#4995fd]/10 hover:bg-[#4995fd]/20'
        }
      `}
      onClick={() => onChange(!active)}
    >
      <div className={`h-5 w-5 ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}>
        {icon}
      </div>
    </div>
    <span className={`text-[10px] font-medium text-center ${
      isDarkMode ? 'text-[#a0d0ec]/90' : 'text-[#003a65]/90'
    }`}>
      {label}
    </span>
  </div>
);

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
    <div 
      className={`py-4 px-6 flex flex-wrap items-center justify-center sticky top-16 z-40 transition-all duration-300 backdrop-blur-sm ${
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
      {/* Map control buttons with descriptions */}
      <div className="flex items-center justify-center gap-2">
        {/* Weather overlay toggle */}
        <ToggleButton 
          icon={<Cloud className="h-full w-full" />}
          label="Weather"
          active={filters.showWeather}
          onChange={handleToggleWeather}
          isDarkMode={isDarkMode}
        />
        
        {/* Flight paths toggle */}
        <ToggleButton 
          icon={<Route className="h-full w-full" />}
          label="Flight Paths"
          active={filters.showFlightPaths}
          onChange={handleToggleFlightPaths}
          isDarkMode={isDarkMode}
        />
        
        {/* Airports toggle */}
        <ToggleButton 
          icon={<MapPin className="h-full w-full" />}
          label="Airports"
          active={filters.showAirports}
          onChange={handleToggleAirports}
          isDarkMode={isDarkMode}
        />
        
        {/* Live tracking toggle */}
        <ToggleButton 
          icon={<Plane className="h-full w-full" />}
          label="Live Tracking"
          active={filters.showLiveTracking}
          onChange={handleToggleLiveTracking}
          isDarkMode={isDarkMode}
        />
        
        {/* Map navigation controls */}
        <ControlButton 
          icon={<PlusIcon className="h-5 w-5" />}
          label="Zoom In"
          onClick={onZoomIn}
          isDarkMode={isDarkMode}
        />
        
        <ControlButton 
          icon={<MinusIcon className="h-5 w-5" />}
          label="Zoom Out"
          onClick={onZoomOut}
          isDarkMode={isDarkMode}
        />
        
        <ControlButton 
          icon={<Navigation className="h-5 w-5" />}
          label="My Location"
          onClick={onMyLocation}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
}