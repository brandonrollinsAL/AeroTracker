import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Plane, Map } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LiveFlight } from '@shared/schema';
import { useLocation } from 'wouter';

// Validation schema for search form
const searchSchema = z.object({
  query: z.string().min(2, 'Search term must be at least 2 characters'),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function FlightSearch() {
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [, setLocation] = useLocation();
  
  // Initialize the form with react-hook-form
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
    },
  });

  // Get form state
  const query = form.watch('query');

  // Set up the query but don't enable it until search is performed
  const { data: searchResults, isLoading } = useQuery<{
    flights: LiveFlight[],
    airports: any[],
    aircraft: any[],
  }>({
    queryKey: ['/api/search', query],
    enabled: searchPerformed && query.length >= 2,
    staleTime: 60000, // 1 minute
  });

  // Handle form submission
  function onSubmit(data: SearchFormValues) {
    setSearchPerformed(true);
  }

  // View flight details
  const handleViewFlight = (flight: LiveFlight) => {
    // For now, just navigate to the homepage with the flight ID as a parameter
    // until we create a dedicated flight details page
    setLocation(`/?flight=${flight.id}`);
  };

  // View on map
  const handleViewOnMap = (flight: LiveFlight) => {
    // Navigate to the homepage with the flight ID and map=true parameters
    setLocation(`/?flight=${flight.id}&view=map`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-primary flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Flight Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search for flights, airports, or aircraft</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input 
                          placeholder="Flight number, callsign, airport code, aircraft registration, etc." 
                          {...field} 
                          className="flex-1"
                        />
                      </FormControl>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                        Search
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {searchPerformed && (
        <Card className="border-none shadow-sm">
          <Tabs defaultValue="flights">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Search Results for "{query}"
                </CardTitle>
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="flights">
                    Flights
                    {searchResults?.flights && (
                      <Badge variant="outline" className="ml-2">
                        {searchResults.flights.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="airports">
                    Airports
                    {searchResults?.airports && (
                      <Badge variant="outline" className="ml-2">
                        {searchResults.airports.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="aircraft">
                    Aircraft
                    {searchResults?.aircraft && (
                      <Badge variant="outline" className="ml-2">
                        {searchResults.aircraft.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  <TabsContent value="flights" className="mt-0">
                    {searchResults?.flights && searchResults.flights.length > 0 ? (
                      <ScrollArea className="h-[400px] rounded-md">
                        <div className="grid grid-cols-1 gap-2">
                          {searchResults.flights.map((flight) => (
                            <Card key={flight.id} className="p-3 hover:bg-muted/50 transform transition-transform hover:-translate-y-1">
                              <div className="flex flex-col md:flex-row justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <h3 className="text-lg font-medium">
                                      {flight.callsign || flight.flightNumber}
                                    </h3>
                                    {flight.position?.altitude && (
                                      <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20">
                                        {flight.position.altitude.toLocaleString()} ft
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {typeof flight.airline === 'string' ? flight.airline : ''} · {flight.aircraftType}
                                  </p>
                                  <div className="flex items-center text-sm py-1">
                                    <div className="font-medium">{flight.departure?.icao}</div>
                                    <svg height="20" width="50" className="mx-1 inline-block">
                                      <line x1="0" y1="10" x2="50" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="2" />
                                      <circle cx="25" cy="10" r="2" fill="currentColor" />
                                    </svg>
                                    <div className="font-medium">{flight.arrival?.icao}</div>
                                  </div>
                                </div>
                                <div className="flex mt-2 md:mt-0 justify-start md:justify-end space-x-2">
                                  <Button 
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewFlight(flight)}
                                  >
                                    <Plane className="mr-2 h-4 w-4" />
                                    Details
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewOnMap(flight)}
                                  >
                                    <Map className="mr-2 h-4 w-4" />
                                    Map
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No flights found matching your search.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="airports" className="mt-0">
                    {searchResults?.airports && searchResults.airports.length > 0 ? (
                      <ScrollArea className="h-[400px]">
                        <div className="grid grid-cols-1 gap-2">
                          {searchResults.airports.map((airport) => (
                            <Card key={airport.id} className="p-3 hover:bg-muted/50">
                              <div className="flex justify-between">
                                <div className="space-y-1">
                                  <h3 className="text-lg font-medium">{airport.code}</h3>
                                  <p className="text-sm text-muted-foreground">{airport.name}</p>
                                  <p className="text-sm">{airport.city}, {airport.country}</p>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Map className="mr-2 h-4 w-4" />
                                  View
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No airports found matching your search.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="aircraft" className="mt-0">
                    {searchResults?.aircraft && searchResults.aircraft.length > 0 ? (
                      <ScrollArea className="h-[400px]">
                        <div className="grid grid-cols-1 gap-2">
                          {searchResults.aircraft.map((aircraft) => (
                            <Card key={aircraft.id} className="p-3 hover:bg-muted/50">
                              <div className="flex justify-between">
                                <div className="space-y-1">
                                  <h3 className="text-lg font-medium">{aircraft.registration}</h3>
                                  <p className="text-sm text-muted-foreground">{aircraft.type}</p>
                                  <p className="text-sm">
                                    {aircraft.manufacturer && `${aircraft.manufacturer} `}
                                    {aircraft.model || aircraft.type}
                                  </p>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Plane className="mr-2 h-4 w-4" />
                                  History
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No aircraft found matching your search.</p>
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </CardContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}