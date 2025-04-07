import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WeatherData, WeatherImpact, Airport } from '@shared/schema';
import { CloudRain, Wind, Compass, Thermometer, BarChart, Sun, CloudSnow, AlertTriangle, Droplets, Eye, Clock } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface WeatherImpactPanelProps {
  departureAirport?: Airport;
  arrivalAirport?: Airport;
  onClose: () => void;
}

export default function WeatherImpactPanel({ 
  departureAirport, 
  arrivalAirport, 
  onClose 
}: WeatherImpactPanelProps) {
  const [departureWeather, setDepartureWeather] = useState<WeatherData | null>(null);
  const [arrivalWeather, setArrivalWeather] = useState<WeatherData | null>(null);
  const [routeImpact, setRouteImpact] = useState<{
    departure: WeatherImpact | null,
    arrival: WeatherImpact | null,
    enroute: {
      severity: 'none' | 'light' | 'moderate' | 'severe',
      details: string[]
    }
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when airports change
    setDepartureWeather(null);
    setArrivalWeather(null);
    setRouteImpact(null);
    setError(null);

    if (!departureAirport || !arrivalAirport) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch departure airport weather
        const departureResponse = await fetch(`/api/weather/${departureAirport.code}`);
        if (!departureResponse.ok) {
          throw new Error(`Failed to fetch departure weather: ${departureResponse.statusText}`);
        }
        const departureData = await departureResponse.json();
        setDepartureWeather(departureData);

        // Fetch arrival airport weather
        const arrivalResponse = await fetch(`/api/weather/${arrivalAirport.code}`);
        if (!arrivalResponse.ok) {
          throw new Error(`Failed to fetch arrival weather: ${arrivalResponse.statusText}`);
        }
        const arrivalData = await arrivalResponse.json();
        setArrivalWeather(arrivalData);

        // Fetch route impact data
        const routeResponse = await fetch(
          `/api/weather/route-impact?departureCode=${departureAirport.code}&arrivalCode=${arrivalAirport.code}`
        );
        if (!routeResponse.ok) {
          throw new Error(`Failed to fetch route impact: ${routeResponse.statusText}`);
        }
        const routeData = await routeResponse.json();
        setRouteImpact(routeData);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to fetch weather information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [departureAirport, arrivalAirport]);

  // Render loading state
  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg text-center">Loading Weather Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
              <CloudRain className="h-6 w-6 text-blue-400" />
            </div>
            <div className="h-4 w-40 bg-blue-200 rounded"></div>
            <div className="h-3 w-32 bg-blue-100 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg text-[#e11d48]">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-6 w-6 text-[#e11d48]" />
            <p>{error}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    );
  }

  // If no airports selected yet
  if (!departureAirport || !arrivalAirport) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Weather Impact Analysis</CardTitle>
          <CardDescription>
            Select departure and arrival airports to view weather conditions.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="flex flex-col items-center gap-4">
            <Compass className="h-12 w-12 text-[#4995fd] opacity-60" />
            <p className="text-neutral-500">No airports selected</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    );
  }

  // Render when we have data
  return (
    <Card className="w-full max-w-3xl mx-auto bg-white border-[#4995fd]/20">
      <CardHeader className="bg-gradient-to-r from-[#4995fd]/10 to-[#a0d0ec]/10 border-b border-[#4995fd]/10">
        <CardTitle className="text-lg text-[#003a65] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-[#4995fd]" />
            <span>Weather Impact Analysis</span>
          </div>
          {routeImpact && (
            <Badge 
              className={`
                ${routeImpact.enroute.severity === 'severe' ? 'bg-[#e11d48] hover:bg-[#e11d48]/90' : ''}
                ${routeImpact.enroute.severity === 'moderate' ? 'bg-[#f59e0b] hover:bg-[#f59e0b]/90' : ''}
                ${routeImpact.enroute.severity === 'light' ? 'bg-[#facc15] hover:bg-[#facc15]/90' : ''}
                ${routeImpact.enroute.severity === 'none' ? 'bg-[#22c55e] hover:bg-[#22c55e]/90' : ''}
              `}
            >
              {routeImpact.enroute.severity.charAt(0).toUpperCase() + routeImpact.enroute.severity.slice(1)} Impact
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Route from {departureAirport.name} ({departureAirport.code}) to {arrivalAirport.name} ({arrivalAirport.code})
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue="route" className="w-full">
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="route" className="text-[#003a65]">Route Overview</TabsTrigger>
            <TabsTrigger value="departure" className="text-[#003a65]">Departure Weather</TabsTrigger>
            <TabsTrigger value="arrival" className="text-[#003a65]">Arrival Weather</TabsTrigger>
          </TabsList>
        </div>

        {/* Route Overview Tab */}
        <TabsContent value="route" className="mt-0">
          <CardContent className="pt-6">
            {routeImpact ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-[#003a65]">Route Weather Impact</h3>
                  <div className={`
                    rounded-md border p-4 
                    ${routeImpact.enroute.severity === 'severe' ? 'border-[#e11d48]/20 bg-[#e11d48]/5' : ''}
                    ${routeImpact.enroute.severity === 'moderate' ? 'border-[#f59e0b]/20 bg-[#f59e0b]/5' : ''}
                    ${routeImpact.enroute.severity === 'light' ? 'border-[#facc15]/20 bg-[#facc15]/5' : ''}
                    ${routeImpact.enroute.severity === 'none' ? 'border-[#22c55e]/20 bg-[#22c55e]/5' : ''}
                  `}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${routeImpact.enroute.severity === 'severe' ? 'bg-[#e11d48]/20' : ''}
                        ${routeImpact.enroute.severity === 'moderate' ? 'bg-[#f59e0b]/20' : ''}
                        ${routeImpact.enroute.severity === 'light' ? 'bg-[#facc15]/20' : ''}
                        ${routeImpact.enroute.severity === 'none' ? 'bg-[#22c55e]/20' : ''}
                      `}>
                        {routeImpact.enroute.severity === 'severe' && <AlertTriangle className="h-4 w-4 text-[#e11d48]" />}
                        {routeImpact.enroute.severity === 'moderate' && <CloudRain className="h-4 w-4 text-[#f59e0b]" />}
                        {routeImpact.enroute.severity === 'light' && <Wind className="h-4 w-4 text-[#facc15]" />}
                        {routeImpact.enroute.severity === 'none' && <Sun className="h-4 w-4 text-[#22c55e]" />}
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {routeImpact.enroute.severity.charAt(0).toUpperCase() + routeImpact.enroute.severity.slice(1)} Weather Impact
                        </h4>
                        <p className="text-sm text-neutral-600">
                          {routeImpact.enroute.details[0] || 'No significant weather issues along the route.'}
                        </p>
                      </div>
                    </div>
                    
                    {routeImpact.enroute.details.length > 1 && (
                      <div className="pl-11 mt-2">
                        <ul className="text-xs space-y-1 text-neutral-700">
                          {routeImpact.enroute.details.slice(1).map((detail, index) => (
                            <li key={index} className="flex items-start gap-1.5">
                              <span className="inline-block w-1 h-1 rounded-full bg-neutral-400 mt-1.5"></span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-3">
                    <h4 className="text-xs font-medium text-neutral-600 mb-2">DEPARTURE: {departureAirport.code}</h4>
                    {routeImpact.departure ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="outline" 
                            className={`
                              ${routeImpact.departure.flightCategory === 'VFR' ? 'border-[#22c55e] text-[#22c55e]' : ''}
                              ${routeImpact.departure.flightCategory === 'MVFR' ? 'border-[#facc15] text-[#facc15]' : ''}
                              ${routeImpact.departure.flightCategory === 'IFR' ? 'border-[#f59e0b] text-[#f59e0b]' : ''}
                              ${routeImpact.departure.flightCategory === 'LIFR' ? 'border-[#e11d48] text-[#e11d48]' : ''}
                            `}
                          >
                            {routeImpact.departure.flightCategory}
                          </Badge>
                          <div className="text-sm font-medium">
                            Impact: {routeImpact.departure.overallImpact.toFixed(1)}/10
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <div className="flex items-center gap-1.5">
                              <Wind className="h-3 w-3 text-[#4995fd]" />
                              <span className="text-neutral-600">Wind: </span>
                              <span className="font-medium">{routeImpact.departure.windImpact.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Eye className="h-3 w-3 text-[#4995fd]" />
                              <span className="text-neutral-600">Visibility: </span>
                              <span className="font-medium">{routeImpact.departure.visibilityImpact.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CloudRain className="h-3 w-3 text-[#4995fd]" />
                              <span className="text-neutral-600">Precip: </span>
                              <span className="font-medium">{routeImpact.departure.precipitationImpact.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <BarChart className="h-3 w-3 text-[#4995fd]" />
                              <span className="text-neutral-600">Turbulence: </span>
                              <span className="font-medium">{routeImpact.departure.turbulenceImpact.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-600 italic">Weather data unavailable</div>
                    )}
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <h4 className="text-xs font-medium text-neutral-600 mb-2">ARRIVAL: {arrivalAirport.code}</h4>
                    {routeImpact.arrival ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="outline" 
                            className={`
                              ${routeImpact.arrival.flightCategory === 'VFR' ? 'border-[#22c55e] text-[#22c55e]' : ''}
                              ${routeImpact.arrival.flightCategory === 'MVFR' ? 'border-[#facc15] text-[#facc15]' : ''}
                              ${routeImpact.arrival.flightCategory === 'IFR' ? 'border-[#f59e0b] text-[#f59e0b]' : ''}
                              ${routeImpact.arrival.flightCategory === 'LIFR' ? 'border-[#e11d48] text-[#e11d48]' : ''}
                            `}
                          >
                            {routeImpact.arrival.flightCategory}
                          </Badge>
                          <div className="text-sm font-medium">
                            Impact: {routeImpact.arrival.overallImpact.toFixed(1)}/10
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <div className="flex items-center gap-1.5">
                              <Wind className="h-3 w-3 text-[#4995fd]" />
                              <span className="text-neutral-600">Wind: </span>
                              <span className="font-medium">{routeImpact.arrival.windImpact.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Eye className="h-3 w-3 text-[#4995fd]" />
                              <span className="text-neutral-600">Visibility: </span>
                              <span className="font-medium">{routeImpact.arrival.visibilityImpact.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CloudRain className="h-3 w-3 text-[#4995fd]" />
                              <span className="text-neutral-600">Precip: </span>
                              <span className="font-medium">{routeImpact.arrival.precipitationImpact.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <BarChart className="h-3 w-3 text-[#4995fd]" />
                              <span className="text-neutral-600">Turbulence: </span>
                              <span className="font-medium">{routeImpact.arrival.turbulenceImpact.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-600 italic">Weather data unavailable</div>
                    )}
                  </div>
                </div>
                
                {/* Flight Recommendations */}
                <div className="border rounded-md p-4 bg-[#4995fd]/5">
                  <h3 className="text-sm font-medium text-[#003a65] mb-3 flex items-center gap-2">
                    <Compass className="h-4 w-4 text-[#4995fd]" />
                    Flight Planning Recommendations
                  </h3>
                  
                  <ul className="space-y-2 text-sm">
                    {routeImpact.departure?.recommendations.slice(0, 1).map((rec, idx) => (
                      <li key={`dep-${idx}`} className="flex items-start gap-2">
                        <span className="inline-block min-w-[90px] text-xs font-medium text-[#003a65] pt-0.5">DEPARTURE:</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                    
                    {routeImpact.arrival?.recommendations.slice(0, 1).map((rec, idx) => (
                      <li key={`arr-${idx}`} className="flex items-start gap-2">
                        <span className="inline-block min-w-[90px] text-xs font-medium text-[#003a65] pt-0.5">ARRIVAL:</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                    
                    {routeImpact.enroute.details.map((detail, idx) => (
                      <li key={`en-${idx}`} className="flex items-start gap-2">
                        <span className="inline-block min-w-[90px] text-xs font-medium text-[#003a65] pt-0.5">EN ROUTE:</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                    <CloudRain className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="h-4 w-40 bg-blue-200 rounded"></div>
                  <div className="h-3 w-32 bg-blue-100 rounded"></div>
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>

        {/* Departure Weather Tab */}
        <TabsContent value="departure" className="mt-0">
          <CardContent className="pt-6">
            {departureWeather ? (
              <WeatherDetails weather={departureWeather} />
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                    <CloudRain className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="h-4 w-40 bg-blue-200 rounded"></div>
                  <div className="h-3 w-32 bg-blue-100 rounded"></div>
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>

        {/* Arrival Weather Tab */}
        <TabsContent value="arrival" className="mt-0">
          <CardContent className="pt-6">
            {arrivalWeather ? (
              <WeatherDetails weather={arrivalWeather} />
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                    <CloudRain className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="h-4 w-40 bg-blue-200 rounded"></div>
                  <div className="h-3 w-32 bg-blue-100 rounded"></div>
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-end bg-gradient-to-r from-[#4995fd]/5 to-[#a0d0ec]/5 border-t border-[#4995fd]/10">
        <Button variant="outline" onClick={onClose} className="border-[#4995fd]/20 hover:bg-[#4995fd]/5">Close</Button>
      </CardFooter>
    </Card>
  );
}

// Weather Details Component for both departure and arrival tabs
function WeatherDetails({ weather }: { weather: WeatherData }) {
  // Format impact colors
  const getImpactColor = (impact: number): string => {
    if (impact >= 7) return '#e11d48';
    if (impact >= 5) return '#f59e0b';
    if (impact >= 3) return '#facc15';
    return '#22c55e';
  };

  return (
    <div className="space-y-6">
      {/* Current Conditions */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-[#003a65]">{Math.round(weather.current.tempF)}°</div>
          <div className="text-xs text-neutral-500">Feels like: {weather.current.feelsLikeF ? Math.round(weather.current.feelsLikeF) : Math.round(weather.current.tempF)}°</div>
        </div>
        
        <div className="flex-1">
          <div className="text-lg font-medium text-[#003a65]">{weather.current.condition}</div>
          <div className="text-sm text-neutral-600">
            Wind: {weather.current.windMph} mph {weather.current.windDir} • 
            Visibility: {weather.current.visibilityMiles} mi •
            Humidity: {weather.current.humidity}%
          </div>
        </div>
        
        {weather.flightImpact && (
          <div className="flex flex-col items-center">
            <Badge 
              variant="outline" 
              className={`
                ${weather.flightImpact.flightCategory === 'VFR' ? 'border-[#22c55e] text-[#22c55e]' : ''}
                ${weather.flightImpact.flightCategory === 'MVFR' ? 'border-[#facc15] text-[#facc15]' : ''}
                ${weather.flightImpact.flightCategory === 'IFR' ? 'border-[#f59e0b] text-[#f59e0b]' : ''}
                ${weather.flightImpact.flightCategory === 'LIFR' ? 'border-[#e11d48] text-[#e11d48]' : ''}
              `}
            >
              {weather.flightImpact.flightCategory}
            </Badge>
            <div className="text-xs mt-1 text-neutral-600">Flight Category</div>
          </div>
        )}
      </div>
      
      {/* Flight Impact */}
      {weather.flightImpact && (
        <div className="border rounded-md p-4 bg-[#4995fd]/5">
          <h3 className="text-sm font-medium text-[#003a65] mb-3">Flight Weather Impact</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-neutral-600 flex items-center gap-1">
                  <BarChart className="h-3.5 w-3.5 text-[#4995fd]" />
                  Overall Impact
                </span>
                <span style={{ color: getImpactColor(weather.flightImpact.overallImpact) }}>
                  {weather.flightImpact.overallImpact.toFixed(1)}/10
                </span>
              </div>
              <Progress 
                value={weather.flightImpact.overallImpact * 10} 
                className={`h-2 bg-[#4995fd]/10 ${
                  weather.flightImpact.overallImpact >= 7 ? '[&>div]:bg-[#e11d48]' : 
                  weather.flightImpact.overallImpact >= 5 ? '[&>div]:bg-[#f59e0b]' : 
                  weather.flightImpact.overallImpact >= 3 ? '[&>div]:bg-[#facc15]' : 
                  '[&>div]:bg-[#22c55e]'
                }`}
              />
              
              <div className="mt-4 space-y-2">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-neutral-600 flex items-center gap-1">
                    <Wind className="h-3 w-3 text-[#4995fd]" />
                    Wind Impact
                  </span>
                  <span>{weather.flightImpact.windImpact.toFixed(1)}/10</span>
                </div>
                <Progress value={weather.flightImpact.windImpact * 10} className="h-1.5 bg-[#4995fd]/10" />
                
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-neutral-600 flex items-center gap-1">
                    <Eye className="h-3 w-3 text-[#4995fd]" />
                    Visibility Impact
                  </span>
                  <span>{weather.flightImpact.visibilityImpact.toFixed(1)}/10</span>
                </div>
                <Progress value={weather.flightImpact.visibilityImpact * 10} className="h-1.5 bg-[#4995fd]/10" />
                
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-neutral-600 flex items-center gap-1">
                    <CloudRain className="h-3 w-3 text-[#4995fd]" />
                    Precipitation Impact
                  </span>
                  <span>{weather.flightImpact.precipitationImpact.toFixed(1)}/10</span>
                </div>
                <Progress value={weather.flightImpact.precipitationImpact * 10} className="h-1.5 bg-[#4995fd]/10" />
                
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-neutral-600 flex items-center gap-1">
                    <BarChart className="h-3 w-3 text-[#4995fd]" />
                    Turbulence Impact
                  </span>
                  <span>{weather.flightImpact.turbulenceImpact.toFixed(1)}/10</span>
                </div>
                <Progress value={weather.flightImpact.turbulenceImpact * 10} className="h-1.5 bg-[#4995fd]/10" />
              </div>
            </div>
            
            <div className="border-l pl-4">
              <h4 className="text-xs font-medium text-[#003a65] mb-2">Recommendations</h4>
              <ul className="space-y-2 text-sm">
                {weather.flightImpact.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4995fd] mt-1.5"></span>
                    <span className="flex-1">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Weather Alerts */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="border border-[#e11d48]/20 rounded-md p-4 bg-[#e11d48]/5">
          <h3 className="text-sm font-medium text-[#e11d48] flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-[#e11d48]" />
            Active Weather Alerts ({weather.alerts.length})
          </h3>
          
          <div className="space-y-3">
            {weather.alerts.slice(0, 2).map((alert, index) => (
              <div key={index} className="border-b border-[#e11d48]/10 pb-3 last:border-0 last:pb-0">
                <div className="font-medium text-[#e11d48] mb-1">{alert.event}</div>
                <div className="text-sm">{alert.headline}</div>
                <div className="text-xs text-neutral-600 mt-1">
                  {new Date(alert.effective).toLocaleString()} - {new Date(alert.expires).toLocaleString()}
                </div>
              </div>
            ))}
            
            {weather.alerts.length > 2 && (
              <div className="text-sm text-center text-[#e11d48]">
                + {weather.alerts.length - 2} more alerts
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Forecast */}
      {weather.forecast?.daily && (
        <div>
          <h3 className="text-sm font-medium text-[#003a65] mb-3 flex items-center gap-2">
            <Sun className="h-4 w-4 text-[#4995fd]" />
            3-Day Forecast
          </h3>
          
          <div className="grid grid-cols-3 gap-2">
            {weather.forecast.daily.map((day, index) => (
              <div key={index} className="border rounded-md p-3 text-center">
                <div className="text-xs font-medium text-neutral-600 mb-1">
                  {formatDate(day.date)}
                </div>
                
                <div className="text-lg font-bold text-[#003a65]">
                  {Math.round(day.tempMaxF)}° <span className="text-sm font-normal text-neutral-500">/ {Math.round(day.tempMinF)}°</span>
                </div>
                
                <div className="text-xs text-neutral-600 mb-1">{day.condition}</div>
                
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="flex items-center">
                    <Droplets className="h-3 w-3 text-[#4995fd] mr-1" />
                    {day.precipChance}%
                  </span>
                  {day.windMph && (
                    <span className="flex items-center">
                      <Wind className="h-3 w-3 text-[#4995fd] mr-1" />
                      {Math.round(day.windMph)} mph
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Hourly Forecast */}
      {weather.forecast?.hourly && weather.forecast.hourly.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#003a65] mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#4995fd]" />
            Hourly Forecast
          </h3>
          
          <div className="flex overflow-x-auto pb-2 gap-3">
            {weather.forecast.hourly.slice(0, 8).map((hour, index) => (
              <div key={index} className="border rounded-md p-2 text-center min-w-[85px]">
                <div className="text-xs font-medium text-neutral-600 mb-1">
                  {formatTime(hour.time)}
                </div>
                
                <div className="text-base font-bold text-[#003a65]">{Math.round(hour.tempF)}°</div>
                
                <div className="text-xs text-neutral-600 mb-1 truncate" title={hour.condition}>
                  {hour.condition.length > 12 ? hour.condition.substring(0, 10) + '...' : hour.condition}
                </div>
                
                <div className="flex items-center justify-center gap-1 text-xs">
                  <span className="flex items-center">
                    <Wind className="h-3 w-3 text-[#4995fd] mr-0.5" />
                    {Math.round(hour.windMph)}
                  </span>
                  <span className="flex items-center">
                    <Droplets className="h-3 w-3 text-[#4995fd] mr-0.5" />
                    {hour.precipChance}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

// Format time for hourly forecast
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true });
};