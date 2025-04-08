import { Airport } from '@shared/schema';
import { getRouteWeatherImpact } from './weather';
import axios from 'axios';

// Earth radius in nautical miles
const EARTH_RADIUS_NM = 3440.065;

/**
 * Calculate distance between two points on Earth using the Haversine formula
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in nautical miles
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = EARTH_RADIUS_NM * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate initial bearing (heading) from point 1 to point 2
 * @param lat1 Latitude of first point in degrees 
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Initial bearing in degrees (0-360)
 */
export function calculateBearing(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
          Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  
  // Normalize to 0-360
  bearing = (bearing + 360) % 360;
  
  return Math.round(bearing);
}

/**
 * Calculate estimated flight time between two points
 * @param distance Distance in nautical miles
 * @param groundSpeed Ground speed in knots
 * @returns Estimated flight time in minutes
 */
export function calculateFlightTime(distance: number, groundSpeed: number): number {
  return Math.round((distance / groundSpeed) * 60);
}

/**
 * Calculate estimated fuel consumption for a given aircraft type and distance
 * @param aircraftType Type of aircraft
 * @param distance Distance in nautical miles
 * @returns Estimated fuel consumption in gallons or pounds (depending on aircraft)
 */
export function calculateFuelConsumption(aircraftType: string, distance: number): number {
  // Simplified fuel burn rates in gallons per hour or pounds per hour
  // In a real-world scenario, this would be much more complex and data-driven
  const fuelBurnRates: Record<string, number> = {
    'C172': 8.5,     // Cessna 172: ~8.5 gal/hour
    'PA28': 10,      // Piper Cherokee: ~10 gal/hour
    'C208': 55,      // Cessna Caravan: ~55 gal/hour
    'B350': 100,     // King Air 350: ~100 gal/hour
    'PC12': 85,      // Pilatus PC-12: ~85 gal/hour
    'B737': 800,     // Boeing 737: ~800 gal/hour
    'A320': 750,     // Airbus A320: ~750 gal/hour
    'B777': 2200,    // Boeing 777: ~2200 gal/hour
    'B787': 1900,    // Boeing 787: ~1900 gal/hour
    'A350': 1800,    // Airbus A350: ~1800 gal/hour
  };
  
  // Default to a mid-size aircraft if type not found
  const hourlyBurn = fuelBurnRates[aircraftType] || 100;
  
  // Estimate cruise speed based on aircraft type
  let cruiseSpeed = 120; // Default cruise speed in knots
  
  if (aircraftType === 'C172' || aircraftType === 'PA28') {
    cruiseSpeed = 120; // Small GA aircraft
  } else if (aircraftType === 'C208' || aircraftType === 'PC12') {
    cruiseSpeed = 180; // Larger GA / small commercial
  } else if (aircraftType === 'B350') {
    cruiseSpeed = 300; // Turboprop
  } else if (['B737', 'A320'].includes(aircraftType)) {
    cruiseSpeed = 450; // Small airliners
  } else if (['B777', 'B787', 'A350'].includes(aircraftType)) {
    cruiseSpeed = 500; // Large airliners
  }
  
  // Calculate flight time in hours
  const flightTimeHours = distance / cruiseSpeed;
  
  // Calculate fuel consumption
  // This is a very simplified model - real models would account for:
  // - Climb/cruise/descent phases
  // - Altitude effects
  // - Weight
  // - Wind
  // - Reserves
  const fuelConsumption = hourlyBurn * flightTimeHours;
  
  return Math.round(fuelConsumption);
}

/**
 * Get estimated wind along a route
 * This is a placeholder for a more complex wind calculation
 */
export async function getRouteWind(
  departureAirport: string, 
  arrivalAirport: string,
  flightLevel: number
): Promise<{
  windDirection: number,
  windSpeed: number,
  headwind: number | null,
  tailwind: number | null,
  crosswind: number | null
}> {
  // In a production app, this would fetch actual wind data from a weather API
  // using the route coordinates and flight level
  
  // For now, return simulated data
  // We're generating semi-random but realistic wind data
  const windDirection = Math.floor(Math.random() * 360);
  const windSpeed = Math.floor(Math.random() * 30) + 5; // 5-35 knots
  
  // Calculate headwind/tailwind component based on route bearing
  // To do this properly, we'd need the departure and arrival coordinates
  return {
    windDirection,
    windSpeed,
    headwind: null, // Calculated when we have the route bearing
    tailwind: null,
    crosswind: null
  };
}

