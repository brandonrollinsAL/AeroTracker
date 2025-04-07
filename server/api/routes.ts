import { Airport } from '@shared/schema';
import { storage } from '../storage';

interface RouteParams {
  departureCode: string;
  arrivalCode: string;
  aircraftType: string;
  fuelEfficiency: number;
  considerWeather: boolean;
  optimizationFactor: 'balanced' | 'fuel' | 'time' | 'altitude' | 'weather';
  plannedDate?: string;
}

interface WindComponent {
  tailwind: number;
  headwind: number;
  crosswind: number;
}

interface RouteWaypoint {
  lat: number;
  lon: number;
  name: string;
}

interface AltitudePoint {
  distance: number;
  altitude: number;
}

export interface OptimizedRoute {
  routeName: string;
  fuelBurn: number;
  flightTime: number;
  distance: number;
  waypoints: RouteWaypoint[];
  weatherImpact: 'low' | 'medium' | 'high';
  altitudeProfile: AltitudePoint[];
  windComponent: WindComponent;
}

/**
 * Calculate optimized route between two airports
 */
export async function calculateOptimizedRoute(params: RouteParams): Promise<OptimizedRoute | null> {
  try {
    const { departureCode, arrivalCode, aircraftType, fuelEfficiency, considerWeather, optimizationFactor } = params;
    
    // Get airport data
    const departureAirport = await storage.getAirportByCode(departureCode);
    const arrivalAirport = await storage.getAirportByCode(arrivalCode);
    
    if (!departureAirport || !arrivalAirport) {
      console.error('Airport not found');
      return null;
    }
    
    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      departureAirport.latitude, 
      departureAirport.longitude, 
      arrivalAirport.latitude, 
      arrivalAirport.longitude
    );
    
    // Get aircraft performance data
    const aircraftPerformance = getAircraftPerformance(aircraftType);
    
    // Calculate cruise altitude based on distance and aircraft type
    const cruiseAltitude = calculateCruiseAltitude(distance, aircraftType);
    
    // Calculate fuel burn based on distance, aircraft type and efficiency setting
    const fuelBurn = calculateFuelBurn(distance, aircraftType, fuelEfficiency, considerWeather);
    
    // Calculate flight time
    const flightTime = calculateFlightTime(distance, aircraftType, considerWeather, optimizationFactor);
    
    // Generate waypoints along the route
    const waypoints = generateWaypoints(departureAirport, arrivalAirport);
    
    // Generate altitude profile
    const altitudeProfile = generateAltitudeProfile(distance, cruiseAltitude);
    
    // Simulate wind components
    const windComponent = generateWindComponents(optimizationFactor);
    
    // Determine weather impact
    const weatherImpact = determineWeatherImpact(considerWeather, distance, departureAirport, arrivalAirport);
    
    return {
      routeName: `${departureAirport.code} to ${arrivalAirport.code} Optimized`,
      fuelBurn,
      flightTime,
      distance,
      waypoints,
      weatherImpact,
      altitudeProfile,
      windComponent
    };
  } catch (error) {
    console.error('Error calculating optimized route:', error);
    return null;
  }
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(deg: number): number {
  return deg * (Math.PI/180);
}

/**
 * Get aircraft performance data
 */
function getAircraftPerformance(aircraftType: string): { cruiseSpeed: number, fuelConsumption: number, optimalAltitude: number } {
  // Sample aircraft performance data
  const performanceData: Record<string, { cruiseSpeed: number, fuelConsumption: number, optimalAltitude: number }> = {
    'Boeing 737-800': { cruiseSpeed: 840, fuelConsumption: 2.8, optimalAltitude: 35000 },
    'Airbus A320': { cruiseSpeed: 828, fuelConsumption: 2.6, optimalAltitude: 36000 },
    'Boeing 777-300': { cruiseSpeed: 905, fuelConsumption: 7.5, optimalAltitude: 37000 },
    'Airbus A350-900': { cruiseSpeed: 903, fuelConsumption: 5.9, optimalAltitude: 41000 },
    'Cessna 172': { cruiseSpeed: 226, fuelConsumption: 0.4, optimalAltitude: 12000 },
    'Cirrus SR22': { cruiseSpeed: 300, fuelConsumption: 0.6, optimalAltitude: 10000 },
    'Bombardier Challenger 350': { cruiseSpeed: 850, fuelConsumption: 1.9, optimalAltitude: 45000 },
    'Gulfstream G650': { cruiseSpeed: 956, fuelConsumption: 2.9, optimalAltitude: 51000 }
  };
  
  return performanceData[aircraftType] || { cruiseSpeed: 800, fuelConsumption: 3.0, optimalAltitude: 35000 };
}

/**
 * Calculate cruise altitude based on distance and aircraft type
 */
function calculateCruiseAltitude(distance: number, aircraftType: string): number {
  const aircraft = getAircraftPerformance(aircraftType);
  
  // For very short flights, lower cruise altitude
  if (distance < 300) {
    return aircraft.optimalAltitude * 0.6;
  }
  
  // For medium flights
  if (distance < 1000) {
    return aircraft.optimalAltitude * 0.8;
  }
  
  // For long flights
  return aircraft.optimalAltitude;
}

/**
 * Calculate fuel burn based on distance, aircraft type and efficiency setting
 */
