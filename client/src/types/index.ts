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