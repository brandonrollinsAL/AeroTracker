import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import FlightMap from '@/components/FlightMap';
import FlightPanel from '@/components/FlightPanel';
import Header from '@/components/Header';
import MapIconMenu from '@/components/MapIconMenu';
import FlightDetailPanel from '@/components/FlightDetailPanel';
import RouteOptimizer from '@/components/RouteOptimizer';
import { LiveFlight, MapFilter, Airport } from '@/types';
import { ToastProvider } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { useHotkeys, useMultiHotkeys } from '@/hooks/use-hotkeys';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  
  // State for airports (for route optimizer)
  const [airports, setAirports] = useState<Airport[]>([]);

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
  
  // Fetch airports for the route optimizer
  useEffect(() => {
    async function fetchAirports() {
      try {
        const response = await fetch('/api/airports');
        if (response.ok) {
          const airportData = await response.json();
          setAirports(airportData);
        }
      } catch (error) {
        console.error('Error fetching airports:', error);
      }
    }
    
    fetchAirports();
  }, []);

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

  // State for active tab
  const [activeTab, setActiveTab] = useState<'map' | 'tools'>('map');
  
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
        
        {activeTab === 'map' && (
          <MapIconMenu
            filters={mapFilters}
            onFilterChange={handleFilterChange}
            onZoomIn={() => {
              // This will be handled by the map component
              window.dispatchEvent(new CustomEvent('map-zoom-in'));
            }}
            onZoomOut={() => {
              // This will be handled by the map component
              window.dispatchEvent(new CustomEvent('map-zoom-out'));
            }}
            onMyLocation={() => {
              // This will be handled by the map component
              window.dispatchEvent(new CustomEvent('map-my-location'));
            }}
            isDarkMode={isDarkMode}
          />
        )}
        
        <Tabs 
          defaultValue="map" 
          className="w-full px-4 pt-2"
          onValueChange={(value) => setActiveTab(value as 'map' | 'tools')}
        >
          <TabsList 
            className="grid grid-cols-2 w-[400px] mb-4 relative overflow-hidden rounded-lg p-0.5 aviation-tabs-content"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(to right, rgba(0, 43, 76, 0.9), rgba(0, 58, 101, 0.9))'
                : 'linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(240, 248, 255, 0.9))',
              boxShadow: isDarkMode
                ? '0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(73, 149, 253, 0.2)'
                : '0 4px 12px rgba(73, 149, 253, 0.1), 0 0 0 1px rgba(73, 149, 253, 0.1)',
              borderImage: isDarkMode
                ? 'linear-gradient(to right, rgba(73, 149, 253, 0.4), rgba(73, 149, 253, 0.2)) 1'
                : 'linear-gradient(to right, rgba(73, 149, 253, 0.2), rgba(73, 149, 253, 0.1)) 1'
            }}
          >
            <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-[#4995fd]/10 via-[#4995fd]/30 to-[#4995fd]/10"></div>
            <TabsTrigger 
              value="map" 
              className="text-base relative overflow-hidden font-medium data-[state=active]:shadow-md transition-all duration-300 group py-2.5"
              style={{
                borderRadius: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: isDarkMode ? 'white' : '#003a65'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4995fd]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4995fd] to-transparent opacity-0 group-hover:opacity-100 data-[state=active]:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                <span className="material-icons mr-2" style={{ fontSize: '18px', color: '#4995fd' }}>flight</span>
                Flight Tracking
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="tools" 
              className="text-base relative overflow-hidden font-medium data-[state=active]:shadow-md transition-all duration-300 group py-2.5"
              style={{
                borderRadius: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: isDarkMode ? 'white' : '#003a65'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4995fd]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4995fd] to-transparent opacity-0 group-hover:opacity-100 data-[state=active]:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                <span className="material-icons mr-2" style={{ fontSize: '18px', color: '#4995fd' }}>route</span>
                Route Optimization
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="mt-0">
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
          </TabsContent>
          
          <TabsContent value="tools" className="mt-0">
            <RouteOptimizer airports={airports} />
          </TabsContent>
        </Tabs>

        {selectedFlight && activeTab === 'map' && (
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
            className="rounded-full px-4 py-2.5 font-medium text-sm transition-all 
                     hover:-translate-y-1 group relative overflow-hidden"
            style={{ 
              background: isDarkMode 
                ? 'linear-gradient(135deg, rgba(0, 43, 76, 0.85), rgba(0, 58, 101, 0.85))' 
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 248, 255, 0.95))',
              borderWidth: '1px',
              borderColor: isDarkMode ? 'rgba(73, 149, 253, 0.3)' : 'rgba(73, 149, 253, 0.2)',
              color: isDarkMode ? '#a0d0ec' : '#003a65',
              boxShadow: isDarkMode 
                ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(73, 149, 253, 0.15)' 
                : '0 4px 12px rgba(73, 149, 253, 0.15), 0 0 0 1px rgba(73, 149, 253, 0.05)',
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => 
              toast({
                title: 'Keyboard Shortcuts',
                description: (
                  <ul className="text-sm mt-2 space-y-2">
                    <li className="flex items-center">
                      <span className="inline-block mr-2 p-1 rounded text-xs font-medium"
                            style={{ 
                              background: isDarkMode ? 'rgba(73, 149, 253, 0.2)' : 'rgba(73, 149, 253, 0.1)',
                              border: `1px solid ${isDarkMode ? 'rgba(73, 149, 253, 0.3)' : 'rgba(73, 149, 253, 0.2)'}`,
                              color: isDarkMode ? '#a0d0ec' : '#003a65',
                              minWidth: '38px',
                              textAlign: 'center'
                            }}>ESC</span>
                      <span>Close flight details</span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block mr-2 p-1 rounded text-xs font-medium"
                            style={{ 
                              background: isDarkMode ? 'rgba(73, 149, 253, 0.2)' : 'rgba(73, 149, 253, 0.1)',
                              border: `1px solid ${isDarkMode ? 'rgba(73, 149, 253, 0.3)' : 'rgba(73, 149, 253, 0.2)'}`,
                              color: isDarkMode ? '#a0d0ec' : '#003a65',
                              minWidth: '38px',
                              textAlign: 'center'
                            }}>F</span>
                      <span>Add/remove flight from favorites</span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block mr-2 p-1 rounded text-xs font-medium"
                            style={{ 
                              background: isDarkMode ? 'rgba(73, 149, 253, 0.2)' : 'rgba(73, 149, 253, 0.1)',
                              border: `1px solid ${isDarkMode ? 'rgba(73, 149, 253, 0.3)' : 'rgba(73, 149, 253, 0.2)'}`,
                              color: isDarkMode ? '#a0d0ec' : '#003a65',
                              minWidth: '38px',
                              textAlign: 'center'
                            }}>P</span>
                      <span>Pin/unpin flight details</span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block mr-2 p-1 rounded text-xs font-medium"
                            style={{ 
                              background: isDarkMode ? 'rgba(73, 149, 253, 0.2)' : 'rgba(73, 149, 253, 0.1)',
                              border: `1px solid ${isDarkMode ? 'rgba(73, 149, 253, 0.3)' : 'rgba(73, 149, 253, 0.2)'}`,
                              color: isDarkMode ? '#a0d0ec' : '#003a65',
                              minWidth: '38px',
                              textAlign: 'center'
                            }}>Ctrl+D</span>
                      <span>Toggle dark mode</span>
                    </li>
                  </ul>
                ),
                duration: 6000,
              })
            }
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4995fd]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="absolute h-[1px] w-full bg-[#4995fd]/30 bottom-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="relative z-10 flex items-center justify-center">
              <span className="material-icons mr-2 text-sm" style={{ color: '#4995fd' }}>keyboard</span>
              <span className="group-hover:text-[#4995fd] transition-colors duration-300">Keyboard Shortcuts</span>
            </div>
          </Button>
        </div>
      </div>
    </ToastProvider>
  );
}