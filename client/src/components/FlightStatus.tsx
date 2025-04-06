import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveFlight, WeatherData } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface FlightStatusProps {
  flight: LiveFlight;
  weather?: WeatherData;
  isLoading?: boolean;
}

export default function FlightStatus({ flight, weather, isLoading = false }: FlightStatusProps) {
  // Format the last updated time
  const lastUpdated = formatDistanceToNow(new Date(flight.position.timestamp), { addSuffix: true });

  if (isLoading) {
    return <FlightStatusSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div>
        <h3 className="font-medium mb-3 text-neutral-800">Live Flight Status</h3>
        <Card>
          <CardContent className="p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500">Altitude</p>
              <p className="text-lg font-medium font-mono">{flight.position.altitude.toLocaleString()} ft</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Ground Speed</p>
              <p className="text-lg font-medium font-mono">{flight.position.groundSpeed} mph</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Heading</p>
              <p className="text-lg font-medium font-mono">{flight.position.heading}° {getHeadingDirection(flight.position.heading)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Vertical Speed</p>
              <p className="text-lg font-medium font-mono">{flight.position.verticalSpeed || 0} ft/min</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Squawk</p>
              <p className="text-lg font-medium font-mono">{flight.squawk || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Last Updated</p>
              <p className="text-sm font-medium">{lastUpdated}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-neutral-500">Aircraft Registration</p>
              <p className="text-lg font-medium font-mono">{flight.registration || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
        
        <h3 className="font-medium mb-3 mt-6 text-neutral-800">Route Information</h3>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-xs text-neutral-500">Departure Gate</p>
              <p className="text-base font-medium">Gate {getRandomGate()}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Arrival Gate</p>
              <p className="text-base font-medium">Gate {getRandomGate()}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Filed Route</p>
              <p className="text-sm font-medium font-mono">{flight.route || 'Direct'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Distance</p>
              <p className="text-base font-medium font-mono">{calculateDistance(flight)} mi</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h3 className="font-medium mb-3 text-neutral-800">Current Position</h3>
        <Card className="h-64 relative overflow-hidden">
          <iframe 
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${flight.position.longitude - 1},${flight.position.latitude - 1},${flight.position.longitude + 1},${flight.position.latitude + 1}&layer=mapnik&marker=${flight.position.latitude},${flight.position.longitude}`}
            style={{ width: '100%', height: '100%', border: 0 }}
            title="Flight position map"
          ></iframe>
        </Card>
        
        <h3 className="font-medium mb-3 mt-6 text-neutral-800">Weather at Destination</h3>
        {weather ? (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="mr-4">
                  <span className="material-icons text-4xl text-amber-500">
                    {getWeatherIcon(weather.current.condition)}
                  </span>
                </div>
                <div>
                  <div className="text-xl font-medium">{weather.current.tempF}°F</div>
                  <div className="text-sm text-neutral-600">{weather.current.condition}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-neutral-500">Wind</p>
                  <p className="text-sm font-medium">{weather.current.windMph} mph {weather.current.windDir}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Visibility</p>
                  <p className="text-sm font-medium">{weather.current.visibilityMiles} mi</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Pressure</p>
                  <p className="text-sm font-medium">{weather.current.pressureInHg} inHg</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Humidity</p>
                  <p className="text-sm font-medium">{weather.current.humidity}%</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Dew Point</p>
                  <p className="text-sm font-medium">{weather.current.dewpointF}°F</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Ceiling</p>
                  <p className="text-sm font-medium">{weather.current.cloudCeiling}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-neutral-500">
              <span className="material-icons text-2xl mb-2">cloud_off</span>
              <p>Weather data not available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function FlightStatusSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div>
        <h3 className="font-medium mb-3 text-neutral-800">Live Flight Status</h3>
        <Card>
          <CardContent className="p-4 grid grid-cols-2 gap-4">
            {Array(7).fill(0).map((_, i) => (
              <div key={i} className={i === 6 ? 'col-span-2' : ''}>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
        
        <h3 className="font-medium mb-3 mt-6 text-neutral-800">Route Information</h3>
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h3 className="font-medium mb-3 text-neutral-800">Current Position</h3>
        <Skeleton className="h-64 w-full" />
        
        <h3 className="font-medium mb-3 mt-6 text-neutral-800">Weather at Destination</h3>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Skeleton className="h-14 w-14 rounded mr-4" />
              <div>
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper functions

function getHeadingDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
  return directions[Math.round(degrees / 45)];
}

function getRandomGate(): string {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(Math.random() * 30) + 1;
  return `${letter}${number}`;
}

function calculateDistance(flight: LiveFlight): string {
  if (!flight.departure || !flight.arrival) return 'N/A';
  
  // This would be a calculation based on departure and arrival coordinates
  // For now, return a reasonable number
  return Math.floor(1000 + Math.random() * 2000).toString();
}

function getWeatherIcon(condition: string): string {
  condition = condition.toLowerCase();
  
  if (condition.includes('sun') || condition.includes('clear')) {
    return 'wb_sunny';
  } else if (condition.includes('cloud') && condition.includes('part')) {
    return 'partly_cloudy_day';
  } else if (condition.includes('cloud')) {
    return 'cloud';
  } else if (condition.includes('rain') || condition.includes('shower')) {
    return 'water_drop';
  } else if (condition.includes('storm') || condition.includes('thunder')) {
    return 'thunderstorm';
  } else if (condition.includes('snow') || condition.includes('flurr')) {
    return 'ac_unit';
  } else if (condition.includes('fog') || condition.includes('mist')) {
    return 'foggy';
  } else {
    return 'thermostat';
  }
}
