import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import FlightMap from '@/components/FlightMap';
import FlightPanel from '@/components/FlightPanel';
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
          <div className="flex-grow">
            <FlightMap 
              flights={flights}
              selectedFlight={selectedFlight}
              onFlightSelect={handleFlightSelect}
              filters={mapFilters}
              onFilterChange={handleFilterChange}
              isConnected={isConnected}
              isDarkMode={isDarkMode}
            />
          </div>
          
          <FlightPanel 
            flights={flights}
            selectedFlight={selectedFlight}
            onSelectFlight={handleFlightSelect}
            totalFlights={flights.length}
            filters={mapFilters}
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
            style={{ 
              background: isDarkMode 
                ? 'linear-gradient(135deg, rgba(10, 73, 149, 0.8), rgba(36, 96, 167, 0.8))' 
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(230, 247, 255, 0.9))',
              borderWidth: '1px',
              borderColor: isDarkMode ? 'var(--aviation-blue-accent)' : 'rgba(85, 255, 221, 0.3)',
              color: isDarkMode ? '#e6f7ff' : 'var(--aviation-blue-dark)',
              boxShadow: '0 3px 8px rgba(10, 73, 149, 0.2)',
              backdropFilter: 'blur(8px)'
            }}
            className="rounded-full px-4 py-2 font-medium text-sm transition-all hover:-translate-y-1"
            onClick={() => 
              toast({
                title: 'Keyboard Shortcuts',
                description: (
                  <ul className="text-sm mt-2 space-y-2">
                    <li className="flex items-center">
                      <span className="inline-block mr-2 p-1 rounded text-xs bg-black/10 dark:bg-white/10">ESC</span>
                      <span>Close flight details</span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block mr-2 p-1 rounded text-xs bg-black/10 dark:bg-white/10">F</span>
                      <span>Add/remove flight from favorites</span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block mr-2 p-1 rounded text-xs bg-black/10 dark:bg-white/10">P</span>
                      <span>Pin/unpin flight details</span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block mr-2 p-1 rounded text-xs bg-black/10 dark:bg-white/10">Ctrl+D</span>
                      <span>Toggle dark mode</span>
                    </li>
                  </ul>
                ),
                duration: 6000,
              })
            }
          >
            <span className="material-icons mr-2 text-sm">keyboard</span>
            Keyboard Shortcuts
          </Button>
        </div>
      </div>
    </ToastProvider>
  );
}