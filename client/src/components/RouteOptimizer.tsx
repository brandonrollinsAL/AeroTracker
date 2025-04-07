import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Airport } from '@shared/schema';
import { Plane, Wind, Calendar, Droplets, Clock, Fuel, Navigation, BarChart, Map, Waves } from 'lucide-react';

interface RouteOptimizerProps {
  airports: Airport[];
}

export default function RouteOptimizer({ airports }: RouteOptimizerProps) {
  const [departureCode, setDepartureCode] = useState('');
  const [arrivalCode, setArrivalCode] = useState('');
  const [aircraftType, setAircraftType] = useState('');
  const [fuelEfficiency, setFuelEfficiency] = useState(75);
  const [considerWeather, setConsiderWeather] = useState(true);
  const [optimizationFactor, setOptimizationFactor] = useState('balanced');
  const [plannedDate, setPlannedDate] = useState('');
  const [optimizedRoute, setOptimizedRoute] = useState<null | {
    routeName: string;
    fuelBurn: number;
    flightTime: number;
    distance: number;
    waypoints: { lat: number; lon: number; name: string; }[];
    weatherImpact: 'low' | 'medium' | 'high';
    altitudeProfile: { distance: number; altitude: number; }[];
    windComponent: { tailwind: number; headwind: number; crosswind: number; };
  }>(null);

  // Filter airports for dropdown
  const filteredDepartureAirports = airports.filter(airport => 
    airport.code.toLowerCase().includes(departureCode.toLowerCase()) ||
    airport.name.toLowerCase().includes(departureCode.toLowerCase())
  ).slice(0, 5);

  const filteredArrivalAirports = airports.filter(airport => 
    airport.code.toLowerCase().includes(arrivalCode.toLowerCase()) ||
    airport.name.toLowerCase().includes(arrivalCode.toLowerCase())
  ).slice(0, 5);

  // Aircraft types
  const aircraftTypes = [
    'Boeing 737-800',
    'Airbus A320',
    'Boeing 777-300',
    'Airbus A350-900',
    'Cessna 172',
    'Cirrus SR22',
    'Bombardier Challenger 350',
    'Gulfstream G650'
  ];

  // Handle route calculation
  const calculateOptimizedRoute = () => {
    // Here we would normally call the API to get the optimized route
    // For now, let's simulate with some sample data
    
    const departureAirport = airports.find(a => a.code === departureCode);
    const arrivalAirport = airports.find(a => a.code === arrivalCode);
    
    if (!departureAirport || !arrivalAirport) {
      alert('Please select valid departure and arrival airports');
      return;
    }

    // Calculate distance based on Haversine formula
    const R = 6371; // Earth's radius in km
    const lat1 = departureAirport.latitude * Math.PI/180;
    const lat2 = arrivalAirport.latitude * Math.PI/180;
    const dLat = (arrivalAirport.latitude - departureAirport.latitude) * Math.PI/180;
    const dLon = (arrivalAirport.longitude - departureAirport.longitude) * Math.PI/180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Simulate an optimized route
    const newOptimizedRoute = {
      routeName: `${departureAirport.code} to ${arrivalAirport.code} Optimized`,
      fuelBurn: distance * (1 - fuelEfficiency/100) * 0.15,
      flightTime: distance / 800 * 60, // Assuming 800 km/h average speed
      distance: distance,
      waypoints: [
        { lat: departureAirport.latitude, lon: departureAirport.longitude, name: departureAirport.code },
        // Add midpoint as a waypoint
        { 
          lat: (departureAirport.latitude + arrivalAirport.latitude) / 2,
          lon: (departureAirport.longitude + arrivalAirport.longitude) / 2,
          name: 'Midpoint'
        },
        { lat: arrivalAirport.latitude, lon: arrivalAirport.longitude, name: arrivalAirport.code }
      ],
      weatherImpact: Math.random() > 0.6 ? 'low' : Math.random() > 0.3 ? 'medium' : 'high' as 'low' | 'medium' | 'high',
      altitudeProfile: [
        { distance: 0, altitude: 0 },
        { distance: distance * 0.1, altitude: 30000 },
        { distance: distance * 0.9, altitude: 30000 },
        { distance: distance, altitude: 0 }
      ],
      windComponent: {
        tailwind: Math.round(Math.random() * 30),
        headwind: Math.round(Math.random() * 20),
        crosswind: Math.round(Math.random() * 15)
      }
    };
    
    setOptimizedRoute(newOptimizedRoute);
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Plane className="h-5 w-5" />
            Route Optimization Tools
          </CardTitle>
          <CardDescription>
            Plan your flight with optimized routes considering weather, fuel efficiency, and more
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="route">
            <TabsList className="mb-4">
              <TabsTrigger value="route">
                <Navigation className="h-4 w-4 mr-2" />
                Route Planner
              </TabsTrigger>
              <TabsTrigger value="fuel">
                <Fuel className="h-4 w-4 mr-2" />
                Fuel Calculator
              </TabsTrigger>
              <TabsTrigger value="weather">
                <Wind className="h-4 w-4 mr-2" />
                Weather Impact
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="route" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departure">Departure Airport</Label>
                  <Input 
                    id="departure" 
                    placeholder="ICAO or Airport name" 
                    value={departureCode} 
                    onChange={(e) => setDepartureCode(e.target.value)} 
                  />
                  {departureCode && (
                    <div className="mt-1 p-2 bg-gray-50 rounded-md text-sm">
                      {filteredDepartureAirports.length > 0 ? (
                        <div className="space-y-1">
                          {filteredDepartureAirports.map(airport => (
                            <div 
                              key={airport.id} 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                              onClick={() => setDepartureCode(airport.code)}
                            >
                              <span className="font-semibold">{airport.code}</span> - {airport.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500">No airports found</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="arrival">Arrival Airport</Label>
                  <Input 
                    id="arrival" 
                    placeholder="ICAO or Airport name" 
                    value={arrivalCode} 
                    onChange={(e) => setArrivalCode(e.target.value)} 
                  />
                  {arrivalCode && (
                    <div className="mt-1 p-2 bg-gray-50 rounded-md text-sm">
                      {filteredArrivalAirports.length > 0 ? (
                        <div className="space-y-1">
                          {filteredArrivalAirports.map(airport => (
                            <div 
                              key={airport.id} 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                              onClick={() => setArrivalCode(airport.code)}
                            >
                              <span className="font-semibold">{airport.code}</span> - {airport.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500">No airports found</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="aircraft">Aircraft Type</Label>
                  <Select value={aircraftType} onValueChange={setAircraftType}>
                    <SelectTrigger id="aircraft">
                      <SelectValue placeholder="Select aircraft" />
                    </SelectTrigger>
                    <SelectContent>
                      {aircraftTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="date">Planned Departure Date</Label>
                  <Input 
                    id="date" 
                    type="datetime-local" 
                    value={plannedDate} 
                    onChange={(e) => setPlannedDate(e.target.value)} 
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="fuel-efficiency" className="flex justify-between">
                    <span>Fuel Efficiency Priority</span>
                    <span className="text-blue-600">{fuelEfficiency}%</span>
                  </Label>
                  <Slider 
                    id="fuel-efficiency"
                    min={0} 
                    max={100} 
                    step={5} 
                    value={[fuelEfficiency]} 
                    onValueChange={(value) => setFuelEfficiency(value[0])} 
                    className="my-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Speed Priority</span>
                    <span>Balanced</span>
                    <span>Eco Priority</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="weather" 
                    checked={considerWeather} 
                    onCheckedChange={setConsiderWeather} 
                  />
                  <Label htmlFor="weather">Consider Weather Conditions</Label>
                </div>
                
                <div>
                  <Label htmlFor="optimization">Optimization Factor</Label>
                  <Select value={optimizationFactor} onValueChange={setOptimizationFactor}>
                    <SelectTrigger id="optimization">
                      <SelectValue placeholder="Select optimization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="fuel">Minimum Fuel</SelectItem>
                      <SelectItem value="time">Minimum Time</SelectItem>
                      <SelectItem value="altitude">Optimal Altitude</SelectItem>
                      <SelectItem value="weather">Weather Avoidance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={calculateOptimizedRoute}
                disabled={!departureCode || !arrivalCode || !aircraftType}
              >
                Calculate Optimized Route
              </Button>
            </TabsContent>
            
            <TabsContent value="fuel" className="space-y-4">
              <div className="text-center p-6 text-gray-500">
                <Fuel className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <h3 className="text-lg font-medium mb-1">Fuel Calculator Coming Soon</h3>
                <p>Advanced fuel planning tools will be available in the next update</p>
              </div>
            </TabsContent>
            
            <TabsContent value="weather" className="space-y-4">
              <div className="text-center p-6 text-gray-500">
                <Wind className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <h3 className="text-lg font-medium mb-1">Weather Analysis Coming Soon</h3>
                <p>Detailed weather impact analysis will be available in the next update</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {optimizedRoute && (
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">
              Optimized Route Results
            </CardTitle>
            <CardDescription>
              {optimizedRoute.routeName}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium">Flight Time</h3>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {Math.floor(optimizedRoute.flightTime / 60)}h {Math.round(optimizedRoute.flightTime % 60)}m
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Based on {aircraftType} performance
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Fuel className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium">Estimated Fuel</h3>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {Math.round(optimizedRoute.fuelBurn)} gal
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {considerWeather ? 'Including weather factors' : 'Standard conditions'}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Map className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-medium">Total Distance</h3>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {Math.round(optimizedRoute.distance)} km
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {optimizedRoute.waypoints.length} waypoints
                </p>
              </div>
              
              <div className="md:col-span-3 mt-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <Wind className="h-5 w-5 mr-2 text-blue-600" />
                  Wind Components
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="border rounded-md p-2">
                    <div className="text-sm text-gray-500">Tailwind</div>
                    <div className="font-bold text-green-600">{optimizedRoute.windComponent.tailwind} kts</div>
                  </div>
                  <div className="border rounded-md p-2">
                    <div className="text-sm text-gray-500">Headwind</div>
                    <div className="font-bold text-red-600">{optimizedRoute.windComponent.headwind} kts</div>
                  </div>
                  <div className="border rounded-md p-2">
                    <div className="text-sm text-gray-500">Crosswind</div>
                    <div className="font-bold text-yellow-600">{optimizedRoute.windComponent.crosswind} kts</div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-3 mt-2">
                <h3 className="font-medium mb-2 flex items-center">
                  <Waves className="h-5 w-5 mr-2 text-blue-600" />
                  Weather Impact Assessment
                </h3>
                <div className={`p-3 rounded-md ${
                  optimizedRoute.weatherImpact === 'low' ? 'bg-green-50 text-green-700' :
                  optimizedRoute.weatherImpact === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      optimizedRoute.weatherImpact === 'low' ? 'bg-green-500' :
                      optimizedRoute.weatherImpact === 'medium' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="font-medium capitalize">{optimizedRoute.weatherImpact} Impact</span>
                  </div>
                  <p className="text-sm mt-1">
                    {optimizedRoute.weatherImpact === 'low' ? 'Favorable conditions along the route' :
                     optimizedRoute.weatherImpact === 'medium' ? 'Some weather considerations may affect the route' :
                     'Significant weather patterns may require route adjustments'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline">Download Flight Plan</Button>
            <Button>Send to Navigation System</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}