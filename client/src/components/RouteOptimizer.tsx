import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import AuthPopup from './AuthPopup';
import { MapPin, Plane, Wind, Clock, Droplet, AlertTriangle } from 'lucide-react';

// Common aircraft types for dropdown
const AIRCRAFT_TYPES = [
  { value: 'C172', label: 'Cessna 172' },
  { value: 'PA28', label: 'Piper Cherokee' },
  { value: 'C208', label: 'Cessna Caravan' },
  { value: 'PC12', label: 'Pilatus PC-12' },
  { value: 'B350', label: 'King Air 350' },
  { value: 'B737', label: 'Boeing 737' },
  { value: 'A320', label: 'Airbus A320' },
  { value: 'B777', label: 'Boeing 777' },
  { value: 'B787', label: 'Boeing 787' },
  { value: 'A350', label: 'Airbus A350' },
];

// Flight levels for dropdown
const FLIGHT_LEVELS = [
  { value: '100', label: 'FL100 (10,000 ft)' },
  { value: '150', label: 'FL150 (15,000 ft)' },
  { value: '200', label: 'FL200 (20,000 ft)' },
  { value: '250', label: 'FL250 (25,000 ft)' },
  { value: '300', label: 'FL300 (30,000 ft)' },
  { value: '350', label: 'FL350 (35,000 ft)' },
  { value: '400', label: 'FL400 (40,000 ft)' },
  { value: '450', label: 'FL450 (45,000 ft)' },
];

