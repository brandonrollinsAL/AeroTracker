import { storage } from '../storage';
import { LiveFlight } from '@shared/schema';

export interface FlightPerformanceMetrics {
  avgGroundSpeed: number;
  avgAltitude: number;
  avgVerticalSpeed: number;
  delayMinutes: number;
  efficiencyScore: number;
  fuelEfficiency: number;
  totalDistance: number;
  routeDeviation: number;  // percentage away from optimal path
  weatherImpact: number;   // severity score of weather impact
  onTimePerformance: number; // percentage of on-time arrivals
}

export interface AirlinePerformanceMetrics {
  airlineId: string;
  airlineName: string;
  avgFlightDelay: number;
  onTimePerformance: number;
  totalFlights: number;
  avgGroundSpeed: number;
  avgAltitude: number;
  cancelRate: number;
  diversionRate: number;
}

export interface AirportPerformanceMetrics {
  airportId: string;
  airportCode: string;
  avgDepartureDelay: number;
  avgArrivalDelay: number;
  congestionLevel: number;
  totalDepartures: number;
  totalArrivals: number;
  weatherImpactIndex: number;
}

/**
 * Calculate performance metrics for a specific flight
 */
export async function getFlightPerformanceMetrics(flightId: string): Promise<FlightPerformanceMetrics | null> {
  // Fetch flight data
  const flight = await storage.getCachedFlights().then(
    flights => flights.find(f => f.id === flightId)
  );
  
  if (!flight) {
    return null;
  }
  
  // Since we don't have historical data yet, we'll generate metrics based on current flight data
  // In a production environment, this would pull from historical data points
  
  // Calculate basic metrics from current flight data
  const groundSpeed = flight.position.groundSpeed || 0;
  const altitude = flight.position.altitude || 0;
  const verticalSpeed = flight.position.verticalSpeed || 0;
  
  // For simulation purposes, let's calculate other metrics based on current data
  const delayMinutes = Math.max(0, Math.floor(Math.random() * 60)); // Simulated delay for demo
  
  // Calculate efficiency score (higher is better)
  // Based on speed, altitude, and optimal cruise levels
  const expectedCruiseAlt = getOptimalCruiseAltitude(flight.aircraftType);
  const altitudeEfficiency = Math.max(0, 1 - Math.abs(altitude - expectedCruiseAlt) / expectedCruiseAlt);
  const speedEfficiency = groundSpeed > 0 ? Math.min(groundSpeed / getOptimalCruiseSpeed(flight.aircraftType), 1) : 0;
  
  const efficiencyScore = (altitudeEfficiency * 0.4 + speedEfficiency * 0.6) * 100;
  
  // Calculate estimated fuel efficiency (percentage of optimal)
  const fuelEfficiency = Math.max(60, Math.min(100, efficiencyScore * 0.9 + Math.random() * 10));
  
  // Estimate total flight distance (in nautical miles)
  const totalDistance = estimateFlightDistance(flight);
  
  // Route deviation from optimal path (percentage)
  const routeDeviation = Math.max(0, Math.min(20, Math.random() * 10));
  
  // Weather impact severity (0-10 scale)
  const weatherImpact = Math.min(10, Math.max(0, Math.random() * 5));
  
  // On-time performance (percentage of on-time operation for this flight/route)
  const onTimePerformance = Math.max(50, Math.min(100, 100 - delayMinutes * 1.5));
  
  return {
    avgGroundSpeed: groundSpeed,
    avgAltitude: altitude,
    avgVerticalSpeed: verticalSpeed,
    delayMinutes,
    efficiencyScore,
    fuelEfficiency,
    totalDistance,
    routeDeviation,
    weatherImpact,
    onTimePerformance
  };
}

/**
 * Get airline performance metrics
 */
