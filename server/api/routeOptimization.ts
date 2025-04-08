import { Airport } from '@shared/schema';
import { getRouteWeatherImpact } from './weather';
import axios from 'axios';

// Earth radius in nautical miles
const EARTH_RADIUS_NM = 3440.065;

// Waypoint types for route planning
export type WaypointType = 'airport' | 'navaid' | 'fix' | 'waypoint' | 'terrain_avoid' | 'airspace_avoid';

// Performance profiles for different aircraft by type
// These are simplified profiles for demonstration purposes
// In a real application, these would be much more detailed and accurate
interface AircraftPerformanceProfile {
  cruiseSpeed: number;           // knots true airspeed
  fuelBurnRate: number;          // gallons per hour or pounds per hour
  optimalAltitude: number;       // feet
  maxAltitude: number;           // feet
  climbRate: number;             // feet per minute
  descentRate: number;           // feet per minute
  takeoffFuel: number;           // gallons
  climbFuelFactor: number;       // multiplier for cruise fuel burn
  descentFuelFactor: number;     // multiplier for cruise fuel burn
  reserveFuel: number;           // gallons or pounds
  rangeNM: number;               // nautical miles
  serviceCeiling: number;        // feet
  altitudeCapabilities: {
    min: number;                 // minimum altitude in feet
    max: number;                 // maximum altitude in feet
    optimal: number;             // optimal altitude in feet
  };
  speedProfile: {
    climbSpeed: number;          // knots indicated airspeed
    cruiseSpeed: number;         // knots true airspeed
    descentSpeed: number;        // knots indicated airspeed
  };
}