/**
 * Calculate the optimal route between two airports
 */
export async function calculateOptimalRoute(
  departureAirport: Airport, 
  arrivalAirport: Airport,
  aircraftType: string,
  flightLevel: number = 350 // Default to FL350 (35,000 ft)
): Promise<{
  directRoute: RouteOption,
  alternativeRoutes: RouteOption[],
  weatherImpact: any
}> {
  // Calculate direct route
  const distance = calculateDistance(
    departureAirport.latitude, 
    departureAirport.longitude, 
    arrivalAirport.latitude, 
    arrivalAirport.longitude
  );
  
  const bearing = calculateBearing(
    departureAirport.latitude, 
    departureAirport.longitude, 
    arrivalAirport.latitude, 
    arrivalAirport.longitude
  );
  
  // Get weather impact for the route
  const weatherImpact = await getRouteWeatherImpact(
    departureAirport.code, 
    arrivalAirport.code
  );
  
  // Get estimated wind data
  const windData = await getRouteWind(
    departureAirport.code, 
    arrivalAirport.code, 
    flightLevel
  );
  
  // Calculate headwind/tailwind component
  const windAngleRelativeToRoute = ((windData.windDirection - bearing + 180) % 360) - 180;
  const headwindComponent = Math.round(windData.windSpeed * Math.cos(windAngleRelativeToRoute * Math.PI / 180));
  
  // Apply headwind/tailwind to ground speed calculation
  // This is a simplified model - real calculations would be more complex
  let estimatedGroundSpeed = getEstimatedGroundSpeed(aircraftType, flightLevel);
  estimatedGroundSpeed -= headwindComponent; // Adjust for headwind/tailwind
  
  if (estimatedGroundSpeed < 100) estimatedGroundSpeed = 100; // Minimum reasonable ground speed
  
  // Calculate flight time based on distance and ground speed
  const flightTime = calculateFlightTime(distance, estimatedGroundSpeed);
  
  // Calculate fuel consumption
  const fuelConsumption = calculateFuelConsumption(aircraftType, distance);
  
  // Direct route
  const directRoute: RouteOption = {
    routeType: 'direct',
    distance,
    bearing,
    estimatedGroundSpeed,
    flightTime,
    fuelConsumption,
    waypoints: [
      {
        type: 'airport',
        code: departureAirport.code,
        name: departureAirport.name,
        latitude: departureAirport.latitude, 
        longitude: departureAirport.longitude
      },
      {
        type: 'airport',
        code: arrivalAirport.code,
        name: arrivalAirport.name,
        latitude: arrivalAirport.latitude, 
        longitude: arrivalAirport.longitude
      }
    ],
    weatherSeverity: weatherImpact.enroute.severity,
    windComponent: {
      direction: windData.windDirection,
      speed: windData.windSpeed,
      headwind: headwindComponent,
      crosswind: Math.round(windData.windSpeed * Math.sin(windAngleRelativeToRoute * Math.PI / 180))
    }
  };
  
  // For now, return only the direct route
  // In a full implementation, we would calculate alternative routes based on:
  // - Weather avoidance
  // - Wind optimization
  // - Airspace restrictions
  // - Standard departure/arrival procedures
  
  return {
    directRoute,
    alternativeRoutes: [], // Placeholder for alternative routes
    weatherImpact
  };
}

interface RouteOption {
  routeType: 'direct' | 'weather_optimized' | 'wind_optimized' | 'fuel_optimized';
  distance: number;
  bearing: number;
  estimatedGroundSpeed: number;
  flightTime: number;
  fuelConsumption: number;
  waypoints: RouteWaypoint[];
  weatherSeverity: 'none' | 'light' | 'moderate' | 'severe';
  windComponent: {
    direction: number;
    speed: number;
    headwind: number;
    crosswind: number;
  };
}