export async function getAirlinePerformanceMetrics(airlineIcao?: string): Promise<AirlinePerformanceMetrics[]> {
  // Get all flights
  const flights = await storage.getCachedFlights();
  
  // Group flights by airline
  const airlineMap = new Map<string, LiveFlight[]>();
  
  flights.forEach(flight => {
    if (flight.airline?.icao) {
      const airlineId = flight.airline.icao;
      if (!airlineMap.has(airlineId)) {
        airlineMap.set(airlineId, []);
      }
      airlineMap.get(airlineId)?.push(flight);
    }
  });
  
  // Calculate metrics for each airline
  const metrics: AirlinePerformanceMetrics[] = [];
  
  // Convert Map entries to array to avoid TypeScript iterator issues
  for (const [airlineId, airlineFlights] of Array.from(airlineMap.entries())) {
    if (airlineIcao && airlineId !== airlineIcao) {
      continue; // Skip if filtering for a specific airline
    }
    
    // Skip if there are too few flights for reliable metrics
    if (airlineFlights.length < 1) {
      continue;
    }
    
    const airlineName = airlineFlights[0].airline?.name || airlineId;
    const totalFlights = airlineFlights.length;
    
    // Calculate delays
    const delayedFlights = airlineFlights.filter((f: LiveFlight) => f.status === 'delayed').length;
    const avgFlightDelay = Math.floor(Math.random() * 45); // Simulated for demo purposes
    
    // On-time performance
    const onTimePerformance = Math.floor((1 - (delayedFlights / totalFlights || 0)) * 100);
    
    // Average speed and altitude
    const avgGroundSpeed = calculateAverage(airlineFlights.map((f: LiveFlight) => f.position.groundSpeed));
    const avgAltitude = calculateAverage(airlineFlights.map((f: LiveFlight) => f.position.altitude));
    
    // Cancellation and diversion rates
    const cancelRate = airlineFlights.filter((f: LiveFlight) => f.status === 'cancelled').length / totalFlights || 0;
    const diversionRate = airlineFlights.filter((f: LiveFlight) => f.status === 'diverted').length / totalFlights || 0;
    
    metrics.push({
      airlineId,
      airlineName,
      avgFlightDelay,
      onTimePerformance,
      totalFlights,
      avgGroundSpeed,
      avgAltitude,
      cancelRate,
      diversionRate
    });
  }
  
  return metrics;
}

/**
 * Get airport performance metrics
 */
export async function getAirportPerformanceMetrics(airportCode?: string): Promise<AirportPerformanceMetrics[]> {
  // Get all flights and airports
  const flights = await storage.getCachedFlights();
  const airports = await storage.getAllAirports();
  
  // Group flights by departure/arrival airport
  const departureMap = new Map<string, LiveFlight[]>();
  const arrivalMap = new Map<string, LiveFlight[]>();
  
  flights.forEach(flight => {
    if (flight.departure?.icao) {
      const airportCode = flight.departure.icao;
      if (!departureMap.has(airportCode)) {
        departureMap.set(airportCode, []);
      }
      departureMap.get(airportCode)?.push(flight);
    }
    
    if (flight.arrival?.icao) {
      const airportCode = flight.arrival.icao;
      if (!arrivalMap.has(airportCode)) {
        arrivalMap.set(airportCode, []);
      }
      arrivalMap.get(airportCode)?.push(flight);
    }
  });
  
  // Calculate metrics for each airport
  const metrics: AirportPerformanceMetrics[] = [];
  
  // Process airports that have flight data
  const processedAirports = new Set<string>();
  
  // Process airports with departures
  for (const [airportCode, departingFlights] of Array.from(departureMap.entries())) {
    if (airportCode && (!airportCode || airportCode !== airportCode)) {
      continue; // Skip if filtering for a specific airport
    }
    
    processedAirports.add(airportCode);
    
    // Find corresponding arrivals
    const arrivingFlights = arrivalMap.get(airportCode) || [];
    
    // Skip if there are too few flights for reliable metrics
    if (departingFlights.length < 1 && arrivingFlights.length < 1) {
      continue;
    }
    
    // Calculate delays
    const avgDepartureDelay = Math.floor(Math.random() * 30); // Simulated delay for demo
    const avgArrivalDelay = Math.floor(Math.random() * 25); // Simulated delay for demo
    
    // Calculate congestion level (0-10 scale based on traffic volume)
    const totalTraffic = departingFlights.length + arrivingFlights.length;
    const congestionLevel = Math.min(10, Math.max(1, totalTraffic / 3));
    
    // Weather impact (0-10 scale)
    const weatherImpactIndex = Math.min(10, Math.floor(Math.random() * 7));
    
    metrics.push({
      airportId: airportCode,
      airportCode,
      avgDepartureDelay,
      avgArrivalDelay,
      congestionLevel,
      totalDepartures: departingFlights.length,
      totalArrivals: arrivingFlights.length,
      weatherImpactIndex
    });
  }
  
  // Process airports with arrivals but no departures
  for (const [airportCode, arrivingFlights] of Array.from(arrivalMap.entries())) {
    if (processedAirports.has(airportCode)) {
      continue; // Skip if already processed
    }
    
    if (airportCode && airportCode !== airportCode) {
      continue; // Skip if filtering for a specific airport
    }
    
    // Skip if there are too few flights for reliable metrics
    if (arrivingFlights.length < 1) {
      continue;
    }
    
    // Calculate delays
    const avgDepartureDelay = 0; // No departures
    const avgArrivalDelay = Math.floor(Math.random() * 25); // Simulated delay for demo
    
    // Calculate congestion level (0-10 scale based on traffic volume)
    const totalTraffic = arrivingFlights.length;
    const congestionLevel = Math.min(10, Math.max(1, totalTraffic / 2));
    
    // Weather impact (0-10 scale)
    const weatherImpactIndex = Math.min(10, Math.floor(Math.random() * 7));
    
    metrics.push({
      airportId: airportCode,
      airportCode,
      avgDepartureDelay,
      avgArrivalDelay,
      congestionLevel,
      totalDepartures: 0,
      totalArrivals: arrivingFlights.length,
      weatherImpactIndex
    });
  }
  
  return metrics;
}

