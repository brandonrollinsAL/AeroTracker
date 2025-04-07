import React, { useState, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Airport } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useMap } from 'react-leaflet';
import axios from 'axios';

interface AirportMarkerProps {
  airport: Airport;
  currentZoom: number;
}

// Sample runway information for demonstration
type RunwayInfo = {
  designation: string;
  length: number; // in feet
  width: number; // in feet
  surface: string;
  lighting: boolean;
};

// Sample weather information for demonstration
type AirportWeather = {
  condition: string; // clear, cloudy, rain, snow, fog, etc.
  windSpeed: number;
  windDirection: string;
  visibility: number;
  temperature: number;
  dewPoint: number;
  barometer: number;
  ceiling: number | null;
};

// Sample frequency information for demonstration
type FrequencyInfo = {
  type: string; // ATIS, Tower, Ground, Departure, Approach, etc.
  frequency: string; // e.g. "118.7"
};

// Sample airport details for demonstration
type AirportDetails = {
  runways: RunwayInfo[];
  frequencies: FrequencyInfo[];
  weather?: AirportWeather;
};

// Create a custom icon for airports with color based on weather conditions
const createAirportIcon = (size: 'large' | 'medium' | 'small' | undefined, weather?: string) => {
  const iconSize = size === 'large' ? 14 : size === 'medium' ? 12 : 10;
  
  // Color based on weather conditions
  let iconColor = '#4995fd'; // Default blue
  
  if (weather) {
    switch(weather.toLowerCase()) {
      case 'clear':
        iconColor = '#4995fd'; // Blue for clear conditions
        break;
      case 'cloudy':
        iconColor = '#a0d0ec'; // Light blue for cloudy
        break;
      case 'rain':
        iconColor = '#003a65'; // Dark blue for rain
        break;
      case 'fog':
        iconColor = '#a0a0a0'; // Gray for fog
        break;
      case 'snow':
        iconColor = '#ffffff'; // White for snow
        break;
      case 'thunderstorm':
        iconColor = '#ff3333'; // Red for thunderstorms
        break;
    }
  }
  
  return L.divIcon({
    html: `<div style="width: ${iconSize}px; height: ${iconSize}px; background-color: ${iconColor}; border-radius: 50%; border: 1px solid rgba(0,0,0,0.2);"></div>`,
    className: 'airport-icon',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2]
  });
};

// Generate sample airport details (for demonstration)
const generateAirportDetails = (airport: Airport): AirportDetails => {
  // Generate a deterministic but seemingly random set of details based on airport ID
  const seed = airport.id * 13 + airport.code.charCodeAt(0);
  
  // Generate 1-3 runways
  const runwayCount = (seed % 3) + 1;
  const runways: RunwayInfo[] = [];
  
  for (let i = 0; i < runwayCount; i++) {
    const runwayNum = ((seed + i * 7) % 36) + 1;
    const oppositeNum = (runwayNum + 18) % 36 || 36;
    
    runways.push({
      designation: `${runwayNum.toString().padStart(2, '0')}/${oppositeNum.toString().padStart(2, '0')}`,
      length: 5000 + ((seed + i * 11) % 7000), // 5000-12000 feet
      width: 100 + ((seed + i * 13) % 100), // 100-200 feet
      surface: ['Asphalt', 'Concrete', 'Asphalt/Concrete'][seed % 3],
      lighting: (seed + i) % 2 === 0
    });
  }
  
  // Generate 3-5 frequencies
  const freqCount = 3 + (seed % 3);
  const freqTypes = ['ATIS', 'Tower', 'Ground', 'Departure', 'Approach', 'Clearance'];
  const frequencies: FrequencyInfo[] = [];
  
  for (let i = 0; i < freqCount; i++) {
    const freqType = freqTypes[i % freqTypes.length];
    const freqMhz = 118 + (seed + i * 3) % 19; // 118-136 MHz
    const freqKhz = (seed + i * 7) % 100; // 0-99 kHz
    
    frequencies.push({
      type: freqType,
      frequency: `${freqMhz}.${freqKhz.toString().padStart(2, '0')}`
    });
  }
  
  // Generate weather based on airport code (for demonstration consistency)
  const weatherConditions = ['Clear', 'Cloudy', 'Rain', 'Fog', 'Snow', 'Thunderstorm'];
  const weatherIdx = Math.abs(airport.code.charCodeAt(0) + airport.code.charCodeAt(1)) % weatherConditions.length;
  
  const weather: AirportWeather = {
    condition: weatherConditions[weatherIdx],
    windSpeed: (seed % 30), // 0-29 knots
    windDirection: `${((seed * 13) % 36) * 10}°`, // 0-350 degrees
    visibility: (seed % 10) + (seed % 100) / 100, // 0-10 miles
    temperature: 10 + (seed % 25), // 10-34 degrees C
    dewPoint: 5 + (seed % 15), // 5-19 degrees C
    barometer: 29.7 + (seed % 10) / 10, // 29.7-30.6 inHg
    ceiling: (weatherIdx <= 1) ? null : (seed % 5 + 1) * 1000 // null or 1000-5000 feet
  };
  
  return {
    runways,
    frequencies,
    weather
  };
};

