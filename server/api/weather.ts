import axios from 'axios';
import { WeatherData, WeatherAlert, WeatherImpact } from '@shared/schema';

// Get API key from environment variables
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Flag to use mock data if API key is missing
const USE_MOCK_WEATHER = !WEATHER_API_KEY;

// Warn about missing API key on startup
if (USE_MOCK_WEATHER) {
  console.warn('\x1b[33m%s\x1b[0m', 
    'WARNING: WEATHER_API_KEY environment variable is not set. Using mock weather data. ' +
    'For real weather data, please set the WEATHER_API_KEY environment variable.'
  );
}

// Base URL for the weather API
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

/**
 * Fetch weather information for a given location (airport code or coordinates)
 */
export async function fetchWeather(location: string): Promise<WeatherData | undefined> {
  // If using mock data, return a hardcoded weather response
  if (USE_MOCK_WEATHER) {
    console.log(`Using mock weather data for location: ${location}`);
    return generateMockWeather(location);
  }
  
  try {
    // Get 3-day forecast with current conditions, alerts, and hourly data
    const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: location,
        days: 3,
        aqi: 'yes',
        alerts: 'yes'
      }
    });

    if (response.status !== 200) {
      throw new Error(`Weather API returned status ${response.status}`);
    }

    // Transform API response to our WeatherData format
    return transformWeatherData(response.data);
  } catch (error: any) {
    console.error('Error fetching weather data:', error);
    
    // If we got an API key error, inform about it but still provide mock data
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Invalid Weather API key. Please check your WEATHER_API_KEY environment variable');
      return generateMockWeather(location);
    }
    
    // Return undefined when there's an error
    return undefined;
  }
}

/**
 * Transform API response to our WeatherData format
 */
function transformWeatherData(apiData: any): WeatherData {
  const data: WeatherData = {
    location: {
      name: apiData.location.name,
      latitude: apiData.location.lat,
      longitude: apiData.location.lon
    },
    current: {
      tempC: apiData.current.temp_c,
      tempF: apiData.current.temp_f,
      condition: apiData.current.condition.text,
      conditionIcon: apiData.current.condition.icon,
      windMph: apiData.current.wind_mph,
      windDir: apiData.current.wind_dir,
      pressureInHg: apiData.current.pressure_in,
      humidity: apiData.current.humidity,
      visibilityMiles: apiData.current.vis_miles,
      dewpointF: apiData.current.dewpoint_f,
      cloudCeiling: determineCloudCeiling(apiData.current.cloud, apiData.current.vis_miles),
      isDay: apiData.current.is_day === 1,
      uv: apiData.current.uv,
      airQuality: apiData.current.air_quality ? {
        usEpaIndex: apiData.current.air_quality['us-epa-index'] || 0,
        pm2_5: apiData.current.air_quality.pm2_5 || 0
      } : undefined
    },
    forecast: {
      daily: apiData.forecast.forecastday.map((day: any) => ({
        date: day.date,
        tempMaxF: day.day.maxtemp_f,
        tempMinF: day.day.mintemp_f,
        condition: day.day.condition.text,
        conditionIcon: day.day.condition.icon,
        precipChance: day.day.daily_chance_of_rain,
        windMph: day.day.maxwind_mph,
        humidity: day.day.avghumidity,
        visibility: day.day.avgvis_miles,
        uvIndex: day.day.uv
      })),
      hourly: apiData.forecast.forecastday.flatMap((day: any) => 
        day.hour.filter((_: any, index: number) => index % 3 === 0) // Extract every 3rd hour to reduce data size
          .map((hour: any) => ({
            time: hour.time,
            tempF: hour.temp_f,
            condition: hour.condition.text,
            conditionIcon: hour.condition.icon,
            windMph: hour.wind_mph,
            windDir: hour.wind_dir,
            precipChance: hour.chance_of_rain,
            humidity: hour.humidity,
            cloudCover: hour.cloud,
            feelsLikeF: hour.feelslike_f,
            windGustMph: hour.gust_mph,
            visibilityMiles: hour.vis_miles
          }))
      )
    }
  };

  // Add weather alerts if available
  if (apiData.alerts && apiData.alerts.alert && apiData.alerts.alert.length > 0) {
    data.alerts = apiData.alerts.alert.map((alert: any): WeatherAlert => ({
      event: alert.event,
      severity: alert.severity,
      headline: alert.headline,
      description: alert.desc,
      effective: alert.effective,
      expires: alert.expires,
      instruction: alert.instruction || ''
    }));
  }

  // Calculate flight impact scores based on current and forecast conditions
  data.flightImpact = calculateFlightImpact(apiData);

  return data;
}

