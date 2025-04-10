// Flight and aircraft related types
export type LiveFlight = {
  id: string;
  callsign: string;
  flightNumber?: string;
  registration?: string;
  aircraftType?: string;
  airline?: {
    name: string;
    icao: string;
    iata?: string;
  };
  departure?: {
    icao: string;
    iata?: string;
    name?: string;
    time?: string;
  };
  arrival?: {
    icao: string;
    iata?: string;
    name?: string;
    time?: string;
  };
  position: {
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
    groundSpeed: number;
    verticalSpeed?: number;
    timestamp: string;
  };
  status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'diverted' | 'delayed';
  route?: string;
  progress?: number;
  squawk?: string;
};

export type Aircraft = {
  id: number;
  registration: string;
  type: string;
  serialNumber?: string;
  operator?: string;
  createdAt?: string;
  updatedAt?: string;
  details?: AircraftDetails;
};

export type AircraftDetails = {
  engines?: string;
  engineType?: string;
  firstFlight?: string;
  icaoType?: string;
  icaoClass?: string;
  range?: number;
  ceiling?: number;
};

// Airport related types
export type Airport = {
  id: number;
  name: string;
  code: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  size?: 'large' | 'medium' | 'small';
  type?: 'international' | 'domestic' | 'regional';
  createdAt?: string;
  updatedAt?: string;
};

// Map filter types
export type MapFilter = {
  type: 'all' | 'commercial' | 'private' | 'cargo';
  showWeather: boolean;
  showFlightPaths: boolean;
  showAirports: boolean;
  showLiveTracking: boolean; // Toggle to show/hide live flight data (aircraft icons)
  airline?: string;
  aircraft?: string;
  tailNumber?: string;
  purpose?: 'passenger' | 'freight' | 'military' | 'general' | 'all';
  sortBy?: 'airline' | 'altitude' | 'speed' | 'departure' | 'arrival' | 'time';
  sortOrder?: 'asc' | 'desc';
};

// Weather data types
export type WeatherData = {
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  current: {
    tempC: number;
    tempF: number;
    condition: string;
    windMph: number;
    windDir: string;
    pressureInHg: number;
    humidity: number;
    visibilityMiles: number;
    dewpointF: number;
    cloudCeiling?: string;
  };
  forecast?: {
    daily: Array<{
      date: string;
      tempMaxF: number;
      tempMinF: number;
      condition: string;
      precipChance: number;
    }>;
  };
};

// Analytics data types
export type FlightPerformanceMetrics = {
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
};

export type AirlinePerformanceMetrics = {
  airlineId: string;
  airlineName: string;
  avgFlightDelay: number;
  onTimePerformance: number;
  totalFlights: number;
  avgGroundSpeed: number;
  avgAltitude: number;
  cancelRate: number;
  diversionRate: number;
};

export type AirportPerformanceMetrics = {
  airportId: string;
  airportCode: string;
  avgDepartureDelay: number;
  avgArrivalDelay: number;
  congestionLevel: number;
  totalDepartures: number;
  totalArrivals: number;
  weatherImpactIndex: number;
};

// Route optimization types
export type RouteParams = {
  departureCode: string;
  arrivalCode: string;
  aircraftType: string;
  fuelEfficiency?: number;
  considerWeather?: boolean;
  optimizationFactor?: 'balanced' | 'fuel' | 'time' | 'altitude' | 'weather';
  plannedDate?: string;
};

export type RouteWaypoint = {
  lat: number;
  lon: number;
  name: string;
};

export type AltitudePoint = {
  distance: number;
  altitude: number;
};

export type WindComponent = {
  tailwind: number;
  headwind: number;
  crosswind: number;
};

export type OptimizedRoute = {
  routeName: string;
  fuelBurn: number;
  flightTime: number;
  distance: number;
  waypoints: RouteWaypoint[];
  weatherImpact: 'low' | 'medium' | 'high';
  altitudeProfile: AltitudePoint[];
  windComponent: WindComponent;
};