function calculateFuelBurn(distance: number, aircraftType: string, fuelEfficiency: number, considerWeather: boolean): number {
  const aircraft = getAircraftPerformance(aircraftType);
  
  // Base fuel calculation
  let fuel = distance * aircraft.fuelConsumption / 100;
  
  // Apply efficiency factor (0-100%)
  fuel = fuel * (1 - (fuelEfficiency - 50) / 100);
  
  // Add weather factor if considered (5-15% increase)
  if (considerWeather) {
    const weatherFactor = 1 + (Math.random() * 0.1 + 0.05);
    fuel *= weatherFactor;
  }
  
  return Math.round(fuel);
}

/**
 * Calculate flight time based on distance, aircraft and optimization factors
 */
function calculateFlightTime(
  distance: number, 
  aircraftType: string, 
  considerWeather: boolean, 
  optimizationFactor: string
): number {
  const aircraft = getAircraftPerformance(aircraftType);
  
  // Base time calculation (in minutes)
  let flightTime = (distance / aircraft.cruiseSpeed) * 60;
  
  // Add time for takeoff, climb, descent, and landing (approximately 20-30 minutes)
  flightTime += 25;
  
  // Apply optimization factor
  switch (optimizationFactor) {
    case 'time':
      // Prioritize speed, reduce time by up to 8%
      flightTime *= 0.92 + (Math.random() * 0.08);
      break;
    case 'fuel':
      // Prioritize fuel, increase time by up to 12%
      flightTime *= 1.05 + (Math.random() * 0.07);
      break;
    case 'weather':
      // Weather avoidance may require longer routes
      if (considerWeather) {
        flightTime *= 1.03 + (Math.random() * 0.1);
      }
      break;
    case 'altitude':
      // Altitude optimization has minor impact on time
      flightTime *= 0.98 + (Math.random() * 0.05);
      break;
  }
  
  // Round to nearest minute
  return Math.round(flightTime);
}

/**
 * Generate waypoints along the route
 */
function generateWaypoints(departure: Airport, arrival: Airport): RouteWaypoint[] {
  const waypoints: RouteWaypoint[] = [
    {
      lat: departure.latitude,
      lon: departure.longitude,
      name: departure.code
    }
  ];
  
  // Calculate distance
  const distance = calculateDistance(
    departure.latitude, 
    departure.longitude, 
    arrival.latitude, 
    arrival.longitude
  );
  
  // For longer routes, add some waypoints along the great circle
  if (distance > 500) {
    const numWaypoints = Math.min(Math.floor(distance / 500), 5);
    
    for (let i = 1; i <= numWaypoints; i++) {
      const fraction = i / (numWaypoints + 1);
      
      // Simple linear interpolation for demo purposes
      // Real implementation would use great circle calculations
      const lat = departure.latitude + (arrival.latitude - departure.latitude) * fraction;
      const lon = departure.longitude + (arrival.longitude - departure.longitude) * fraction;
      
      waypoints.push({
        lat,
        lon,
        name: `WPT${i}`
      });
    }
  }
  
  waypoints.push({
    lat: arrival.latitude,
    lon: arrival.longitude,
    name: arrival.code
  });
  
  return waypoints;
}

/**
 * Generate altitude profile for the route
 */
function generateAltitudeProfile(distance: number, cruiseAltitude: number): AltitudePoint[] {
  const profile: AltitudePoint[] = [];
  
  // Start at ground level
  profile.push({ distance: 0, altitude: 0 });
  
  // Initial climb (approximately first 8% of the route)
  const climbDistance = Math.min(distance * 0.08, 100);
  profile.push({ distance: climbDistance, altitude: cruiseAltitude });
  
  // Cruise (until about 85% of the route)
  const descentStartDistance = distance * 0.85;
  profile.push({ distance: descentStartDistance, altitude: cruiseAltitude });
  
  // Descent to destination
  profile.push({ distance: distance, altitude: 0 });
  
  return profile;
}

/**
 * Generate wind components based on optimization factor
 */
function generateWindComponents(optimizationFactor: string): WindComponent {
  let tailwind = Math.round(Math.random() * 30);
  let headwind = Math.round(Math.random() * 20);
  let crosswind = Math.round(Math.random() * 15);
  
  // Adjust winds based on optimization factor
  if (optimizationFactor === 'weather') {
    // Better wind optimization
    tailwind = Math.round(tailwind * 1.2);
    headwind = Math.round(headwind * 0.8);
  }
  
  return { tailwind, headwind, crosswind };
}

/**
 * Determine weather impact for the route
 */
function determineWeatherImpact(
  considerWeather: boolean, 
  distance: number, 
  departure: Airport, 
  arrival: Airport
): 'low' | 'medium' | 'high' {
  if (!considerWeather) {
    return 'low';
  }
  
  // For demo purposes, randomize but weight by distance
  const randomFactor = Math.random();
  
  if (distance > 2000) {
    // Long flights have higher chance of encountering weather
    if (randomFactor < 0.4) return 'high';
    if (randomFactor < 0.7) return 'medium';
    return 'low';
  } else if (distance > 1000) {
    // Medium flights
    if (randomFactor < 0.25) return 'high';
    if (randomFactor < 0.6) return 'medium';
    return 'low';
  } else {
    // Short flights
    if (randomFactor < 0.15) return 'high';
    if (randomFactor < 0.4) return 'medium';
    return 'low';
  }
}