/**
 * Calculate the impact of weather conditions on flight operations
 */
function calculateFlightImpact(apiData: any): WeatherImpact {
  const current = apiData.current;
  
  // Scale factors (0-10, where 10 is highest impact)
  const windImpact = Math.min(10, current.wind_mph / 5);
  const visibilityImpact = 10 - Math.min(10, current.vis_miles * 2);
  
  let precipitationImpact = 0;
  const condition = current.condition.text.toLowerCase();
  if (condition.includes('thunderstorm') || condition.includes('thunder')) {
    precipitationImpact = 10;
  } else if (condition.includes('snow') || condition.includes('blizzard') || condition.includes('sleet')) {
    precipitationImpact = 8;
  } else if (condition.includes('rain') && (condition.includes('heavy') || condition.includes('torrential'))) {
    precipitationImpact = 7;
  } else if (condition.includes('rain')) {
    precipitationImpact = 4;
  } else if (condition.includes('drizzle') || condition.includes('mist')) {
    precipitationImpact = 2;
  }
  
  // Turbulence estimates based on wind and weather conditions
  const turbulenceImpact = Math.min(10, (windImpact * 0.7) + (precipitationImpact * 0.3));
  
  // Overall flight safety impact (weighted average)
  const overallImpact = Math.min(10, (
    (windImpact * 0.3) + 
    (visibilityImpact * 0.3) + 
    (precipitationImpact * 0.3) + 
    (turbulenceImpact * 0.1)
  ));
  
  // Aviation-specific impact classification
  let flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  if (current.vis_miles > 5 && !condition.includes('fog') && current.cloud < 50) {
    flightCategory = 'VFR'; // Visual Flight Rules
  } else if (current.vis_miles >= 3 && current.vis_miles <= 5) {
    flightCategory = 'MVFR'; // Marginal Visual Flight Rules
  } else if (current.vis_miles >= 1 && current.vis_miles < 3) {
    flightCategory = 'IFR'; // Instrument Flight Rules
  } else {
    flightCategory = 'LIFR'; // Low Instrument Flight Rules
  }
  
  return {
    windImpact: parseFloat(windImpact.toFixed(1)),
    visibilityImpact: parseFloat(visibilityImpact.toFixed(1)),
    precipitationImpact: parseFloat(precipitationImpact.toFixed(1)),
    turbulenceImpact: parseFloat(turbulenceImpact.toFixed(1)),
    overallImpact: parseFloat(overallImpact.toFixed(1)),
    flightCategory,
    recommendations: generateFlightRecommendations(overallImpact, flightCategory, condition)
  };
}

/**
 * Generate flight recommendations based on weather conditions
 */