export default function AirportMarker({ airport, currentZoom }: AirportMarkerProps) {
  const [details, setDetails] = useState<AirportDetails | null>(null);
  const map = useMap();
  const [isVisible, setIsVisible] = useState(false);
  
  // Show larger airports at low zoom, and all airports at high zoom
  useEffect(() => {
    const shouldShow = () => {
      if (currentZoom >= 10) {
        // At high zoom levels, show all airports
        return true;
      } else if (currentZoom >= 7) {
        // At medium zoom, show medium and large airports
        return airport.size === 'large' || airport.size === 'medium';
      } else {
        // At low zoom, only show large international airports
        return airport.size === 'large' && airport.type === 'international';
      }
    };
    
    setIsVisible(shouldShow());
  }, [currentZoom, airport]);
  
  // Generate airport details when popup is opened
  const handlePopupOpen = () => {
    // For demonstration, we'll generate the details
    // In a real application, you'd fetch this from an API
    setDetails(generateAirportDetails(airport));
  };
  
  if (!isVisible) {
    return null;
  }
  
  const weatherCondition = details?.weather?.condition || 'Clear';
  
  return (
    <Marker
      position={[airport.latitude, airport.longitude]}
      icon={createAirportIcon(airport.size, weatherCondition)}
      eventHandlers={{
        popupopen: handlePopupOpen
      }}
    >
      <Popup className="airport-popup" minWidth={300} maxWidth={350}>
        <div className="popup-header bg-gradient-to-r from-[#0a4995] to-[#2460a7] text-white px-3 py-2 -mx-2 -mt-2 rounded-t-lg flex items-center mb-2">
          <div className="h-7 w-7 rounded-full bg-[#55ffdd]/20 flex items-center justify-center mr-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 22h18L12 2 3 22zm9-5h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="#ffffff" />
            </svg>
          </div>
          <div className="font-bold tracking-wide">{airport.name} ({airport.code})</div>
        </div>
        
        <Tabs defaultValue="info">
          <TabsList className="w-full mb-2">
            <TabsTrigger value="info" className="text-xs flex-1">Info</TabsTrigger>
            <TabsTrigger value="weather" className="text-xs flex-1">Weather</TabsTrigger>
            <TabsTrigger value="runways" className="text-xs flex-1">Runways</TabsTrigger>
            <TabsTrigger value="frequencies" className="text-xs flex-1">Frequencies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <div className="text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs text-neutral-600">City:</div>
                <div className="text-xs font-medium">{airport.city}</div>
                
                <div className="text-xs text-neutral-600">Country:</div>
                <div className="text-xs font-medium">{airport.country}</div>
                
                <div className="text-xs text-neutral-600">Type:</div>
                <div className="text-xs font-medium">
                  {airport.type && airport.type.charAt(0).toUpperCase() + airport.type.slice(1)}
                </div>
                
                <div className="text-xs text-neutral-600">Size:</div>
                <div className="text-xs font-medium">
                  {airport.size && airport.size.charAt(0).toUpperCase() + airport.size.slice(1)}
                </div>
                
                <div className="text-xs text-neutral-600">Coordinates:</div>
                <div className="text-xs font-medium">
                  {airport.latitude.toFixed(4)}, {airport.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="weather">
            {details?.weather ? (
              <div className="text-sm">
                <div className="p-2 mb-2 bg-gray-50 rounded text-center font-medium">
                  {details.weather.condition} • {details.weather.temperature}°C
                </div>
                
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="text-xs text-neutral-600">Wind:</div>
                  <div className="text-xs font-medium">
                    {details.weather.windDirection} at {details.weather.windSpeed} kts
                  </div>
                  
                  <div className="text-xs text-neutral-600">Visibility:</div>
                  <div className="text-xs font-medium">{details.weather.visibility} mi</div>
                  
                  <div className="text-xs text-neutral-600">Dew Point:</div>
                  <div className="text-xs font-medium">{details.weather.dewPoint}°C</div>
                  
                  <div className="text-xs text-neutral-600">Barometer:</div>
                  <div className="text-xs font-medium">{details.weather.barometer} inHg</div>
                  
                  <div className="text-xs text-neutral-600">Ceiling:</div>
                  <div className="text-xs font-medium">
                    {details.weather.ceiling ? `${details.weather.ceiling} ft` : 'Unlimited'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-sm text-neutral-500">
                Loading weather data...
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="runways">
            {details?.runways ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {details.runways.map((runway, index) => (
                  <Card key={index} className="border-gray-200">
                    <CardContent className="p-3">
                      <div className="font-medium text-sm mb-1">Runway {runway.designation}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="text-xs text-neutral-600">Length:</div>
                        <div className="text-xs">{runway.length.toLocaleString()} ft</div>
                        
                        <div className="text-xs text-neutral-600">Width:</div>
                        <div className="text-xs">{runway.width} ft</div>
                        
                        <div className="text-xs text-neutral-600">Surface:</div>
                        <div className="text-xs">{runway.surface}</div>
                        
                        <div className="text-xs text-neutral-600">Lighting:</div>
                        <div className="text-xs">{runway.lighting ? 'Yes' : 'No'}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-sm text-neutral-500">
                Loading runway information...
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="frequencies">
            {details?.frequencies ? (
              <div className="space-y-1">
                {details.frequencies.map((freq, index) => (
                  <div key={index} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                    <div className="text-xs text-neutral-600">{freq.type}:</div>
                    <div className="text-xs font-medium">{freq.frequency}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-sm text-neutral-500">
                Loading frequency information...
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Popup>
    </Marker>
  );
}