interface RouteWaypoint {
  type: 'airport' | 'navaid' | 'fix' | 'waypoint';
  code: string;
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Get estimated cruise ground speed for an aircraft type at a given flight level
 */
function getEstimatedGroundSpeed(aircraftType: string, flightLevel: number): number {
  // Simplified model - in reality, this would depend on many factors
  // including weight, temperature, engine performance, etc.
  
  // These are approximate true airspeeds, not ground speeds
  const cruiseSpeeds: Record<string, number> = {
    'C172': 120,     // Cessna 172
    'PA28': 135,     // Piper Cherokee
    'C208': 175,     // Cessna Caravan
    'B350': 300,     // King Air 350
    'PC12': 270,     // Pilatus PC-12
    'B737': 450,     // Boeing 737
    'A320': 450,     // Airbus A320
    'B777': 490,     // Boeing 777
    'B787': 490,     // Boeing 787
    'A350': 490,     // Airbus A350
  };
  
  // Get base cruise speed or default to 250 knots
  let speed = cruiseSpeeds[aircraftType] || 250;
  
  // Adjust for altitude
  // Many aircraft cruise faster at higher altitudes due to reduced air density
  // This is a simplified model
  if (flightLevel > 200) {
    // Increase speed by about 5% per 10,000ft above 20,000ft
    // Again, this is a simplification - reality is more complex
    const altitudeAdjustment = 1 + ((flightLevel - 200) / 200) * 0.05;
    speed *= altitudeAdjustment;
  }
  
  return Math.round(speed);
}

/**
 * Generate alternate route options based on weather and wind conditions
 * This is a placeholder for a more sophisticated routing algorithm
 */
export function generateAlternativeRoutes(
  departureAirport: Airport,
  arrivalAirport: Airport,
  directRoute: RouteOption,
  weatherImpact: any
): RouteOption[] {
  const alternativeRoutes: RouteOption[] = [];
  
  // If weather is significant, generate a weather-optimized route
  if (weatherImpact.enroute.severity === 'moderate' || weatherImpact.enroute.severity === 'severe') {
    // In a real implementation, this would use weather data to plot a route that avoids
    // severe weather areas. For now, we'll generate a simplified alternate route
    // that adds a waypoint to simulate deviating around weather
    
    // Create an intermediate point that's offset from the direct route
    // This simulates a deviation to avoid weather
    const midPoint = {
      latitude: (departureAirport.latitude + arrivalAirport.latitude) / 2,
      longitude: (departureAirport.longitude + arrivalAirport.longitude) / 2
    };
    
    // Offset the midpoint perpendicular to the route
    // This is a simplification - real weather avoidance would be more sophisticated
    const bearing = calculateBearing(
      departureAirport.latitude, 
      departureAirport.longitude, 
      arrivalAirport.latitude, 
      arrivalAirport.longitude
    );
    
    // Perpendicular to route (clockwise)
    const perpendicularBearing = (bearing + 90) % 360;
    
    // Calculate offset point (50nm deviation)
    const offsetDegrees = 50 / (EARTH_RADIUS_NM * Math.cos(midPoint.latitude * Math.PI / 180));
    const offsetLon = midPoint.longitude + offsetDegrees * Math.sin(perpendicularBearing * Math.PI / 180);
    const offsetLat = midPoint.latitude + offsetDegrees * Math.cos(perpendicularBearing * Math.PI / 180);
    
    const weatherAvoidanceWaypoint = {
      type: 'waypoint' as const,
      code: 'WXDEV',
      name: 'Weather Deviation',
      latitude: offsetLat,
      longitude: offsetLon
    };
    
    // Calculate distances for each leg
    const leg1Distance = calculateDistance(
      departureAirport.latitude,
      departureAirport.longitude,
      weatherAvoidanceWaypoint.latitude,
      weatherAvoidanceWaypoint.longitude
    );
    
    const leg2Distance = calculateDistance(
      weatherAvoidanceWaypoint.latitude,
      weatherAvoidanceWaypoint.longitude,
      arrivalAirport.latitude,
      arrivalAirport.longitude
    );
    
    // Total distance with deviation
    const totalDistance = leg1Distance + leg2Distance;
    
    // Create the weather-optimized route
    const weatherOptimizedRoute: RouteOption = {
      ...directRoute,
      routeType: 'weather_optimized',
      distance: totalDistance,
      flightTime: calculateFlightTime(totalDistance, directRoute.estimatedGroundSpeed),
      fuelConsumption: calculateFuelConsumption('B737', totalDistance), // Using a placeholder aircraft type
      waypoints: [
        {
          type: 'airport',
          code: departureAirport.code,
          name: departureAirport.name,
          latitude: departureAirport.latitude,
          longitude: departureAirport.longitude
        },
        weatherAvoidanceWaypoint,
        {
          type: 'airport',
          code: arrivalAirport.code,
          name: arrivalAirport.name,
          latitude: arrivalAirport.latitude,
          longitude: arrivalAirport.longitude
        }
      ],
      weatherSeverity: 'light' // With our deviation, we expect reduced severity
    };
    
    alternativeRoutes.push(weatherOptimizedRoute);
  }
  
  return alternativeRoutes;
}