function generateFlightRecommendations(
  overallImpact: number, 
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR', 
  condition: string
): string[] {
  const recommendations: string[] = [];
  
  if (overallImpact < 3) {
    recommendations.push("Excellent flying conditions with minimal weather impact.");
  } else if (overallImpact < 5) {
    recommendations.push("Good flying conditions with slight weather considerations.");
    
    if (flightCategory === 'MVFR') {
      recommendations.push("Marginal VFR conditions - maintain higher visibility awareness.");
    }
  } else if (overallImpact < 7) {
    recommendations.push("Moderate weather impact on flight operations.");
    
    if (flightCategory === 'IFR' || flightCategory === 'MVFR') {
      recommendations.push("IFR conditions likely - ensure proper IFR certification and equipment.");
    }
    
    if (condition.toLowerCase().includes('rain')) {
      recommendations.push("Precipitation may affect visibility during takeoff and landing.");
    }
  } else {
    recommendations.push("Significant weather impact - exercise extreme caution.");
    
    if (flightCategory === 'LIFR' || flightCategory === 'IFR') {
      recommendations.push("Low IFR conditions - consider delaying flight if not properly equipped.");
    }
    
    if (condition.toLowerCase().includes('thunderstorm') || condition.toLowerCase().includes('thunder')) {
      recommendations.push("Thunderstorms present - avoid flying through storm cells.");
    }
    
    if (condition.toLowerCase().includes('snow') || condition.toLowerCase().includes('ice')) {
      recommendations.push("Icing conditions possible - ensure aircraft is properly equipped for ice.");
    }
  }
  
  return recommendations;
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

/**
 * Generate mock weather data for development or when API key is missing
 */
function generateMockWeather(location: string): WeatherData {
  // Generate random coordinates near the provided location (if it's an airport code)
  // For simplicity, we'll generate US-based coordinates
  const latitude = 35 + (Math.random() * 10) - 5; // Roughly US centered latitude
  const longitude = -95 + (Math.random() * 20) - 10; // Roughly US centered longitude
  
  // Generate random temperature 50-85°F
  const tempF = Math.round(50 + (Math.random() * 35));
  const tempC = Math.round((tempF - 32) * 5 / 9);
  
  // Random weather conditions
  const conditions = [
    'Sunny', 'Partly cloudy', 'Cloudy', 'Overcast', 
    'Light rain', 'Moderate rain', 'Light snow', 'Fog', 'Clear'
  ];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  // Random wind 2-20 mph
  const windMph = Math.round(2 + (Math.random() * 18));
  
  // Wind directions
  const windDirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const windDir = windDirs[Math.floor(Math.random() * windDirs.length)];
  
  // Generate random visibility 3-10 miles
  const visibilityMiles = Math.round((3 + (Math.random() * 7)) * 10) / 10;
  
  // Generate random pressure 29.5-30.5 inHg
  const pressureInHg = Math.round((29.5 + (Math.random() * 1)) * 100) / 100;
  
  // Generate random humidity 30-90%
  const humidity = Math.round(30 + (Math.random() * 60));
  
  // Generate random dewpoint
  const dewpointF = Math.round((tempF - 20) + (Math.random() * 15));
  
  // Cloud cover 0-100%
  const cloudCover = Math.round(Math.random() * 100);
  
  // Generate hourly forecast data
  const hourlyData = [];
  const now = new Date();
  for (let i = 0; i < 24; i += 3) {
    const forecastHour = new Date(now);
    forecastHour.setHours(now.getHours() + i);
    
    // Vary temperature slightly for each hour
    const hourTempF = tempF + Math.round((Math.random() * 10) - 5);
    
    // Random conditions for each hour
    const hourCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    // Varying wind
    const hourWindMph = windMph + Math.round((Math.random() * 6) - 3);
    
    // Varying precipitation chance
    const precipChance = Math.round(Math.random() * 50);
    
    hourlyData.push({
      time: forecastHour.toISOString(),
      tempF: hourTempF,
      condition: hourCondition,
      conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', // Placeholder icon
      windMph: hourWindMph,
      windDir,
      precipChance,
      humidity,
      cloudCover,
      feelsLikeF: hourTempF - Math.round(Math.random() * 3),
      windGustMph: hourWindMph + Math.round(Math.random() * 8),
      visibilityMiles
    });
  }
  
  // Generate daily forecast data
  const dailyData = [];
  for (let i = 0; i < 3; i++) {
    const forecastDate = new Date(now);
    forecastDate.setDate(now.getDate() + i);
    
    // Vary max/min temps
    const dayTempMaxF = tempF + Math.round((Math.random() * 5));
    const dayTempMinF = tempF - Math.round((Math.random() * 8) + 5);
    
    // Daily condition
    const dayCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    dailyData.push({
      date: forecastDate.toISOString().split('T')[0],
      tempMaxF: dayTempMaxF,
      tempMinF: dayTempMinF,
      condition: dayCondition,
      conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', // Placeholder icon
      precipChance: Math.round(Math.random() * 50),
      windMph: windMph + Math.round((Math.random() * 6) - 3),
      humidity,
      visibility: visibilityMiles,
      uvIndex: Math.round(Math.random() * 11)
    });
  }
  
  // Create mock weather data object
  const mockWeatherData: WeatherData = {
    location: {
      name: location.toUpperCase(),
      latitude,
      longitude
    },
    current: {
      tempC,
      tempF,
      condition,
      conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', // Placeholder icon
      windMph,
      windDir,
      pressureInHg,
      humidity,
      visibilityMiles,
      dewpointF,
      cloudCeiling: determineCloudCeiling(cloudCover, visibilityMiles),
      isDay: true,
      uv: Math.round(Math.random() * 11),
      airQuality: {
        usEpaIndex: Math.floor(Math.random() * 5) + 1,
        pm2_5: Math.round(Math.random() * 50)
      }
    },
    forecast: {
      daily: dailyData,
      hourly: hourlyData
    }
  };
  
  // Calculate and add flight impact data
  const mockApiData = {
    current: {
      temp_c: tempC,
      temp_f: tempF,
      condition: { text: condition },
      wind_mph: windMph,
      wind_dir: windDir,
      pressure_in: pressureInHg,
      humidity,
      vis_miles: visibilityMiles,
      dewpoint_f: dewpointF,
      cloud: cloudCover,
      is_day: 1,
      uv: mockWeatherData.current.uv,
      air_quality: {
        'us-epa-index': mockWeatherData.current.airQuality?.usEpaIndex,
        pm2_5: mockWeatherData.current.airQuality?.pm2_5
      }
    }
  };
  
  mockWeatherData.flightImpact = calculateFlightImpact(mockApiData);
  
  return mockWeatherData;
}

export async function getRouteWeatherImpact(departureAirport: string, arrivalAirport: string): Promise<{
  departure: WeatherImpact | null,
  arrival: WeatherImpact | null,
  enroute: {
    severity: 'none' | 'light' | 'moderate' | 'severe',
    details: string[]
  }
}> {
  // Get weather data for both airports
  const departureWeather = await fetchWeather(departureAirport);
  const arrivalWeather = await fetchWeather(arrivalAirport);
  
  // Prepare result object
  const result = {
    departure: departureWeather?.flightImpact || null,
    arrival: arrivalWeather?.flightImpact || null,
    enroute: {
      severity: 'none' as 'none' | 'light' | 'moderate' | 'severe',
      details: [] as string[]
    }
  };
  
  // Calculate enroute severity based on both departure and arrival conditions
  if (departureWeather?.flightImpact && arrivalWeather?.flightImpact) {
    const maxImpact = Math.max(
      departureWeather.flightImpact.overallImpact,
      arrivalWeather.flightImpact.overallImpact
    );
    
    if (maxImpact >= 7) {
      result.enroute.severity = 'severe';
      result.enroute.details.push("Severe weather conditions affecting the route");
    } else if (maxImpact >= 5) {
      result.enroute.severity = 'moderate';
      result.enroute.details.push("Moderate weather impacts along the route");
    } else if (maxImpact >= 3) {
      result.enroute.severity = 'light';
      result.enroute.details.push("Light weather impacts along the route");
    }
    
    // Add specific impact details
    if (departureWeather.flightImpact.flightCategory !== 'VFR' || arrivalWeather.flightImpact.flightCategory !== 'VFR') {
      result.enroute.details.push(`Non-VFR conditions at ${departureWeather.flightImpact.flightCategory !== 'VFR' ? 'departure' : 'arrival'}`);
    }
    
    if (departureWeather.flightImpact.precipitationImpact > 5 || arrivalWeather.flightImpact.precipitationImpact > 5) {
      result.enroute.details.push("Significant precipitation along the route");
    }
    
    if (departureWeather.flightImpact.turbulenceImpact > 5 || arrivalWeather.flightImpact.turbulenceImpact > 5) {
      result.enroute.details.push("Potential turbulence conditions");
    }
  }
  
  return result;
}
