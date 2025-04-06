import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { LiveFlight, Airport, Aircraft } from '@/types';
import axios from 'axios';

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Only fetch search results when dialog is open and query length >= 2
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return { flights: [], airports: [], aircraft: [] };
      const response = await axios.get(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.data) throw new Error('Search failed');
      
      // Group results by type
      const result = {
        flights: [],
        airports: [],
        aircraft: []
      };
      
      response.data.forEach(item => {
        if (item.type === 'flight') result.flights.push(item);
        else if (item.type === 'airport') result.airports.push(item);
        else if (item.type === 'aircraft') result.aircraft.push(item);
      });
      
      return result;
    },
    enabled: open && searchQuery.length >= 2
  });

  // Open the command dialog when focusing on the search input
  const handleSearchFocus = () => {
    setOpen(true);
  };

  // Handle search input change in the command dialog
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle item selection
  const handleSelect = (item: any) => {
    console.log('Selected item:', item);
    // Here you would typically navigate to the item's detail page
    setOpen(false);
  };

  return (
    <>
      <div className="flex-grow mx-4 max-w-3xl">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="material-icons text-neutral-400">search</span>
          </span>
          <input 
            type="text" 
            placeholder="Search flights, airports, aircraft (Flight #, Reg, Route)" 
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary-light focus:outline-none transition-all text-sm"
            onFocus={handleSearchFocus}
          />
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search flights, airports, aircraft..." 
          value={searchQuery}
          onValueChange={handleSearchChange}
        />
        <CommandList>
          {isLoading && (
            <div className="p-4 text-center text-sm text-neutral-500">
              Searching...
            </div>
          )}
          <CommandEmpty>No results found.</CommandEmpty>
          
          {searchResults && (
            <>
              {searchResults.flights && searchResults.flights.length > 0 && (
                <CommandGroup heading="Flights">
                  {searchResults.flights.map((flight: LiveFlight & { type: string }) => (
                    <CommandItem 
                      key={flight.id} 
                      onSelect={() => handleSelect(flight)}
                      className="flex justify-between"
                    >
                      <div className="flex items-center">
                        <span className="material-icons mr-2 text-primary">flight</span>
                        <span>{flight.callsign || flight.flightNumber}</span>
                      </div>
                      <span className="text-xs text-neutral-500">
                        {flight.departure?.icao} → {flight.arrival?.icao}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {searchResults.airports && searchResults.airports.length > 0 && (
                <CommandGroup heading="Airports">
                  {searchResults.airports.map((airport: Airport & { type: string }) => (
                    <CommandItem 
                      key={airport.id} 
                      onSelect={() => handleSelect(airport)}
                    >
                      <span className="material-icons mr-2 text-neutral-600">location_on</span>
                      <span>{airport.name} ({airport.code})</span>
                      <span className="ml-2 text-xs text-neutral-500">{airport.city}, {airport.country}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {searchResults.aircraft && searchResults.aircraft.length > 0 && (
                <CommandGroup heading="Aircraft">
                  {searchResults.aircraft.map((aircraft: Aircraft & { type: string }) => (
                    <CommandItem 
                      key={aircraft.id} 
                      onSelect={() => handleSelect(aircraft)}
                    >
                      <span className="material-icons mr-2 text-neutral-600">airplanemode_active</span>
                      <span>{aircraft.registration}</span>
                      <span className="ml-2 text-xs text-neutral-500">{aircraft.type}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
