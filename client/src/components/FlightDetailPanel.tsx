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
    scheduled: 'aviation-status aviation-status-scheduled',
    active: 'aviation-status aviation-status-active',
    landed: 'aviation-status aviation-status-landed',
    cancelled: 'aviation-status aviation-status-cancelled',
    diverted: 'aviation-status aviation-status-delayed',
    delayed: 'bg-amber-100 text-amber-800'
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg z-[1000] transition-all duration-300 aviation-card ${
        isPinned ? 'h-[60vh]' : 'h-[300px]'
      }`}
      style={{
        borderRadius: '12px 12px 0 0',
        borderTop: '3px solid var(--aviation-blue-light)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex justify-between items-center p-4 border-b"
           style={{ background: 'linear-gradient(to right, rgba(10, 73, 149, 0.03), rgba(85, 255, 221, 0.05))' }}>
        <div className="flex items-center">
          <div className="mr-3">
            <div 
              className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden"
              style={{ 
                background: 'var(--aviation-gradient)',
                boxShadow: '0 3px 6px rgba(10, 73, 149, 0.2)'
              }}
            >
              <Plane className="h-5 w-5 text-white transform rotate-45" />
            </div>
          </div>
          <div>
            <h3 
              className="font-semibold text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, var(--aviation-blue-dark), var(--aviation-blue-medium))' }}
            >
              {flight.callsign || flight.flightNumber || 'Unknown Flight'}
            </h3>
            <p className="text-sm text-neutral-500 flex items-center">
              {flight.airline?.name || 'Unknown Airline'}
              {flight.status === 'active' && (
                <span 
                  className="ml-2 inline-block px-1.5 py-0.5 text-[10px] rounded-sm text-white font-semibold animate-pulse"
                  style={{ backgroundColor: 'var(--aviation-blue-accent)' }}
                >
                  LIVE
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {onTogglePin && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onTogglePin}
              className="aviation-icon-btn ml-2"
              style={{ width: "32px", height: "32px" }}
            >
              {isPinned ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronUp className="h-4 w-4" />
              }
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="aviation-icon-btn ml-2"
            style={{ width: "32px", height: "32px" }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-auto h-[calc(100%-64px)]">
        <Tabs defaultValue="overview" className="w-full">
          <div className="px-4 pt-3 sticky top-0 bg-white z-10">
            <TabsList 
              className="grid w-full grid-cols-3 p-1 aviation-tabs"
              style={{ 
                background: 'rgba(10, 73, 149, 0.05)',
                borderRadius: '10px',
                border: '1px solid rgba(85, 255, 221, 0.15)'
              }}
            >
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:aviation-tab-active aviation-tab"
              >
                <Info className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="route"
                className="data-[state=active]:aviation-tab-active aviation-tab"
              >
                <Map className="h-4 w-4 mr-2" />
                Route
              </TabsTrigger>
              <TabsTrigger 
                value="aircraft"
                className="data-[state=active]:aviation-tab-active aviation-tab"
              >
                <Plane className="h-4 w-4 mr-2" />
                Aircraft
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="pt-2">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Badge 
                  className={`py-1 px-3 text-sm ${statusColorMap[flight.status] || 'bg-gray-100 text-gray-800'}`}
                  style={{ borderRadius: '4px' }}
                >
                  {flight.status === 'active' ? 'In Flight' : 
                   flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                </Badge>
                
                {flight.squawk && (
                  <div 
                    className="text-xs font-mono font-semibold py-1 px-2 rounded-sm"
                    style={{ background: 'rgba(10, 73, 149, 0.08)', color: '#0a4995' }}
                  >
                    SQUAWK: {flight.squawk}
                  </div>
                )}
              </div>

              <div 
                className="p-4 rounded-md aviation-card mb-6"
                style={{ 
                  background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(248,252,255,0.9))',
                  border: '1px solid rgba(10, 73, 149, 0.1)'
                }}
              >
                <div className="flex items-center justify-between mb-5 relative">
                  <div className="text-center flex-1">
                    <div 
                      className="text-2xl font-bold bg-clip-text text-transparent"
                      style={{ backgroundImage: 'linear-gradient(90deg, var(--aviation-blue-dark), var(--aviation-blue-medium))' }}
                    >
                      {flight.departure?.icao || 'N/A'}
                    </div>
                    <div className="text-sm text-neutral-600 font-medium truncate max-w-[120px] mx-auto">
                      {formatTime(flight.departure?.time)}
                    </div>
                  </div>
                  
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 flex flex-col items-center">
                    <div className="text-xs font-medium text-[#0a4995] mb-1">{flightProgress}%</div>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--aviation-blue-dark), var(--aviation-blue-light))',
                        boxShadow: '0 2px 8px rgba(10, 73, 149, 0.3)'
                      }}
                    >
                      <Plane className="h-4 w-4 text-white transform rotate-45" />
                    </div>
                  </div>
                  
                  <div className="text-center flex-1">
                    <div 
                      className="text-2xl font-bold bg-clip-text text-transparent"
                      style={{ backgroundImage: 'linear-gradient(90deg, var(--aviation-blue-medium), var(--aviation-blue-light))' }}
                    >
                      {flight.arrival?.icao || 'N/A'}
                    </div>
                    <div className="text-sm text-neutral-600 font-medium truncate max-w-[120px] mx-auto">
                      {formatTime(flight.arrival?.time)}
                    </div>
                  </div>
                </div>
                
                <div className="relative h-3 bg-white rounded-full my-4 overflow-hidden border border-[#5fd]/20">
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full" 
                    style={{ 
                      width: `${flightProgress}%`,
                      background: 'linear-gradient(to right, var(--aviation-blue-dark), var(--aviation-blue-light))'
                    }}
                  />
                  <div 
                    className="absolute -top-1.5 h-6 w-6 rounded-full border-2 border-white shadow-md flex items-center justify-center" 
                    style={{ 
                      left: `${flightProgress}%`, 
                      transform: 'translateX(-50%)',
                      background: 'var(--aviation-blue-medium)'
                    }} 
                  >
                    <Plane className="h-3 w-3 text-white transform rotate-45" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="text-center">
                    <div className="font-medium text-neutral-700">Departure</div>
                    <div className="text-[#0a4995] font-semibold">
                      {flight.departure?.name || flight.departure?.icao || 'N/A'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-neutral-700">Arrival</div>
                    <div className="text-[#0a4995] font-semibold">
                      {flight.arrival?.name || flight.arrival?.icao || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className="p-4 rounded-md aviation-card"
                style={{ 
                  background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(248,252,255,0.9))',
                  border: '1px solid rgba(10, 73, 149, 0.1)'
                }}
              >
                <h4 
                  className="text-sm font-semibold mb-4 pb-2 border-b"
                  style={{ borderColor: 'rgba(10, 73, 149, 0.1)' }}
                >
                  Flight Parameters
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex items-start">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                      style={{ background: 'var(--aviation-gradient)' }}
                    >
                      <Navigation className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs uppercase text-neutral-500 font-medium">Heading</div>
                      <div className="text-lg font-semibold text-neutral-800">{flight.position.heading}°</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                      style={{ background: 'var(--aviation-gradient)' }}
                    >
                      <Plane className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs uppercase text-neutral-500 font-medium">Altitude</div>
                      <div className="text-lg font-semibold text-neutral-800">{formatAltitude(flight.position.altitude)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                      style={{ background: 'var(--aviation-gradient)' }}
                    >
                      <Wind className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs uppercase text-neutral-500 font-medium">Ground Speed</div>
                      <div className="text-lg font-semibold text-neutral-800">{formatSpeed(flight.position.groundSpeed)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                      style={{ background: 'var(--aviation-gradient)' }}
                    >
                      <ArrowUpRight className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs uppercase text-neutral-500 font-medium">Vertical Speed</div>
                      <div className="text-lg font-semibold text-neutral-800">
                        {flight.position.verticalSpeed 
                          ? `${flight.position.verticalSpeed > 0 ? '+' : ''}${flight.position.verticalSpeed} ft/min` 
                          : 'Level'}
                      </div>
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
                <div 
                  className="p-4 rounded-md aviation-card"
                  style={{ 
                    background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(248,252,255,0.9))',
                    border: '1px solid rgba(10, 73, 149, 0.1)'
                  }}
                >
                  <div className="flex justify-between items-center mb-4 relative">
                    <div className="text-center flex-1">
                      <div 
                        className="font-bold text-lg bg-clip-text text-transparent"
                        style={{ backgroundImage: 'linear-gradient(90deg, var(--aviation-blue-dark), var(--aviation-blue-medium))' }}
                      >
                        {flight.departure?.icao || 'N/A'}
                      </div>
                      <div className="text-sm text-neutral-500 truncate max-w-[120px]">
                        {flight.departure?.name || 'Unknown'}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center justify-center mx-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--aviation-gradient)' }}
                      >
                        <Plane className="h-5 w-5 text-white transform rotate-45" />
                      </div>
                    </div>
                    
                    <div className="text-center flex-1">
                      <div 
                        className="font-bold text-lg bg-clip-text text-transparent"
                        style={{ backgroundImage: 'linear-gradient(90deg, var(--aviation-blue-medium), var(--aviation-blue-light))' }}
                      >
                        {flight.arrival?.icao || 'N/A'}
                      </div>
                      <div className="text-sm text-neutral-500 truncate max-w-[120px]">
                        {flight.arrival?.name || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative h-3 bg-white rounded-full my-6 overflow-hidden border border-[#5fd]/20">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full" 
                      style={{ 
                        width: `${flightProgress}%`,
                        background: 'linear-gradient(to right, var(--aviation-blue-dark), var(--aviation-blue-light))'
                      }}
                    />
                    <div 
                      className="absolute -top-1.5 h-6 w-6 rounded-full border-2 border-white shadow-md flex items-center justify-center" 
                      style={{ 
                        left: `${flightProgress}%`, 
                        transform: 'translateX(-50%)',
                        background: 'var(--aviation-blue-medium)'
                      }} 
                    >
                      <Plane className="h-3 w-3 text-white transform rotate-45" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <div className="text-center">
                      <div className="font-medium text-neutral-700">Departure</div>
                      <div className="text-[#0a4995] font-semibold">{formatTime(flight.departure?.time)}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-neutral-700">Progress</div>
                      <div className="text-[#0a4995] font-semibold">{flightProgress}%</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-neutral-700">Arrival</div>
                      <div className="text-[#0a4995] font-semibold">{formatTime(flight.arrival?.time)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-sm text-neutral-500 mb-1">Route Details</h4>
                <div 
                  className="p-4 rounded-md aviation-card"
                  style={{ 
                    background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(248,252,255,0.9))',
                    border: '1px solid rgba(10, 73, 149, 0.1)'
                  }}
                >
                  <div className="flex items-center mb-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                      style={{ background: 'var(--aviation-gradient)' }}
                    >
                      <Map className="h-4 w-4 text-white" />
                    </div>
                    <p className="font-mono text-sm break-all accent-border pl-2">
                      {flight.route || 'No route information available'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-neutral-500 mb-1">Current Location</h4>
                <div 
                  className="p-4 rounded-md aviation-card"
                  style={{ 
                    background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(248,252,255,0.9))',
                    border: '1px solid rgba(10, 73, 149, 0.1)'
                  }}
                >
                  <div className="flex items-start mb-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1"
                      style={{ background: 'var(--aviation-gradient)' }}
                    >
                      <Navigation className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="border-l-2 pl-2" style={{ borderColor: 'var(--aviation-blue-dark)' }}>
                          <p className="text-xs uppercase text-neutral-500 font-medium">Latitude</p>
                          <p className="text-sm font-semibold text-neutral-800">{flight.position.latitude.toFixed(6)}°</p>
                        </div>
                        <div className="border-l-2 pl-2" style={{ borderColor: 'var(--aviation-blue-medium)' }}>
                          <p className="text-xs uppercase text-neutral-500 font-medium">Longitude</p>
                          <p className="text-sm font-semibold text-neutral-800">{flight.position.longitude.toFixed(6)}°</p>
                        </div>
                      </div>
                      <div className="mt-3 border-l-2 pl-2" style={{ borderColor: 'var(--aviation-blue-light)' }}>
                        <p className="text-xs uppercase text-neutral-500 font-medium">Last Update</p>
                        <p className="text-sm font-semibold text-neutral-800">{new Date(flight.position.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
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
                    <h4 className="font-medium text-sm text-neutral-500 mb-1">Aircraft Information</h4>
                    <div 
                      className="p-4 rounded-md aviation-card"
                      style={{ 
                        background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(248,252,255,0.9))',
                        border: '1px solid rgba(10, 73, 149, 0.1)'
                      }}
                    >
                      <div className="flex items-start mb-2">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
                          style={{ background: 'var(--aviation-gradient)' }}
                        >
                          <Plane className="h-6 w-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="grid grid-cols-1 gap-3 mb-4">
                            <div className="border-l-2 pl-3 py-1" style={{ borderColor: 'var(--aviation-blue-dark)' }}>
                              <p className="text-xs uppercase text-neutral-500 font-medium">Registration</p>
                              <p className="text-lg font-bold text-neutral-900">{flight.registration || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="border-l-2 pl-3 py-1" style={{ borderColor: 'var(--aviation-blue-medium)' }}>
                              <p className="text-xs uppercase text-neutral-500 font-medium">Aircraft Type</p>
                              <p className="text-sm font-semibold text-neutral-800">{flight.aircraftType || 'N/A'}</p>
                            </div>
                            <div className="border-l-2 pl-3 py-1" style={{ borderColor: 'var(--aviation-blue-medium)' }}>
                              <p className="text-xs uppercase text-neutral-500 font-medium">ICAO Type</p>
                              <p className="text-sm font-semibold text-neutral-800">{aircraftDetails.details?.icaoType || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {aircraftDetails.details && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-neutral-500 mb-1">Performance Data</h4>
                      <div 
                        className="p-4 rounded-md aviation-card"
                        style={{ 
                          background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(248,252,255,0.9))',
                          border: '1px solid rgba(10, 73, 149, 0.1)'
                        }}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border-l-2 pl-3 py-1" style={{ borderColor: 'var(--aviation-blue-light)' }}>
                            <p className="text-xs uppercase text-neutral-500 font-medium">Engines</p>
                            <p className="text-sm font-semibold text-neutral-800">{aircraftDetails.details.engines || 'N/A'}</p>
                          </div>
                          
                          <div className="border-l-2 pl-3 py-1" style={{ borderColor: 'var(--aviation-blue-light)' }}>
                            <p className="text-xs uppercase text-neutral-500 font-medium">Engine Type</p>
                            <p className="text-sm font-semibold text-neutral-800">{aircraftDetails.details.engineType || 'N/A'}</p>
                          </div>
                          
                          <div className="border-l-2 pl-3 py-1" style={{ borderColor: 'var(--aviation-blue-dark)' }}>
                            <p className="text-xs uppercase text-neutral-500 font-medium">Range</p>
                            <p className="text-sm font-semibold text-neutral-800">
                              {aircraftDetails.details.range ? `${aircraftDetails.details.range} nm` : 'N/A'}
                            </p>
                          </div>
                          
                          <div className="border-l-2 pl-3 py-1" style={{ borderColor: 'var(--aviation-blue-dark)' }}>
                            <p className="text-xs uppercase text-neutral-500 font-medium">Ceiling</p>
                            <p className="text-sm font-semibold text-neutral-800">
                              {aircraftDetails.details.ceiling ? `${aircraftDetails.details.ceiling} ft` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-sm text-neutral-500 mb-1">Aircraft History</h4>
                    <div 
                      className="p-4 rounded-md aviation-card flex items-center"
                      style={{ 
                        background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(248,252,255,0.9))',
                        border: '1px solid rgba(10, 73, 149, 0.1)'
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                        style={{ background: 'var(--aviation-gradient)' }}
                      >
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 border-l-2 pl-3" style={{ borderColor: 'var(--aviation-blue-medium)' }}>
                        <p className="text-xs uppercase text-neutral-500 font-medium">First Flight</p>
                        <p className="text-sm font-semibold text-neutral-800">{aircraftDetails.details?.firstFlight || 'N/A'}</p>
                      </div>
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