import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Info, Shield, ThumbsUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlight } from '@/hooks/use-flight-map-context';
import type { LiveFlight } from '@/types';

interface FlightSafetyCompanionProps {
  flight: LiveFlight | null;
}

export function FlightSafetyCompanion({ flight }: FlightSafetyCompanionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'safety' | 'info' | 'tips'>('safety');
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [animation, setAnimation] = useState<'wave' | 'thumbsUp' | 'shield' | null>(null);

  // Calculate safety score based on flight data
  useEffect(() => {
    if (flight) {
      // Base score from 70-100
      let score = 85;
      
      // Aircraft type affects score
      if (flight.aircraftType?.includes('737')) {
        score += 5; // Common reliable aircraft
      } else if (flight.aircraftType?.includes('A320')) {
        score += 7; // Another common reliable aircraft
      }
      
      // Altitude affects score (normal cruising is safer)
      const altitude = flight.position?.altitude || 0;
      if (altitude > 30000 && altitude < 40000) {
        score += 3; // Optimal cruising altitude
      } else if (altitude < 5000) {
        score -= 2; // Lower altitudes have less margin for error
      }
      
      // Weather conditions would affect score
      // This would be implemented with actual weather data
      
      // Cap the score between 70 and 100
      score = Math.max(70, Math.min(100, score));
      
      setSafetyScore(score);
    } else {
      setSafetyScore(null);
    }
  }, [flight]);

  // Trigger animations periodically
  useEffect(() => {
    if (isOpen && flight) {
      const interval = setInterval(() => {
        const animations: ('wave' | 'thumbsUp' | 'shield')[] = ['wave', 'thumbsUp', 'shield'];
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
        setAnimation(randomAnimation);
        
        // Clear animation after 2 seconds
        setTimeout(() => {
          setAnimation(null);
        }, 2000);
      }, 15000); // Play an animation every 15 seconds
      
      return () => clearInterval(interval);
    }
  }, [isOpen, flight]);

  // Get safety advice based on flight data
  const getSafetyAdvice = () => {
    if (!flight) return [];
    
    const advice = [];
    
    // Add general advice
    advice.push("Keep your seatbelt fastened when seated");
    
    // Altitude-specific advice
    const altitude = flight.position?.altitude || 0;
    if (altitude < 10000) {
      advice.push("Electronic devices should be in airplane mode");
      advice.push("Tray tables should be stowed during takeoff/landing");
    }
    
    // Speed-specific advice
    const speed = flight.position?.groundSpeed || 0;
    if (speed > 550) {
      advice.push("Higher speeds may cause occasional turbulence");
    }
    
    return advice;
  };

  // Get interesting facts about the flight
  const getFlightInfo = () => {
    if (!flight) return [];
    
    const info = [];
    
    // Aircraft info
    if (flight.aircraftType) {
      info.push(`Aircraft: ${flight.aircraftType}`);
    }
    
    // Flight path info
    if (flight.departure?.icao && flight.arrival?.icao) {
      const distance = calculateDistance(
        flight.departure.latitude || 0, 
        flight.departure.longitude || 0,
        flight.arrival.latitude || 0,
        flight.arrival.longitude || 0
      );
      info.push(`Flight distance: ~${distance.toFixed(0)} miles`);
    }
    
    // Speed and altitude info
    if (flight.position?.groundSpeed) {
      const groundSpeed = flight.position.groundSpeed;
      info.push(`Current speed: ${groundSpeed} knots (${Math.round(groundSpeed * 1.15)} mph)`);
    }
    
    if (flight.position?.altitude) {
      const altitude = flight.position.altitude;
      info.push(`Current altitude: ${altitude.toLocaleString()} feet (${(altitude / 3280.84).toFixed(1)} km)`);
    }
    
    return info;
  };

  // Calculate rough distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c;
    return d;
  };

  // Convert degrees to radians
  const toRad = (value: number) => {
    return value * Math.PI / 180;
  };

  // Get travel tips based on flight data
  const getTravelTips = () => {
    if (!flight) return [];
    
    const tips = [];
    
    // General tips
    tips.push("Stay hydrated during the flight");
    tips.push("Get up and stretch periodically on longer flights");
    
    // Flight duration tips
    if (flight.departure && flight.arrival) {
      // Add more specific tips based on estimated flight duration
      tips.push("Compression socks can help circulation on flights longer than 4 hours");
    }
    
    // Add destination specific tips if available
    if (flight.arrival?.icao) {
      if (flight.arrival.icao.startsWith('K')) {
        // US airport
        tips.push("Ensure your travel documents are ready for US customs");
      } else if (flight.arrival.icao.startsWith('E')) {
        // European airport
        tips.push("Keep your passport accessible for European border control");
      }
    }
    
    return tips;
  };

  if (!flight) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.3 }}
            className="relative"
          >
            <Card className="w-80 shadow-lg">
              <div className="absolute right-2 top-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 rounded-full" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <CardContent className="p-4 pt-6">
                <div className="flex items-center mb-4">
                  <div className="mr-3 relative">
                    {/* Avatar and animation container */}
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    {/* Animated elements */}
                    <AnimatePresence>
                      {animation === 'wave' && (
                        <motion.div 
                          className="absolute -top-4 -right-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          👋
                        </motion.div>
                      )}
                      
                      {animation === 'thumbsUp' && (
                        <motion.div 
                          className="absolute -top-4 -right-2"
                          initial={{ opacity: 0, rotate: -45, y: 10 }}
                          animate={{ opacity: 1, rotate: 0, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          👍
                        </motion.div>
                      )}
                      
                      {animation === 'shield' && (
                        <motion.div 
                          className="absolute -top-4 -right-2 text-blue-600"
                          initial={{ opacity: 0, scale: 1.5 }}
                          animate={{ 
                            opacity: [0, 1, 1, 0],
                            scale: [1.5, 1.2, 1.2, 1],
                            transition: { duration: 2 }
                          }}
                          exit={{ opacity: 0 }}
                        >
                          🛡️
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm">Flight Safety Companion</h3>
                    <p className="text-xs text-gray-500">{flight.callsign || flight.flightNumber}</p>
                  </div>
                </div>
                
                {safetyScore !== null && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Safety Score</span>
                      <Badge 
                        className={`px-2 py-0.5 ${
                          safetyScore >= 90 ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                          safetyScore >= 80 ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                          'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                        }`}
                      >
                        {safetyScore}/100
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <motion.div 
                        className={`h-1.5 rounded-full ${
                          safetyScore >= 90 ? 'bg-green-500' : 
                          safetyScore >= 80 ? 'bg-blue-500' : 
                          'bg-yellow-500'
                        }`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${safetyScore}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
                
                <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                  <TabsList className="grid grid-cols-3 w-full mb-3">
                    <TabsTrigger value="safety" className="text-xs py-1">
                      <Shield className="h-3 w-3 mr-1" />
                      Safety
                    </TabsTrigger>
                    <TabsTrigger value="info" className="text-xs py-1">
                      <Info className="h-3 w-3 mr-1" />
                      Info
                    </TabsTrigger>
                    <TabsTrigger value="tips" className="text-xs py-1">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Tips
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="safety" className="mt-0">
                    <ul className="space-y-2">
                      {getSafetyAdvice().map((advice, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start text-xs"
                        >
                          <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>{advice}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="info" className="mt-0">
                    <ul className="space-y-2">
                      {getFlightInfo().map((info, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start text-xs"
                        >
                          <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>{info}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="tips" className="mt-0">
                    <ul className="space-y-2">
                      {getTravelTips().map((tip, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start text-xs"
                        >
                          <ThumbsUp className="h-3.5 w-3.5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>{tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => setIsOpen(true)}
              className="rounded-full h-12 w-12 bg-blue-500 hover:bg-blue-600 shadow-lg"
            >
              <Shield className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}