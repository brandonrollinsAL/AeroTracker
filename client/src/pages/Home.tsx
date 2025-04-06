import { useState } from "react";
import Header from "@/components/Header";
import FlightMap from "@/components/FlightMap";
import FlightList from "@/components/FlightList";
import FlightDetailModal from "@/components/FlightDetailModal";
import FloatingActionButton from "@/components/FloatingActionButton";
import { useWebSocket } from "@/lib/websocket";
import { LiveFlight, MapFilter } from "@/types";

export default function Home() {
  const [selectedFlight, setSelectedFlight] = useState<LiveFlight | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<MapFilter>({
    type: 'all',
    showWeather: false,
    showFlightPaths: true
  });
  
  const { flights, isConnected } = useWebSocket(filters);

  const handleFlightSelect = (flight: LiveFlight) => {
    setSelectedFlight(flight);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFilterChange = (newFilters: Partial<MapFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const showMobileFilters = () => {
    // This would typically show a mobile filter dialog
    // For simplicity, we'll just toggle weather for demonstration
    setFilters(prev => ({ ...prev, showWeather: !prev.showWeather }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 text-neutral-900">
      <Header onFilterChange={handleFilterChange} />
      
      <main className="flex flex-col md:flex-row flex-grow">
        <FlightMap 
          flights={flights} 
          selectedFlight={selectedFlight}
          onFlightSelect={handleFlightSelect}
          filters={filters}
          onFilterChange={handleFilterChange}
          isConnected={isConnected}
        />
        
        <FlightList 
          flights={flights} 
          onFlightSelect={handleFlightSelect}
          isConnected={isConnected}
        />
      </main>

      {selectedFlight && (
        <FlightDetailModal 
          flight={selectedFlight} 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
        />
      )}

      <FloatingActionButton onClick={showMobileFilters} />
    </div>
  );
}