export default function RouteOptimizer() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  
  // Form state
  const [departureCode, setDepartureCode] = useState('');
  const [arrivalCode, setArrivalCode] = useState('');
  const [aircraftType, setAircraftType] = useState('B737');
  const [flightLevel, setFlightLevel] = useState('350');
  const [activeTab, setActiveTab] = useState('direct');
  
  // Fetch airports for validation
  const { data: airports } = useQuery({
    queryKey: ['/api/airports'],
    enabled: false, // We'll manually trigger this when needed
  });

  // Route optimization mutation
  const optimizeRouteMutation = useMutation({
    mutationFn: async (data: {
      departureCode: string;
      arrivalCode: string;
      aircraftType: string;
      flightLevel: number;
    }) => {
      const response = await apiRequest('POST', '/api/route/optimize', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Set the direct route as the active tab initially
      setActiveTab('direct');
      toast({
        title: 'Route optimized',
        description: `Successfully calculated route from ${departureCode} to ${arrivalCode}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Optimization failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in for premium feature
    if (!user) {
      setShowAuthPopup(true);
      return;
    }
    
    // Validate inputs
    if (!departureCode || !arrivalCode) {
      toast({
        title: 'Missing information',
        description: 'Please provide both departure and arrival airport codes',
        variant: 'destructive',
      });
      return;
    }
    
    // Submit for optimization
    optimizeRouteMutation.mutate({
      departureCode: departureCode.toUpperCase(),
      arrivalCode: arrivalCode.toUpperCase(),
      aircraftType,
      flightLevel: parseInt(flightLevel),
    });
  };
  
  // Format flight time from minutes to hours and minutes
  const formatFlightTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const renderWeatherSeverity = (severity: string) => {
    switch (severity) {
      case 'severe':
        return <span className="flex items-center text-red-500"><AlertTriangle className="mr-1 h-4 w-4" /> Severe</span>;
      case 'moderate':
        return <span className="flex items-center text-amber-500"><AlertTriangle className="mr-1 h-4 w-4" /> Moderate</span>;
      case 'light':
        return <span className="flex items-center text-yellow-500"><AlertTriangle className="mr-1 h-4 w-4" /> Light</span>;
      default:
        return <span className="flex items-center text-green-500"><AlertTriangle className="mr-1 h-4 w-4" /> None</span>;
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Route Optimization Tool
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Route Parameters</CardTitle>
            <CardDescription>Enter flight details to optimize your route</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="departure">Departure Airport (ICAO/IATA)</Label>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                  <Input 
                    id="departure" 
                    placeholder="e.g. KLAX or LAX" 
                    value={departureCode}
                    onChange={(e) => setDepartureCode(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="arrival">Arrival Airport (ICAO/IATA)</Label>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                  <Input 
                    id="arrival" 
                    placeholder="e.g. KJFK or JFK" 
                    value={arrivalCode}
                    onChange={(e) => setArrivalCode(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aircraft">Aircraft Type</Label>
                <Select value={aircraftType} onValueChange={setAircraftType}>
                  <SelectTrigger id="aircraft" className="w-full">
                    <SelectValue placeholder="Select aircraft type" />
                  </SelectTrigger>
                  <SelectContent>
                    {AIRCRAFT_TYPES.map((aircraft) => (
                      <SelectItem key={aircraft.value} value={aircraft.value}>
                        {aircraft.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="flightLevel">Flight Level</Label>
                <Select value={flightLevel} onValueChange={setFlightLevel}>
                  <SelectTrigger id="flightLevel" className="w-full">
                    <SelectValue placeholder="Select flight level" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLIGHT_LEVELS.map((fl) => (
                      <SelectItem key={fl.value} value={fl.value}>
                        {fl.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={optimizeRouteMutation.isPending}
              >
                {optimizeRouteMutation.isPending ? 'Optimizing...' : 'Optimize Route'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Optimized Routes</CardTitle>
            <CardDescription>
              {optimizeRouteMutation.data 
                ? `From ${departureCode} to ${arrivalCode} - ${optimizeRouteMutation.data.directRoute.distance} nm`
                : 'Enter route details to view optimized paths'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {optimizeRouteMutation.isPending ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              </div>
            ) : optimizeRouteMutation.data ? (
              <div>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="direct" className="flex-1">Direct Route</TabsTrigger>
                    {optimizeRouteMutation.data.alternativeRoutes.map((route, index) => (
                      <TabsTrigger 
                        key={route.routeType} 
                        value={route.routeType}
                        className="flex-1"
                      >
                        {route.routeType === 'weather_optimized' ? 'Weather Optimized' : 
                         route.routeType === 'wind_optimized' ? 'Wind Optimized' : 
                         route.routeType === 'fuel_optimized' ? 'Fuel Optimized' : 
                         'Alternative ' + (index + 1)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  <TabsContent value="direct" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Plane className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Distance</p>
                          <p className="font-medium">{optimizeRouteMutation.data.directRoute.distance} nm</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Flight Time</p>
                          <p className="font-medium">{formatFlightTime(optimizeRouteMutation.data.directRoute.flightTime)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Droplet className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Fuel Consumption</p>
                          <p className="font-medium">{optimizeRouteMutation.data.directRoute.fuelConsumption} gal</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Wind className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Winds</p>
                          <p className="font-medium">
                            {optimizeRouteMutation.data.directRoute.windComponent.headwind > 0 
                              ? `${optimizeRouteMutation.data.directRoute.windComponent.headwind}kt headwind` 
                              : `${Math.abs(optimizeRouteMutation.data.directRoute.windComponent.headwind)}kt tailwind`}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Weather Impact</h4>
                      <div className="mb-4">
                        {renderWeatherSeverity(optimizeRouteMutation.data.directRoute.weatherSeverity)}
                      </div>
                      
                      <h4 className="text-sm font-medium mb-2">Waypoints</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {optimizeRouteMutation.data.directRoute.waypoints.map((waypoint, index) => (
                          <div 
                            key={index} 
                            className="flex items-center p-2 rounded-md bg-secondary/50"
                          >
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-xs text-blue-700">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{waypoint.code}</p>
                              <p className="text-xs text-muted-foreground">{waypoint.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  {optimizeRouteMutation.data.alternativeRoutes.map((route) => (
                    <TabsContent key={route.routeType} value={route.routeType} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Plane className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Distance</p>
                            <p className="font-medium">{route.distance} nm</p>
                            <p className="text-xs text-muted-foreground">
                              {((route.distance - optimizeRouteMutation.data.directRoute.distance) / optimizeRouteMutation.data.directRoute.distance * 100).toFixed(1)}% 
                              {route.distance > optimizeRouteMutation.data.directRoute.distance ? ' longer' : ' shorter'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Flight Time</p>
                            <p className="font-medium">{formatFlightTime(route.flightTime)}</p>
                            <p className="text-xs text-muted-foreground">
                              {((route.flightTime - optimizeRouteMutation.data.directRoute.flightTime) / optimizeRouteMutation.data.directRoute.flightTime * 100).toFixed(1)}% 
                              {route.flightTime > optimizeRouteMutation.data.directRoute.flightTime ? ' longer' : ' shorter'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Droplet className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Fuel Consumption</p>
                            <p className="font-medium">{route.fuelConsumption} gal</p>
                            <p className="text-xs text-muted-foreground">
                              {((route.fuelConsumption - optimizeRouteMutation.data.directRoute.fuelConsumption) / optimizeRouteMutation.data.directRoute.fuelConsumption * 100).toFixed(1)}% 
                              {route.fuelConsumption > optimizeRouteMutation.data.directRoute.fuelConsumption ? ' more' : ' less'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Wind className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Winds</p>
                            <p className="font-medium">
                              {route.windComponent.headwind > 0 
                                ? `${route.windComponent.headwind}kt headwind` 
                                : `${Math.abs(route.windComponent.headwind)}kt tailwind`}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Weather Impact</h4>
                        <div className="mb-4">
                          {renderWeatherSeverity(route.weatherSeverity)}
                        </div>
                        
                        <h4 className="text-sm font-medium mb-2">Waypoints</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {route.waypoints.map((waypoint, index) => (
                            <div 
                              key={index} 
                              className="flex items-center p-2 rounded-md bg-secondary/50"
                            >
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-xs text-blue-700">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{waypoint.code}</p>
                                <p className="text-xs text-muted-foreground">{waypoint.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Plane className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No Route Data</h3>
                <p>Enter route details and click "Optimize Route" to calculate the most efficient flight path.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {optimizeRouteMutation.data ? 'Route optimization complete.' : 'Optimizes for time, fuel, and weather conditions.'}
            </p>
            {optimizeRouteMutation.data && (
              <Button 
                variant="outline" 
                onClick={() => {
                  // Reset data to allow for a new calculation
                  optimizeRouteMutation.reset();
                }}
              >
                Calculate New Route
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Auth popup for premium features */}
      {showAuthPopup && (
        <AuthPopup 
          title="Premium Feature: Route Optimization"
          description="Sign in or create an account to access optimized flight routes with weather avoidance, fuel efficiency calculations, and more."
          trigger={
            <Button 
              className="hidden" 
              onClick={() => setShowAuthPopup(true)}
              ref={(ref) => ref && showAuthPopup && ref.click()}
            >
              Open
            </Button>
          }
        >
          <div>Premium content</div>
        </AuthPopup>
      )}
    </div>
  );
}