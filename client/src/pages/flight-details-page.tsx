import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { LiveFlight } from '@shared/schema';
import { Loader2, ArrowLeft, Map, Share, AlertTriangle, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function FlightDetailsPage() {
  const [, setLocation] = useLocation();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const flightId = searchParams.get('flight');
  const { toast } = useToast();

  // Fetch flight details
  const { data: flight, isLoading, error } = useQuery<LiveFlight>({
    queryKey: [`/api/flights/${flightId}`],
    staleTime: 30000, // 30 seconds
    enabled: !!flightId,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Could not fetch flight details. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Format flight status for display
  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/10">Active</Badge>;
      case 'landed':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/10">Landed</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/10">Scheduled</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/10">Cancelled</Badge>;
      case 'diverted':
        return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/10">Diverted</Badge>;
      case 'delayed':
        return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/10">Delayed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get airline name from flight data
  const getAirlineName = (flight?: LiveFlight) => {
    if (!flight) return 'Unknown Airline';
    if (typeof flight.airline === 'string') return flight.airline;
    if (flight.airline && 'name' in flight.airline) return flight.airline.name;
    return 'Unknown Airline';
  };

  // Handle map view button click
  const handleViewMap = () => {
    if (flightId) {
      setLocation(`/?flight=${flightId}&view=map`);
    }
  };

  // Handle back button click
  const handleBack = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!flight && !isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
          <h2 className="text-xl font-semibold">Flight Not Found</h2>
          <p className="text-muted-foreground text-center max-w-md">
            The flight you're looking for could not be found. It may have completed, been cancelled, or the ID might be incorrect.
          </p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleBack} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Flight Details</h1>
      </div>

      {flight && (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    {flight.callsign || flight.flightNumber}
                    {getStatusBadge(flight.status)}
                  </CardTitle>
                  <CardDescription>
                    {getAirlineName(flight)} • {flight.aircraftType || 'Unknown Aircraft Type'}
                    {flight.registration && ` • ${flight.registration}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleViewMap}>
                    <Map className="mr-2 h-4 w-4" />
                    View on Map
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
                <div className="space-y-1 text-center">
                  <h3 className="text-3xl font-bold">{flight.departure?.icao}</h3>
                  <p className="text-sm text-muted-foreground">{flight.departure?.name || 'Departure Airport'}</p>
                  <p className="text-sm font-medium">
                    {flight.departure?.time ? new Date(flight.departure.time).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative w-full">
                    <Separator className="absolute top-1/2 w-full" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-background rounded-full p-2">
                      <Plane className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-center">
                  <h3 className="text-3xl font-bold">{flight.arrival?.icao}</h3>
                  <p className="text-sm text-muted-foreground">{flight.arrival?.name || 'Arrival Airport'}</p>
                  <p className="text-sm font-medium">
                    {flight.arrival?.time ? new Date(flight.arrival.time).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="details">Flight Details</TabsTrigger>
              <TabsTrigger value="track">Flight Track</TabsTrigger>
              <TabsTrigger value="info">Aircraft Info</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Flight Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Altitude</p>
                      <p className="text-lg font-medium">{flight.position?.altitude?.toLocaleString() || 'N/A'} ft</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Ground Speed</p>
                      <p className="text-lg font-medium">{flight.position?.groundSpeed || 'N/A'} kts</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Heading</p>
                      <p className="text-lg font-medium">{flight.position?.heading || 'N/A'}°</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Vertical Speed</p>
                      <p className="text-lg font-medium">{flight.position?.verticalSpeed || 'N/A'} ft/min</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Origin</p>
                      <p className="text-lg font-medium">{flight.departure?.icao || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{flight.departure?.name}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Destination</p>
                      <p className="text-lg font-medium">{flight.arrival?.icao || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{flight.arrival?.name}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Flight Number</p>
                      <p className="text-lg font-medium">{flight.flightNumber || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div>{getStatusBadge(flight.status)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="track">
              <Card>
                <CardHeader>
                  <CardTitle>Flight Track</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Flight path tracking is available on the map view.
                  </p>
                  <Button onClick={handleViewMap}>
                    <Map className="mr-2 h-4 w-4" />
                    View on Map
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Aircraft Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Aircraft Type</p>
                      <p className="text-lg font-medium">{flight.aircraftType || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Registration</p>
                      <p className="text-lg font-medium">{flight.registration || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Airline</p>
                      <p className="text-lg font-medium">{getAirlineName(flight)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}