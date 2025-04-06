import { LiveFlight, Aircraft, WeatherData } from '@/types';

// Fetch flight data
export async function fetchFlights(filterType = 'all'): Promise<LiveFlight[]> {
  try {
    const response = await fetch(`/api/flights?type=${filterType}`);
    if (!response.ok) throw new Error('Failed to fetch flights');
    return await response.json();
  } catch (error) {
    console.error('Error fetching flights:', error);
    return [];
  }
}

// Fetch flight details
export async function fetchFlightDetails(flightId: string): Promise<LiveFlight | null> {
  try {
    const response = await fetch(`/api/flights/${flightId}`);
    if (!response.ok) throw new Error('Failed to fetch flight details');
    return await response.json();
  } catch (error) {
    console.error('Error fetching flight details:', error);
    return null;
  }
}

// Fetch aircraft information
export async function fetchAircraft(registration: string): Promise<Aircraft | null> {
  try {
    const response = await fetch(`/api/aircraft/${registration}`);
    if (!response.ok) throw new Error('Failed to fetch aircraft');
    return await response.json();
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return null;
  }
}

// Fetch weather information
export async function fetchWeather(location: string): Promise<WeatherData | null> {
  try {
    const response = await fetch(`/api/weather/${location}`);
    if (!response.ok) throw new Error('Failed to fetch weather');
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

// Search for flights, airports, and aircraft
export async function search(query: string, type?: string): Promise<any[]> {
  try {
    const url = type 
      ? `/api/search?query=${encodeURIComponent(query)}&type=${type}`
      : `/api/search?query=${encodeURIComponent(query)}`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  } catch (error) {
    console.error('Error performing search:', error);
    return [];
  }
}

// Create alert for a flight
export async function createAlert(userId: number, flightId: number, type: string, message?: string) {
  try {
    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        flightId,
        type,
        message,
        isRead: false
      }),
    });
    
    if (!response.ok) throw new Error('Failed to create alert');
    return await response.json();
  } catch (error) {
    console.error('Error creating alert:', error);
    return null;
  }
}