// Expanded aircraft performance profiles
const AIRCRAFT_PERFORMANCE_PROFILES: Record<string, AircraftPerformanceProfile> = {
  'C172': {
    cruiseSpeed: 120,
    fuelBurnRate: 8.5,
    optimalAltitude: 8000,
    maxAltitude: 14000,
    climbRate: 700,
    descentRate: 500,
    takeoffFuel: 1.5,
    climbFuelFactor: 1.3,
    descentFuelFactor: 0.7,
    reserveFuel: 5,
    rangeNM: 640,
    serviceCeiling: 14000,
    altitudeCapabilities: {
      min: 0,
      max: 14000,
      optimal: 8000
    },
    speedProfile: {
      climbSpeed: 75,
      cruiseSpeed: 120,
      descentSpeed: 90
    }
  },
  'PA28': {
    cruiseSpeed: 135,
    fuelBurnRate: 10,
    optimalAltitude: 8000,
    maxAltitude: 14000,
    climbRate: 750,
    descentRate: 500,
    takeoffFuel: 1.5,
    climbFuelFactor: 1.3,
    descentFuelFactor: 0.7,
    reserveFuel: 6,
    rangeNM: 720,
    serviceCeiling: 14000,
    altitudeCapabilities: {
      min: 0,
      max: 14000,
      optimal: 8000
    },
    speedProfile: {
      climbSpeed: 80,
      cruiseSpeed: 135,
      descentSpeed: 100
    }
  },
  'C208': {
    cruiseSpeed: 175,
    fuelBurnRate: 55,
    optimalAltitude: 10000,
    maxAltitude: 25000,
    climbRate: 1000,
    descentRate: 800,
    takeoffFuel: 5,
    climbFuelFactor: 1.4,
    descentFuelFactor: 0.6,
    reserveFuel: 30,
    rangeNM: 1100,
    serviceCeiling: 25000,
    altitudeCapabilities: {
      min: 0,
      max: 25000,
      optimal: 12000
    },
    speedProfile: {
      climbSpeed: 120,
      cruiseSpeed: 175,
      descentSpeed: 140
    }
  },
  'PC12': {
    cruiseSpeed: 270,
    fuelBurnRate: 85,
    optimalAltitude: 28000,
    maxAltitude: 30000,
    climbRate: 1800,
    descentRate: 1500,
    takeoffFuel: 8,
    climbFuelFactor: 1.5,
    descentFuelFactor: 0.6,
    reserveFuel: 45,
    rangeNM: 1845,
    serviceCeiling: 30000,
    altitudeCapabilities: {
      min: 0,
      max: 30000,
      optimal: 28000
    },
    speedProfile: {
      climbSpeed: 170,
      cruiseSpeed: 270,
      descentSpeed: 220
    }
  },
  'B350': {
    cruiseSpeed: 300,
    fuelBurnRate: 100,
    optimalAltitude: 28000,
    maxAltitude: 35000,
    climbRate: 2200,
    descentRate: 1800,
    takeoffFuel: 10,
    climbFuelFactor: 1.4,
    descentFuelFactor: 0.5,
    reserveFuel: 55,
    rangeNM: 1800,
    serviceCeiling: 35000,
    altitudeCapabilities: {
      min: 0,
      max: 35000,
      optimal: 28000
    },
    speedProfile: {
      climbSpeed: 180,
      cruiseSpeed: 300,
      descentSpeed: 250
    }
  },
  'B737': {
    cruiseSpeed: 450,
    fuelBurnRate: 800,
    optimalAltitude: 35000,
    maxAltitude: 41000,
    climbRate: 2500,
    descentRate: 2000,
    takeoffFuel: 400,
    climbFuelFactor: 1.5,
    descentFuelFactor: 0.4,
    reserveFuel: 3000,
    rangeNM: 3000,
    serviceCeiling: 41000,
    altitudeCapabilities: {
      min: 0,
      max: 41000,
      optimal: 35000
    },
    speedProfile: {
      climbSpeed: 280,
      cruiseSpeed: 450,
      descentSpeed: 300
    }
  },
  'A320': {
    cruiseSpeed: 450,
    fuelBurnRate: 750,
    optimalAltitude: 36000,
    maxAltitude: 39000,
    climbRate: 2500,
    descentRate: 2000,
    takeoffFuel: 380,
    climbFuelFactor: 1.5,
    descentFuelFactor: 0.4,
    reserveFuel: 2800,
    rangeNM: 3300,
    serviceCeiling: 39000,
    altitudeCapabilities: {
      min: 0,
      max: 39000, 
      optimal: 36000
    },
    speedProfile: {
      climbSpeed: 280,
      cruiseSpeed: 450,
      descentSpeed: 300
    }
  },
  'B777': {
    cruiseSpeed: 490,
    fuelBurnRate: 2200,
    optimalAltitude: 35000,
    maxAltitude: 43000,
    climbRate: 2200,
    descentRate: 1800,
    takeoffFuel: 1500,
    climbFuelFactor: 1.6,
    descentFuelFactor: 0.3,
    reserveFuel: 8000,
    rangeNM: 8500,
    serviceCeiling: 43000,
    altitudeCapabilities: {
      min: 0,
      max: 43000,
      optimal: 35000
    },
    speedProfile: {
      climbSpeed: 300,
      cruiseSpeed: 490,
      descentSpeed: 320
    }
  },
  'B787': {
    cruiseSpeed: 490,
    fuelBurnRate: 1900,
    optimalAltitude: 38000,
    maxAltitude: 43000,
    climbRate: 2500,
    descentRate: 2000,
    takeoffFuel: 1200,
    climbFuelFactor: 1.6,
    descentFuelFactor: 0.3,
    reserveFuel: 7000,
    rangeNM: 9000,
    serviceCeiling: 43000,
    altitudeCapabilities: {
      min: 0,
      max: 43000,
      optimal: 38000
    },
    speedProfile: {
      climbSpeed: 300,
      cruiseSpeed: 490,
      descentSpeed: 320
    }
  },
  'A350': {
    cruiseSpeed: 490,
    fuelBurnRate: 1800,
    optimalAltitude: 39000,
    maxAltitude: 43000,
    climbRate: 2500,
    descentRate: 2000,
    takeoffFuel: 1100,
    climbFuelFactor: 1.5,
    descentFuelFactor: 0.3,
    reserveFuel: 6500,
    rangeNM: 9700,
    serviceCeiling: 43000,
    altitudeCapabilities: {
      min: 0,
      max: 43000,
      optimal: 39000
    },
    speedProfile: {
      climbSpeed: 300,
      cruiseSpeed: 490,
      descentSpeed: 320
    }
  }
};

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
 * Calculate a point along a great circle route at a certain distance and bearing
 * @param lat1 Starting latitude in degrees
 * @param lon1 Starting longitude in degrees
 * @param distance Distance in nautical miles
 * @param bearing Bearing in degrees
 * @returns New coordinates [latitude, longitude] in degrees
 */
