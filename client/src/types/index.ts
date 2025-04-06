// Re-export types from shared schema
export type {
  User,
  Flight,
  Alert,
  Airport,
  Aircraft,
  LiveFlight,
  WeatherData,
  MapFilter,
  AircraftDetails,
  UserPreferences
} from '@shared/schema';

// Additional frontend-specific types can be added here
export type SortOption = 'updated' | 'airline' | 'flightNumber' | 'departure';

export type TabType = 'Live Map' | 'Flight Status' | 'Airports' | 'Routes' | 'Aircraft' | 'Statistics' | 'Weather';

export type SearchResult = {
  id: string | number;
  type: 'flight' | 'airport' | 'aircraft';
  name: string;
  details: string;
};
