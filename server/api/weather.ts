import axios from 'axios';
import { WeatherData } from '@shared/schema';

// Get API key from environment variables
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'demo_key';

// Base URL for the weather API
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

/**
 * Fetch weather information for a given location (airport code or coordinates)
 */
export async function fetchWeather(location: string): Promise<WeatherData | undefined> {
  try {
    const response = await axios.get(`${WEATHER_API_BASE_URL}/current.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: location,
        aqi: 'no'
      }
    });

    if (response.status !== 200) {
      throw new Error(`Weather API returned status ${response.status}`);
    }

    // Transform API response to our WeatherData format
    return transformWeatherData(response.data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // @ts-ignore - This is a valid case where we want to return undefined
    return undefined;
  }
}

/**
 * Transform API response to our WeatherData format
 */
function transformWeatherData(apiData: any): WeatherData {
  return {
    location: {
      name: apiData.location.name,
      latitude: apiData.location.lat,
      longitude: apiData.location.lon
    },
    current: {
      tempC: apiData.current.temp_c,
      tempF: apiData.current.temp_f,
      condition: apiData.current.condition.text,
      windMph: apiData.current.wind_mph,
      windDir: apiData.current.wind_dir,
      pressureInHg: apiData.current.pressure_in,
      humidity: apiData.current.humidity,
      visibilityMiles: apiData.current.vis_miles,
      dewpointF: apiData.current.dewpoint_f,
      cloudCeiling: determineCloudCeiling(apiData.current.cloud, apiData.current.vis_miles)
    }
  };
}

/**
 * Determine cloud ceiling based on cloud cover and visibility
 */
function determineCloudCeiling(cloudCover: number, visibility: number): string {
  if (cloudCover <= 10) {
    return 'Unlimited';
  } else if (cloudCover <= 30) {
    return 'High';
  } else if (cloudCover <= 70) {
    return 'Medium';
  } else if (visibility < 3) {
    return 'Low';
  } else {
    return 'Variable';
  }
}
