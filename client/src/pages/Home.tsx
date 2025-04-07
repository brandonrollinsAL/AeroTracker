import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import FlightMap from '@/components/FlightMap';
import FlightList from '@/components/FlightList';
import Header from '@/components/Header';
import FlightDetailPanel from '@/components/FlightDetailPanel';
import { LiveFlight, MapFilter } from '@/types';
import { ToastProvider } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { useHotkeys, useMultiHotkeys } from '@/hooks/use-hotkeys';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';

export default function Home() {
  // Theme state
  const { isDarkMode, theme, setTheme } = useTheme();
  
  // State for flights and flight selection
  const [flights, setFlights] = useState<LiveFlight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<LiveFlight | null>(null);
  const [favoriteFlights, setFavoriteFlights] = useState<LiveFlight[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPanelPinned, setIsPanelPinned] = useState(false);
  
  // State for map filters
  const [mapFilters, setMapFilters] = useState<MapFilter>({
    type: 'all',
    showWeather: false,
    showFlightPaths: true,
    showAirports: true
  });

  // Toast notifications
  const { toast } = useToast();

  // WebSocket connection for real-time flight data
  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    // Connection opened
    socket.addEventListener('open', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      toast({
        title: 'Connected',
        description: 'Live flight data stream connected',
      });
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'flights') {
          // Ensure data.flights is an array
          const flightData = Array.isArray(data.flights) ? data.flights : [];
          setFlights(flightData);
          
          // Update selected flight if it exists in the new data
          if (selectedFlight && flightData.length > 0) {
            const updatedFlight = flightData.find((f: LiveFlight) => f.id === selectedFlight.id);
            if (updatedFlight) {
              setSelectedFlight(updatedFlight);
            }
          }
          
          // Update favorite flights with latest data
          setFavoriteFlights(prevFavorites => {
            return prevFavorites.map(favorite => {
              const updated = flightData.find((f: LiveFlight) => f.id === favorite.id);
              return updated || favorite;
            });
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Connection closed
    socket.addEventListener('close', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      toast({
        title: 'Disconnected',
        description: 'Lost connection to flight data server',
        variant: 'destructive',
      });
    });

    // Connection error
    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    });

    // Clean up on unmount
    return () => {
      socket.close();
    };
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteFlights');
    if (savedFavorites) {
      try {
        setFavoriteFlights(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error loading favorite flights:', error);
      }
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('favoriteFlights', JSON.stringify(favoriteFlights));
  }, [favoriteFlights]);

  // Handle map filter changes
  const handleFilterChange = (newFilters: Partial<MapFilter>) => {
    setMapFilters({
      ...mapFilters,
      ...newFilters
    });
  };

  // Handle flight selection
  const handleFlightSelect = (flight: LiveFlight) => {
    setSelectedFlight(flight);
  };

  // Handle closing flight detail panel
  const handleCloseFlightPanel = () => {
    setSelectedFlight(null);
    setIsPanelPinned(false);
  };

  // Handle toggling pin state of flight detail panel
  const handleTogglePin = () => {
    setIsPanelPinned(!isPanelPinned);
  };

  // Add flight to favorites
  const handleAddToFavorites = (flight: LiveFlight) => {
    if (!favoriteFlights.some(f => f.id === flight.id)) {
      setFavoriteFlights([...favoriteFlights, flight]);
      toast({
        title: 'Added to Favorites',
        description: `Flight ${flight.callsign || flight.flightNumber} added to favorites`,
      });
    }
  };

  // Remove flight from favorites
  const handleRemoveFromFavorites = (flightId: string) => {
    setFavoriteFlights(favoriteFlights.filter(f => f.id !== flightId));
    toast({
      title: 'Removed from Favorites',
      description: 'Flight removed from favorites',
    });
  };

  // Register keyboard shortcuts
  useMultiHotkeys([
    {
      key: 'Escape',
      callback: () => {
        if (selectedFlight) {
          handleCloseFlightPanel();
        }
      }
    },
    {
      key: 'f',
      callback: () => {
        if (selectedFlight) {
          if (favoriteFlights.some(f => f.id === selectedFlight.id)) {
            handleRemoveFromFavorites(selectedFlight.id);
          } else {
            handleAddToFavorites(selectedFlight);
          }
        }
      }
    },
    {
      key: 'p',
      callback: () => {
        if (selectedFlight) {
          handleTogglePin();
        }
      }
    },
    {
      key: 'd',
      callback: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
      },
      options: { modifier: 'ctrl' }
    }
  ]);

  return (
    <ToastProvider>
      <Helmet>
        <title>AeroTracker - Flight Tracking Platform</title>
      </Helmet>
      
      <div className={`min-h-screen ${isDarkMode ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'}`}>
        <Header 
          isDarkMode={isDarkMode} 
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
        />
        
        <main className="flex flex-col md:flex-row">
          <FlightMap 
            flights={flights}
            selectedFlight={selectedFlight}
            onFlightSelect={handleFlightSelect}
            filters={mapFilters}
            onFilterChange={handleFilterChange}
            isConnected={isConnected}
            isDarkMode={isDarkMode}
          />
          
          <FlightList 
            flights={flights}
            onFlightSelect={handleFlightSelect}
            isConnected={isConnected}
            favoriteFlights={favoriteFlights}
            onAddToFavorites={handleAddToFavorites}
            onRemoveFromFavorites={handleRemoveFromFavorites}
          />
        </main>

        {selectedFlight && (
          <FlightDetailPanel 
            flight={selectedFlight}
            onClose={handleCloseFlightPanel}
            isPinned={isPanelPinned}
            onTogglePin={handleTogglePin}
          />
        )}

        {/* Keyboard shortcuts help button */}
        <div className="fixed bottom-4 left-4 z-50">
          <Button 
            variant="outline" 
            className="bg-white/80 backdrop-blur-sm"
            onClick={() => 
              toast({
                title: 'Keyboard Shortcuts',
                description: (
                  <ul className="text-sm mt-2 space-y-1">
                    <li>ESC - Close flight details</li>
                    <li>F - Add/remove flight from favorites</li>
                    <li>P - Pin/unpin flight details</li>
                    <li>Ctrl+D - Toggle dark mode</li>
                  </ul>
                ),
                duration: 5000,
              })
            }
          >
            <span className="material-icons mr-1 text-sm">keyboard</span>
            Shortcuts
          </Button>
        </div>
      </div>
    </ToastProvider>
  );
}