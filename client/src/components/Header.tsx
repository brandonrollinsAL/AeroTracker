import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import NavigationTabs from './NavigationTabs';
import { Button } from '@/components/ui/button';
import { MapFilter } from '@/types';

interface HeaderProps {
  onFilterChange: (filters: Partial<MapFilter>) => void;
}

export default function Header({ onFilterChange }: HeaderProps) {
  const [activeTab, setActiveTab] = useState('Live Map');
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Set appropriate filters based on the selected tab
    switch (tab) {
      case 'Live Map':
        // Default view - no special filter changes
        break;
      case 'Flight Status':
        // Show flights with specific statuses
        break;
      case 'Airports':
        // Show airports on the map
        onFilterChange({ showAirports: true });
        break;
      case 'Routes':
        // Show flight paths
        onFilterChange({ showFlightPaths: true });
        break;
      case 'Weather':
        // Show weather overlay
        onFilterChange({ showWeather: true });
        break;
      default:
        break;
    }
  };

  return (
    <header className="bg-white shadow-sm z-50 sticky top-0">
      <div className="flex justify-between items-center px-4 md:px-8 py-2 max-w-8xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="text-primary flying-animation">
            <span className="material-icons text-3xl">flight</span>
          </div>
          <h1 className="text-xl font-bold text-primary-dark tracking-tight hidden md:block">AeroTracker</h1>
          <h1 className="text-xl font-bold text-primary-dark tracking-tight md:hidden">AT</h1>
        </div>
        
        <SearchBar />
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="rounded-full">
            <span className="material-icons text-neutral-600">notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <span className="material-icons text-neutral-600">settings</span>
          </Button>
          <Button className="hidden md:flex">
            Sign Up
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full md:hidden">
            <span className="material-icons text-neutral-600">person</span>
          </Button>
        </div>
      </div>
      
      <NavigationTabs activeTab={activeTab} onTabChange={handleTabChange} />
    </header>
  );
}
