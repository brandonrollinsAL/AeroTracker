import React from 'react';
import { LiveFlight, Aircraft } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  X, Star, ChevronUp, ChevronDown, Info, Plane, Map, Clock, Calendar, 
  Navigation, Wind, ArrowUpRight, Wifi, Target, BarChart, Ruler, 
  Circle, Heart, AlertCircle, CheckCircle, RefreshCw, BookOpen
} from 'lucide-react';

interface FlightDetailPanelProps {
  flight: LiveFlight | null;
  onClose: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  isDarkMode?: boolean;
}

export default function FlightDetailPanel({ 
  flight, 
  onClose,
  isPinned = false,
  onTogglePin,
  isDarkMode = false
}: FlightDetailPanelProps) {
  const [aircraftDetails, setAircraftDetails] = React.useState<Aircraft | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [isFavorite, setIsFavorite] = React.useState(false);

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
    return `${speed} kts`;
  };

  // Status mapping
  const statusInfo = {
    scheduled: {
      color: isDarkMode ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-[#f59e0b]/10 text-[#f59e0b]',
      icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
      label: 'Scheduled'
    },
    active: {
      color: isDarkMode ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#22c55e]/10 text-[#22c55e]',
      icon: <Wifi className="h-3.5 w-3.5 mr-1.5" />,
      label: 'In Flight'
    },
    landed: {
      color: isDarkMode ? 'bg-[#3b82f6]/20 text-[#3b82f6]' : 'bg-[#3b82f6]/10 text-[#3b82f6]',
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />,
      label: 'Landed'
    },
    cancelled: {
      color: isDarkMode ? 'bg-[#f43f5e]/20 text-[#f43f5e]' : 'bg-[#f43f5e]/10 text-[#f43f5e]',
      icon: <X className="h-3.5 w-3.5 mr-1.5" />,
      label: 'Cancelled'
    },
    diverted: {
      color: isDarkMode ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 'bg-[#8b5cf6]/10 text-[#8b5cf6]',
      icon: <RefreshCw className="h-3.5 w-3.5 mr-1.5" />,
      label: 'Diverted'
    },
    delayed: {
      color: isDarkMode ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'bg-[#ef4444]/10 text-[#ef4444]',
      icon: <AlertCircle className="h-3.5 w-3.5 mr-1.5" />,
      label: 'Delayed'
    }
  };

  // Get status display
  const statusDisplay = statusInfo[flight.status] || statusInfo.scheduled;

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 z-[1000] transition-all duration-300
        ${isPinned ? 'h-[60vh]' : 'h-[300px]'}
        ${isDarkMode 
          ? 'bg-[#002b4c] border-t border-[#4995fd]/30 shadow-2xl' 
          : 'bg-white border-t border-[#4995fd]/10 shadow-xl'
        }
      `}
      style={{
        borderRadius: '16px 16px 0 0',
        boxShadow: isDarkMode 
          ? '0 -8px 30px rgba(0, 26, 50, 0.5), 0 0 1px rgba(73, 149, 253, 0.3)' 
          : '0 -4px 20px rgba(10, 73, 149, 0.15), 0 0 1px rgba(73, 149, 253, 0.2)'
      }}
    >
      {/* Header */}
      <div 
        className={`
          flex justify-between items-center p-4 border-b relative
          ${isDarkMode 
            ? 'border-[#4995fd]/20 bg-gradient-to-r from-[#002b4c] to-[#003a65]/80' 
            : 'border-[#4995fd]/10 bg-gradient-to-r from-white to-[#f8fcff]'
          }
        `}
      >
        {/* Colored top border line */}
        <div 
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" 
          style={{ 
            background: 'linear-gradient(to right, #003a65, #4995fd)',
            boxShadow: '0 1px 8px rgba(73, 149, 253, 0.3)'
          }}
        />
        
        <div className="flex items-center">
          <div className="mr-3 relative">
            <div 
              className="h-11 w-11 rounded-xl flex items-center justify-center overflow-hidden relative"
              style={{ 
                background: 'linear-gradient(135deg, #003a65, #4995fd)',
                boxShadow: isDarkMode 
                  ? '0 3px 12px rgba(73, 149, 253, 0.3)' 
                  : '0 3px 8px rgba(73, 149, 253, 0.25)'
              }}
            >
              <div className="absolute inset-0 bg-[#4995fd]/20"></div>
              <Plane className="h-5 w-5 text-white transform rotate-45 relative z-10" />
              
              {/* Animated contrail effect */}
              <div className="absolute h-1 w-6 bg-white/60 rounded-full -bottom-0.5 -left-2 transform rotate-45"></div>
            </div>
            
            {/* Status indicator dot */}
            <div 
              className={`
                absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2
                ${isDarkMode ? 'border-[#002b4c]' : 'border-white'}
                ${flight.status === 'active' 
                  ? 'bg-[#22c55e] animate-pulse' 
                  : flight.status === 'scheduled' 
                    ? 'bg-[#f59e0b]' 
                    : flight.status === 'landed' 
                      ? 'bg-[#3b82f6]' 
                      : 'bg-[#ef4444]'
                }
              `}
            />
          </div>
          
          <div>
            <h3 
              className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}
            >
              <span className="bg-gradient-to-r from-[#003a65] to-[#4995fd] bg-clip-text text-transparent">
                {flight.callsign || flight.flightNumber || 'Unknown Flight'}
              </span>
            </h3>
            <div className="flex items-center">
              <p className={`text-sm ${isDarkMode ? 'text-[#a0d0ec]/80' : 'text-[#003a65]/70'}`}>
                {flight.airline?.name || 'Unknown Airline'}
              </p>
              {flight.status === 'active' && (
                <span 
                  className={`
                    ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-sm font-medium
                    ${isDarkMode ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#22c55e]/10 text-[#22c55e]'}
                  `}
                >
                  <span className="relative flex h-1.5 w-1.5 mr-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22c55e]"></span>
                  </span>
                  LIVE
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsFavorite(!isFavorite)}
            className={`
              h-8 w-8 rounded-full
              ${isDarkMode 
                ? 'text-[#a0d0ec] hover:bg-[#003a65]/50' 
                : 'text-[#003a65] hover:bg-[#4995fd]/10'
              }
              transition-all
            `}
          >
            <Heart 
              className={`h-[18px] w-[18px] ${isFavorite ? 'fill-[#4995fd] text-[#4995fd]' : ''}`}
            />
          </Button>
          
          {onTogglePin && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onTogglePin}
              className={`
                h-8 w-8 rounded-full ml-1
                ${isDarkMode 
                  ? 'text-[#a0d0ec] hover:bg-[#003a65]/50' 
                  : 'text-[#003a65] hover:bg-[#4995fd]/10'
                }
                transition-all
              `}
            >
              {isPinned ? 
                <ChevronDown className="h-[18px] w-[18px]" /> : 
                <ChevronUp className="h-[18px] w-[18px]" />
              }
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className={`
              h-8 w-8 rounded-full ml-1
              ${isDarkMode 
                ? 'text-[#a0d0ec] hover:bg-[#003a65]/50' 
                : 'text-[#003a65] hover:bg-[#4995fd]/10'
              }
              transition-all
            `}
          >
            <X className="h-[18px] w-[18px]" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-auto h-[calc(100%-64px)]">
        <Tabs defaultValue="overview" className="w-full">
          <div className={`px-4 pt-3 sticky top-0 z-10 ${isDarkMode ? 'bg-[#002b4c]' : 'bg-white'}`}>
            <TabsList 
              className={`
                grid w-full grid-cols-3 p-1 
                ${isDarkMode 
                  ? 'bg-[#003a65]/50' 
                  : 'bg-[#4995fd]/5'
                }
                rounded-lg
              `}
            >
              <TabsTrigger 
                value="overview"
                className={`
                  flex items-center text-xs py-1.5
                  data-[state=active]:shadow-sm
                  ${isDarkMode
                    ? 'data-[state=active]:bg-[#4995fd] data-[state=active]:text-white text-[#a0d0ec]'
                    : 'data-[state=active]:bg-[#4995fd] data-[state=active]:text-white text-[#003a65]'
                  }
                `}
              >
                <Info className="h-3.5 w-3.5 mr-1.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="route"
                className={`
                  flex items-center text-xs py-1.5
                  data-[state=active]:shadow-sm
                  ${isDarkMode
                    ? 'data-[state=active]:bg-[#4995fd] data-[state=active]:text-white text-[#a0d0ec]'
                    : 'data-[state=active]:bg-[#4995fd] data-[state=active]:text-white text-[#003a65]'
                  }
                `}
              >
                <Map className="h-3.5 w-3.5 mr-1.5" />
                Route
              </TabsTrigger>
              <TabsTrigger 
                value="aircraft"
                className={`
                  flex items-center text-xs py-1.5
                  data-[state=active]:shadow-sm
                  ${isDarkMode
                    ? 'data-[state=active]:bg-[#4995fd] data-[state=active]:text-white text-[#a0d0ec]'
                    : 'data-[state=active]:bg-[#4995fd] data-[state=active]:text-white text-[#003a65]'
                  }
                `}
              >
                <Plane className="h-3.5 w-3.5 mr-1.5" />
                Aircraft
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="pt-2 pb-6">
            <div className="p-4">
              {/* Status and squawk section */}
              <div className="flex items-center justify-between mb-4">
                <Badge 
                  className={`
                    py-1 px-3 font-medium text-xs flex items-center
                    ${statusDisplay.color}
                    ${isDarkMode ? 'bg-opacity-20' : 'bg-opacity-10'}
                  `}
                >
                  {statusDisplay.icon}
                  {statusDisplay.label}
                </Badge>
                
                {flight.squawk && (
                  <div 
                    className={`
                      text-xs font-mono font-medium py-1 px-2 rounded-sm flex items-center
                      ${isDarkMode 
                        ? 'bg-[#4995fd]/10 text-[#a0d0ec]' 
                        : 'bg-[#4995fd]/5 text-[#0a4995]'
                      }
                    `}
                  >
                    <Target className="h-3 w-3 mr-1.5 opacity-80" />
                    {flight.squawk}
                  </div>
                )}
              </div>

              {/* Flight route card */}
              <div 
                className={`
                  p-4 rounded-lg mb-6
                  ${isDarkMode
                    ? 'bg-[#003a65]/50 border border-[#4995fd]/20'
                    : 'bg-white border border-[#4995fd]/10 shadow-sm'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-5 relative">
                  <div className="text-center flex-1">
                    <div 
                      className={`
                        text-2xl font-bold 
                        ${isDarkMode ? 'text-white' : 'text-[#003a65]'}
                      `}
                    >
                      {flight.departure?.icao || 'N/A'}
                    </div>
                    <div className={`
                      text-sm font-medium truncate max-w-[120px] mx-auto
                      ${isDarkMode ? 'text-[#a0d0ec]/70' : 'text-[#003a65]/70'}
                    `}>
                      {formatTime(flight.departure?.time)}
                    </div>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 flex flex-col items-center">
                    <div className={`text-xs font-medium ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#0a4995]'} mb-1`}>
                      {flightProgress}%
                    </div>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mb-1 relative"
                      style={{ 
                        background: 'linear-gradient(135deg, #003a65, #4995fd)',
                        boxShadow: isDarkMode 
                          ? '0 2px 10px rgba(73, 149, 253, 0.4)' 
                          : '0 2px 8px rgba(10, 73, 149, 0.3)'
                      }}
                    >
                      <div className="absolute inset-0 rounded-full bg-[#4995fd]/20"></div>
                      <Plane className="h-4 w-4 text-white transform rotate-45 relative z-10" />
                    </div>
                  </div>
                  
                  <div className="text-center flex-1">
                    <div 
                      className={`
                        text-2xl font-bold 
                        ${isDarkMode ? 'text-white' : 'text-[#003a65]'}
                      `}
                    >
                      {flight.arrival?.icao || 'N/A'}
                    </div>
                    <div className={`
                      text-sm font-medium truncate max-w-[120px] mx-auto
                      ${isDarkMode ? 'text-[#a0d0ec]/70' : 'text-[#003a65]/70'}
                    `}>
                      {formatTime(flight.arrival?.time)}
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className={`
                  relative h-2 rounded-full my-4 overflow-hidden
                  ${isDarkMode ? 'bg-[#002b4c]' : 'bg-[#f5f9ff]'}
                  ${isDarkMode ? 'border border-[#4995fd]/10' : 'border border-[#4995fd]/5'}
                `}>
                  {/* Progress fill */}
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full" 
                    style={{ 
                      width: `${flightProgress}%`,
                      background: 'linear-gradient(to right, #003a65, #4995fd)'
                    }}
                  />
                  
                  {/* Plane marker */}
                  <div 
                    className={`
                      absolute -top-2 h-6 w-6 rounded-full border-2 flex items-center justify-center
                      ${isDarkMode ? 'border-[#002b4c]' : 'border-white'}
                    `}
                    style={{ 
                      left: `${flightProgress}%`, 
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(to bottom right, #4995fd, #003a65)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} 
                  >
                    <Plane className="h-2.5 w-2.5 text-white transform rotate-45" />
                  </div>
                </div>
                
                {/* Airport names */}
                <div className="flex justify-between items-center text-xs mt-6">
                  <div className="text-left max-w-[45%]">
                    <div className={`font-medium ${isDarkMode ? 'text-[#a0d0ec]/70' : 'text-[#003a65]/70'}`}>
                      Departure
                    </div>
                    <div className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-[#0a4995]'}`}>
                      {flight.departure?.name || flight.departure?.icao || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right max-w-[45%]">
                    <div className={`font-medium ${isDarkMode ? 'text-[#a0d0ec]/70' : 'text-[#003a65]/70'}`}>
                      Arrival
                    </div>
                    <div className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-[#0a4995]'}`}>
                      {flight.arrival?.name || flight.arrival?.icao || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight parameters grid */}
              <div 
                className={`
                  p-4 rounded-lg
                  ${isDarkMode
                    ? 'bg-[#003a65]/50 border border-[#4995fd]/20'
                    : 'bg-white border border-[#4995fd]/10 shadow-sm'
                  }
                `}
              >
                <h4 
                  className={`
                    text-sm font-semibold mb-4 pb-2 border-b
                    ${isDarkMode 
                      ? 'text-white border-[#4995fd]/20' 
                      : 'text-[#003a65] border-[#4995fd]/10'
                    }
                  `}
                >
                  Flight Parameters
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  {/* Heading */}
                  <div className="flex items-start">
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                      style={{ 
                        background: isDarkMode 
                          ? 'linear-gradient(135deg, #003a65, #0a4995)' 
                          : 'linear-gradient(135deg, #0a4995, #4995fd)',
                        boxShadow: isDarkMode 
                          ? '0 2px 8px rgba(10, 73, 149, 0.3)' 
                          : '0 2px 6px rgba(10, 73, 149, 0.2)'
                      }}
                    >
                      <Navigation className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xs uppercase font-medium ${isDarkMode ? 'text-[#a0d0ec]/70' : 'text-[#003a65]/70'}`}>
                        Heading
                      </div>
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>
                        {flight.position.heading}°
                      </div>
                    </div>
                  </div>
                  
                  {/* Altitude */}
                  <div className="flex items-start">
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                      style={{ 
                        background: isDarkMode 
                          ? 'linear-gradient(135deg, #003a65, #0a4995)' 
                          : 'linear-gradient(135deg, #0a4995, #4995fd)',
                        boxShadow: isDarkMode 
                          ? '0 2px 8px rgba(10, 73, 149, 0.3)' 
                          : '0 2px 6px rgba(10, 73, 149, 0.2)'
                      }}
                    >
                      <Plane className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xs uppercase font-medium ${isDarkMode ? 'text-[#a0d0ec]/70' : 'text-[#003a65]/70'}`}>
                        Altitude
                      </div>
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>
                        {formatAltitude(flight.position.altitude)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Ground Speed */}
                  <div className="flex items-start">
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                      style={{ 
                        background: isDarkMode 
                          ? 'linear-gradient(135deg, #003a65, #0a4995)' 
                          : 'linear-gradient(135deg, #0a4995, #4995fd)',
                        boxShadow: isDarkMode 
                          ? '0 2px 8px rgba(10, 73, 149, 0.3)' 
                          : '0 2px 6px rgba(10, 73, 149, 0.2)'
                      }}
                    >
                      <Wind className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xs uppercase font-medium ${isDarkMode ? 'text-[#a0d0ec]/70' : 'text-[#003a65]/70'}`}>
                        Ground Speed
                      </div>
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>
                        {formatSpeed(flight.position.groundSpeed)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Vertical Speed */}
                  <div className="flex items-start">
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                      style={{ 
                        background: isDarkMode 
                          ? 'linear-gradient(135deg, #003a65, #0a4995)' 
                          : 'linear-gradient(135deg, #0a4995, #4995fd)',
                        boxShadow: isDarkMode 
                          ? '0 2px 8px rgba(10, 73, 149, 0.3)' 
                          : '0 2px 6px rgba(10, 73, 149, 0.2)'
                      }}
                    >
                      <ArrowUpRight className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xs uppercase font-medium ${isDarkMode ? 'text-[#a0d0ec]/70' : 'text-[#003a65]/70'}`}>
                        Vertical Speed
                      </div>
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>
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
          
          <TabsContent value="route" className="pt-2 pb-6">
            <div className="p-4">
              {/* Route info */}
              <div className="mb-4">
                <h4 className={`font-medium text-sm mb-2 ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]/70'}`}>
                  Flight Path
                </h4>
                <div 
                  className={`
                    p-4 rounded-lg
                    ${isDarkMode
                      ? 'bg-[#003a65]/50 border border-[#4995fd]/20'
                      : 'bg-white border border-[#4995fd]/10 shadow-sm'
                    }
                  `}
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