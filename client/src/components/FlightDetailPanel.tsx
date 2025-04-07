import React from 'react';
import { LiveFlight, Aircraft } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { X, Star, ChevronUp, ChevronDown, Info, Plane, Map, Clock, Calendar, Navigation, Wind, ArrowUpRight } from 'lucide-react';

interface FlightDetailPanelProps {
  flight: LiveFlight | null;
  onClose: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export default function FlightDetailPanel({ 
  flight, 
  onClose,
  isPinned = false,
  onTogglePin
}: FlightDetailPanelProps) {
  const [aircraftDetails, setAircraftDetails] = React.useState<Aircraft | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (flight?.registration) {
      setLoading(true);
      fetch(`/api/aircraft/${flight.registration}`)
        .then(response => response.json())
        .then(data => {
          setAircraftDetails(data);
        })
        .catch(error => {
          console.error('Error fetching aircraft details:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setAircraftDetails(null);
    }
  }, [flight]);

  if (!flight) return null;

  // Calculate flight progress
  const flightProgress = flight.progress || 0;
  
  // Format flight time
  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    const time = new Date(timeString);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format altitude
  const formatAltitude = (altitude: number) => {
    if (altitude < 100) return `${altitude} ft`;
    return `${(altitude / 1000).toFixed(1)}k ft`;
  };

  // Format speed
  const formatSpeed = (speed: number) => {
    return `${speed} mph`;
  };

  // Status color map
  const statusColorMap = {
    scheduled: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    landed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    diverted: 'bg-orange-100 text-orange-800',
    delayed: 'bg-amber-100 text-amber-800'
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg z-[1000] transition-all duration-300 ${
      isPinned ? 'h-[60vh]' : 'h-[300px]'
    }`}>
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center">
          <div className="mr-2">
            {flight.airline?.icao && (
              <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                <span className="material-icons text-primary">flight</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800">
              {flight.callsign || flight.flightNumber || 'Unknown Flight'}
            </h3>
            <p className="text-sm text-neutral-500">
              {flight.airline?.name || 'Unknown Airline'}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {onTogglePin && (
            <Button variant="ghost" size="icon" onClick={onTogglePin}>
              {isPinned ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-auto h-[calc(100%-64px)]">
        <Tabs defaultValue="overview" className="w-full">
          <div className="px-4 pt-2 sticky top-0 bg-white z-10">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="route">Route</TabsTrigger>
              <TabsTrigger value="aircraft">Aircraft</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="pt-2">
            <div className="p-4">
              <div className="flex items-center mb-4">
                <Badge className={statusColorMap[flight.status] || 'bg-gray-100 text-gray-800'}>
                  {flight.status === 'active' ? 'In Flight' : 
                   flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {flight.departure?.icao || 'N/A'}
                  </div>
                  <div className="text-sm text-neutral-500">
                    {formatTime(flight.departure?.time)}
                  </div>
                </div>
                
                <div className="flex-1 px-4">
                  <div className="relative">
                    <Progress value={flightProgress} className="h-1" />
                    <div className="absolute top-2 left-0 right-0 flex justify-between text-xs text-neutral-500">
                      <span>Departed</span>
                      <span>Arriving</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold">
                    {flight.arrival?.icao || 'N/A'}
                  </div>
                  <div className="text-sm text-neutral-500">
                    {formatTime(flight.arrival?.time)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Navigation className="h-4 w-4 mr-2 text-neutral-500" />
                  <div>
                    <div className="text-sm font-medium">Heading</div>
                    <div className="text-lg">{flight.position.heading}°</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Plane className="h-4 w-4 mr-2 text-neutral-500" />
                  <div>
                    <div className="text-sm font-medium">Altitude</div>
                    <div className="text-lg">{formatAltitude(flight.position.altitude)}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Wind className="h-4 w-4 mr-2 text-neutral-500" />
                  <div>
                    <div className="text-sm font-medium">Ground Speed</div>
                    <div className="text-lg">{formatSpeed(flight.position.groundSpeed)}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-2 text-neutral-500" />
                  <div>
                    <div className="text-sm font-medium">Vertical Speed</div>
                    <div className="text-lg">
                      {flight.position.verticalSpeed 
                        ? `${flight.position.verticalSpeed > 0 ? '+' : ''}${flight.position.verticalSpeed} ft/min` 
                        : 'Level'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="route" className="pt-2">
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-medium text-sm text-neutral-500 mb-1">Flight Path</h4>
                <div className="bg-neutral-50 p-3 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-semibold">{flight.departure?.icao || 'N/A'}</div>
                      <div className="text-sm text-neutral-500">{flight.departure?.name || 'Unknown'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{flight.arrival?.icao || 'N/A'}</div>
                      <div className="text-sm text-neutral-500">{flight.arrival?.name || 'Unknown'}</div>
                    </div>
                  </div>
                  <div className="relative h-2 bg-neutral-200 rounded my-4">
                    <div 
                      className="absolute top-0 left-0 h-2 bg-primary rounded" 
                      style={{ width: `${flightProgress}%` }}
                    />
                    <div className="absolute -top-1 h-4 w-4 bg-primary rounded-full" style={{ left: `${flightProgress}%`, transform: 'translateX(-50%)' }} />
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <div>{formatTime(flight.departure?.time)}</div>
                    <div>Progress: {flightProgress}%</div>
                    <div>{formatTime(flight.arrival?.time)}</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-sm text-neutral-500 mb-1">Route Details</h4>
                <div className="bg-neutral-50 p-3 rounded-md">
                  <p className="font-mono text-sm break-all">
                    {flight.route || 'No route information available'}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-neutral-500 mb-1">Current Location</h4>
                <div className="bg-neutral-50 p-3 rounded-md">
                  <p className="text-sm">
                    <span className="font-semibold">Latitude:</span> {flight.position.latitude.toFixed(6)}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Longitude:</span> {flight.position.longitude.toFixed(6)}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Last Updated:</span> {new Date(flight.position.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="aircraft" className="pt-2">
            <div className="p-4">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : aircraftDetails ? (
                <>
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-neutral-500 mb-1">Basic Information</h4>
                    <div className="bg-neutral-50 p-3 rounded-md">
                      <p className="text-sm mb-1">
                        <span className="font-semibold">Registration:</span> {flight.registration || 'N/A'}
                      </p>
                      <p className="text-sm mb-1">
                        <span className="font-semibold">Type:</span> {flight.aircraftType || 'N/A'}
                      </p>
                      <p className="text-sm mb-1">
                        <span className="font-semibold">ICAO Type:</span> {aircraftDetails.details?.icaoType || 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">ICAO Class:</span> {aircraftDetails.details?.icaoClass || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {aircraftDetails.details && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-neutral-500 mb-1">Performance</h4>
                      <div className="bg-neutral-50 p-3 rounded-md">
                        <p className="text-sm mb-1">
                          <span className="font-semibold">Engines:</span> {aircraftDetails.details.engines || 'N/A'}
                        </p>
                        <p className="text-sm mb-1">
                          <span className="font-semibold">Engine Type:</span> {aircraftDetails.details.engineType || 'N/A'}
                        </p>
                        <p className="text-sm mb-1">
                          <span className="font-semibold">Range:</span> {aircraftDetails.details.range ? `${aircraftDetails.details.range} nm` : 'N/A'}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Ceiling:</span> {aircraftDetails.details.ceiling ? `${aircraftDetails.details.ceiling} ft` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-sm text-neutral-500 mb-1">History</h4>
                    <div className="bg-neutral-50 p-3 rounded-md">
                      <p className="text-sm">
                        <span className="font-semibold">First Flight:</span> {aircraftDetails.details?.firstFlight || 'N/A'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 text-neutral-500">
                  <Plane className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No aircraft details available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}