/**
 * Get optimal cruise altitude based on aircraft type
 */
function getOptimalCruiseAltitude(aircraftType?: string): number {
  if (!aircraftType) return 35000; // Default for unknown aircraft
  
  // Optimize cruise altitude based on aircraft type
  switch (aircraftType.substring(0, 2)) {
    case 'B7': return 40000; // Boeing 787, 777, etc.
    case 'B7': return 37000; // Boeing 737, 747, etc.
    case 'A3': return 39000; // Airbus A330, A350, etc.
    case 'A3': return 36000; // Airbus A320 family
    case 'E1': 
    case 'E2': return 34000; // Embraer E-Jets
    case 'CR': 
    case 'CL': return 32000; // CRJ and Challenger family
    default: return 35000;
  }
}

/**
 * Get optimal cruise speed based on aircraft type
 */
function getOptimalCruiseSpeed(aircraftType?: string): number {
  if (!aircraftType) return 450; // Default for unknown aircraft
  
  // Optimize cruise speed based on aircraft type
  switch (aircraftType.substring(0, 2)) {
    case 'B7': return 520; // Boeing 787, 777, etc.
    case 'B7': return 480; // Boeing 737, 747, etc.
    case 'A3': return 510; // Airbus A330, A350, etc.
    case 'A3': return 470; // Airbus A320 family
    case 'E1': 
    case 'E2': return 450; // Embraer E-Jets
    case 'CR': 
    case 'CL': return 430; // CRJ and Challenger family
    default: return 450;
  }
}

/**
 * Estimate flight distance based on departure and arrival locations
 */
function estimateFlightDistance(flight: LiveFlight): number {
  // If we have departure and arrival coordinates, calculate great circle distance
  // For demo purposes, generate an estimate based on flight type
  
  if (!flight.aircraftType) {
    return 800; // Default distance
  }
  
  // Assign distances based on typical aircraft range
  switch (flight.aircraftType.substring(0, 2)) {
    case 'B7': return 4500; // Long-haul Boeing
    case 'B7': return 2200; // Medium-haul Boeing
    case 'A3': return 4200; // Long-haul Airbus
    case 'A3': return 1800; // Medium-haul Airbus
    case 'E1': 
    case 'E2': return 1200; // Regional jets
    case 'CR': 
    case 'CL': return 800;  // Regional jets
    default: return 1000;
  }
}

/**
 * Calculate average of a number array
 */
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const validNumbers = numbers.filter(n => !isNaN(n));
  if (validNumbers.length === 0) return 0;
  return validNumbers.reduce((sum, val) => sum + val, 0) / validNumbers.length;
}