export function calculatePointAtDistance(
  lat1: number, 
  lon1: number, 
  distance: number, 
  bearing: number
): [number, number] {
  const lat1Rad = lat1 * Math.PI / 180;
  const lon1Rad = lon1 * Math.PI / 180;
  const bearingRad = bearing * Math.PI / 180;
  
  // Convert distance to angular distance in radians
  const angularDistance = distance / EARTH_RADIUS_NM;
  
  // Calculate new latitude
  const lat2Rad = Math.asin(
    Math.sin(lat1Rad) * Math.cos(angularDistance) + 
    Math.cos(lat1Rad) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );
  
  // Calculate new longitude
  const lon2Rad = lon1Rad + Math.atan2(
    Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1Rad),
    Math.cos(angularDistance) - Math.sin(lat1Rad) * Math.sin(lat2Rad)
  );
  
  // Convert back to degrees
  const lat2 = lat2Rad * 180 / Math.PI;
  const lon2 = lon2Rad * 180 / Math.PI;
  
  return [lat2, lon2];
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
  // Get aircraft profile for detailed fuel calculations
  const aircraftProfile = AIRCRAFT_PERFORMANCE_PROFILES[aircraftType] || AIRCRAFT_PERFORMANCE_PROFILES['B737'];
  
  // Estimate cruise speed
  const cruiseSpeed = aircraftProfile.cruiseSpeed;
  
  // Calculate flight time in hours
  const flightTimeHours = distance / cruiseSpeed;
  
  // Calculate fuel consumption
  const fuelConsumption = aircraftProfile.fuelBurnRate * flightTimeHours;
  
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
  
  // Get the aircraft performance profile
  const aircraftProfile = AIRCRAFT_PERFORMANCE_PROFILES[aircraftType] || AIRCRAFT_PERFORMANCE_PROFILES['B737'];
  
  // Check if requested flight level exceeds aircraft ceiling
  const adjustedFlightLevel = Math.min(flightLevel, Math.floor(aircraftProfile.serviceCeiling / 100));
  
  // Calculate time for climb and descent phases
  const climbTimeMinutes = adjustedFlightLevel * 100 / aircraftProfile.climbRate;
  const descentTimeMinutes = adjustedFlightLevel * 100 / aircraftProfile.descentRate;
  
  // Estimate distance covered during climb and descent
  // Using simplified formula: distance = (rate of climb/descent * time) / 60
  const climbSpeedKnots = aircraftProfile.speedProfile.climbSpeed;
  const descentSpeedKnots = aircraftProfile.speedProfile.descentSpeed;
  
  const climbDistanceNM = (climbSpeedKnots * climbTimeMinutes) / 60;
  const descentDistanceNM = (descentSpeedKnots * descentTimeMinutes) / 60;
  
  // Calculate cruise distance
  const cruiseDistanceNM = Math.max(0, distance - climbDistanceNM - descentDistanceNM);
  
  // Calculate cruise time
  const cruiseTimeMinutes = (cruiseDistanceNM / estimatedGroundSpeed) * 60;
  
  // Calculate total flight time considering climb, cruise, and descent
  const totalFlightTimeMinutes = climbTimeMinutes + cruiseTimeMinutes + descentTimeMinutes;
  
  // Calculate detailed fuel consumption
  const climbFuel = (climbTimeMinutes / 60) * aircraftProfile.fuelBurnRate * aircraftProfile.climbFuelFactor;
  const cruiseFuel = (cruiseTimeMinutes / 60) * aircraftProfile.fuelBurnRate;
  const descentFuel = (descentTimeMinutes / 60) * aircraftProfile.fuelBurnRate * aircraftProfile.descentFuelFactor;
  const totalFuel = aircraftProfile.takeoffFuel + climbFuel + cruiseFuel + descentFuel + aircraftProfile.reserveFuel;
  
  // Create top-of-climb and top-of-descent waypoints
  // For simplicity, we'll place them proportionally along the direct route
  const fractionToTOC = climbDistanceNM / distance;
  const fractionToTOD = (distance - descentDistanceNM) / distance;
  
  const tocLat = departureAirport.latitude + fractionToTOC * (arrivalAirport.latitude - departureAirport.latitude);
  const tocLon = departureAirport.longitude + fractionToTOC * (arrivalAirport.longitude - departureAirport.longitude);
  
  const todLat = departureAirport.latitude + fractionToTOD * (arrivalAirport.latitude - departureAirport.latitude);
  const todLon = departureAirport.longitude + fractionToTOD * (arrivalAirport.longitude - departureAirport.longitude);
  
  // Create wind component data
  const crosswindComponent = Math.round(windData.windSpeed * Math.sin(windAngleRelativeToRoute * Math.PI / 180));
  
  // Create phases of flight with altitudes and times
  const flightPhases = [
    {
      phase: 'Departure',
      altitude: 0,
      estimatedTime: 0,
      fuelUsed: aircraftProfile.takeoffFuel
    },
    {
      phase: 'Climb',
      altitude: adjustedFlightLevel * 100,
      estimatedTime: Math.round(climbTimeMinutes),
      fuelUsed: Math.round(climbFuel)
    },
    {
      phase: 'Cruise',
      altitude: adjustedFlightLevel * 100,
      estimatedTime: Math.round(cruiseTimeMinutes),
      fuelUsed: Math.round(cruiseFuel)
    },
    {
      phase: 'Descent',
      altitude: 0,
      estimatedTime: Math.round(descentTimeMinutes),
      fuelUsed: Math.round(descentFuel)
    },
    {
      phase: 'Arrival',
      altitude: 0,
      estimatedTime: 0,
      fuelUsed: 0
    }
  ];
  
  // Approximate Mach number based on aircraft type and altitude
  const machs: Record<string, number> = {
    'C172': 0.2,
    'PA28': 0.22,
    'C208': 0.35,
    'PC12': 0.5,
    'B350': 0.58,
    'B737': 0.78,
    'A320': 0.78,
    'B777': 0.84,
    'B787': 0.85,
    'A350': 0.85
  };
  const approxMach = machs[aircraftType] || 0.78;
  
  // Direct route
  const directRoute: RouteOption = {
    routeType: 'direct',
    distance,
    bearing,
    estimatedGroundSpeed,
    flightTime: Math.round(totalFlightTimeMinutes),
    fuelConsumption: Math.round(totalFuel),
    waypoints: [
      {
        type: 'airport',
        code: departureAirport.code,
        name: departureAirport.name,
        latitude: departureAirport.latitude, 
        longitude: departureAirport.longitude
      },
      {
        type: 'waypoint',
        code: 'TOC',
        name: 'Top of Climb',
        latitude: tocLat, 
        longitude: tocLon
      },
      {
        type: 'waypoint',
        code: 'TOD',
        name: 'Top of Descent',
        latitude: todLat, 
        longitude: todLon
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
      crosswind: crosswindComponent
    },
    flightProfile: {
      aircraft: {
        type: aircraftType,
        cruiseAltitude: adjustedFlightLevel * 100,
        optimalAltitude: aircraftProfile.optimalAltitude,
        mach: approxMach
      },
      phases: flightPhases,
      fuelBreakdown: {
        takeoff: Math.round(aircraftProfile.takeoffFuel),
        climb: Math.round(climbFuel),
        cruise: Math.round(cruiseFuel),
        descent: Math.round(descentFuel),
        reserve: Math.round(aircraftProfile.reserveFuel),
        total: Math.round(totalFuel)
      },
      timeBreakdown: {
        climb: Math.round(climbTimeMinutes),
        cruise: Math.round(cruiseTimeMinutes),
        descent: Math.round(descentTimeMinutes),
        total: Math.round(totalFlightTimeMinutes)
      }
    }
  };
  
  // Generate alternative routes
  const alternativeRoutes: RouteOption[] = [];
  
  // Generate alternative routes using our new generateAlternativeRoutes function
  const weatherBasedRoutes = generateAlternativeRoutes(
    departureAirport,
    arrivalAirport,
    directRoute,
    weatherImpact
  );
  
  // Add weather-based routes to our alternatives
  alternativeRoutes.push(...weatherBasedRoutes);
  
  return {
    directRoute,
    alternativeRoutes,
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
  flightProfile?: {
    aircraft: {
      type: string;
      cruiseAltitude: number;
      optimalAltitude: number;
      mach: number;
    };
    phases: {
      phase: string;
      altitude: number;
      estimatedTime: number;
      fuelUsed: number;
    }[];
    fuelBreakdown: {
      takeoff: number;
      climb: number;
      cruise: number;
      descent: number;
      reserve: number;
      total: number;
    };
    timeBreakdown: {
      climb: number;
      cruise: number;
      descent: number;
      total: number;
    };
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
  // Get aircraft profile for detailed calculations
  const aircraftProfile = AIRCRAFT_PERFORMANCE_PROFILES[aircraftType] || AIRCRAFT_PERFORMANCE_PROFILES['B737'];
  
  // Get base cruise speed
  let speed = aircraftProfile.cruiseSpeed;
  
  // Adjust for altitude
  // Many aircraft cruise faster at higher altitudes due to reduced air density
  if (flightLevel > 200) {
    // Increase speed by about 5% per 10,000ft above 20,000ft
    const altitudeAdjustment = 1 + ((flightLevel - 200) / 200) * 0.05;
    speed *= altitudeAdjustment;
  }
  
  return Math.round(speed);
}

/**
 * Generate alternative routes based on weather conditions
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
    // For backward compatibility, we'll generate a simplified alternate route
    // that adds a waypoint to simulate deviating around weather
    
    // Create an intermediate point that's offset from the direct route
    const midPoint = {
      latitude: (departureAirport.latitude + arrivalAirport.latitude) / 2,
      longitude: (departureAirport.longitude + arrivalAirport.longitude) / 2
    };
    
    // Calculate bearing and perpendicular direction
    const bearing = calculateBearing(
      departureAirport.latitude, 
      departureAirport.longitude, 
      arrivalAirport.latitude, 
      arrivalAirport.longitude
    );
    const perpendicularBearing = (bearing + 90) % 360;
    
    // Calculate offset point (40-70nm deviation based on severity)
    const deviationDistance = weatherImpact.enroute.severity === 'severe' ? 70 : 40;
    const offsetDegrees = deviationDistance / (EARTH_RADIUS_NM * Math.cos(midPoint.latitude * Math.PI / 180));
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
      fuelConsumption: calculateFuelConsumption(directRoute.flightProfile?.aircraft.type || 'B737', totalDistance),
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