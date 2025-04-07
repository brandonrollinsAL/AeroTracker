import { useState, useEffect } from 'react';
import { fetchFlightPerformanceMetrics } from '@/lib/api';
import { FlightPerformanceMetrics } from '@/types';
// We're not using the chart components for this initial implementation
import { 
  Activity, 
  TrendingUp, 
  Timer, 
  Droplets,
  Gauge, 
  BarChart3, 
  CloudLightning,
  Route 
} from 'lucide-react';

interface FlightAnalyticsProps {
  flightId: string;
  className?: string;
}

export default function FlightAnalytics({ flightId, className = '' }: FlightAnalyticsProps) {
  const [metrics, setMetrics] = useState<FlightPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchFlightPerformanceMetrics(flightId);
        setMetrics(data);
      } catch (err) {
        setError('Failed to load flight metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (flightId) {
      loadMetrics();
    }
  }, [flightId]);

  if (loading) {
    return (
      <div className={`${className} aviation-panel p-4 h-full flex items-center justify-center`}>
        <div className="aviation-loader"></div>
        <span className="ml-3 text-sm text-aviation-blue">Loading flight analytics...</span>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className={`${className} aviation-panel p-4 h-full flex flex-col items-center justify-center`}>
        <div className="text-aviation-alert mb-2">
          <CloudLightning size={24} />
        </div>
        <p className="text-sm text-aviation-dark mb-1">{error || 'No analytics data available'}</p>
        <p className="text-xs text-gray-500">
          Flight performance data will appear here when available
        </p>
      </div>
    );
  }

  const efficiencyColor = getEfficiencyColor(metrics.efficiencyScore);
  const fuelEfficiencyColor = getEfficiencyColor(metrics.fuelEfficiency);
  const onTimeColor = getOnTimeColor(metrics.onTimePerformance);
  const routeColor = getDeviationColor(metrics.routeDeviation);
  const weatherColor = getWeatherImpactColor(metrics.weatherImpact);

  return (
    <div className={`${className} aviation-panel p-4 h-full overflow-auto`}>
      <h3 className="text-lg font-semibold mb-4 text-aviation-blue-dark dark:text-aviation-blue-light flex items-center">
        <Activity size={18} className="mr-2" /> 
        Flight Performance Analytics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Speed and Altitude */}
        <div className="aviation-glass p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center text-aviation-blue-dark dark:text-aviation-blue-light">
            <TrendingUp size={16} className="mr-1" /> Performance Metrics
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
              <div className="text-xl font-bold">{metrics.avgGroundSpeed}</div>
              <div className="text-xs text-gray-500">Avg. Speed (kts)</div>
            </div>
            <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
              <div className="text-xl font-bold">{Math.round(metrics.avgAltitude / 100)}</div>
              <div className="text-xs text-gray-500">Avg. Altitude (FL)</div>
            </div>
            <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
              <div className="text-xl font-bold">{Math.abs(metrics.avgVerticalSpeed)}</div>
              <div className="text-xs text-gray-500">Avg. VS (fpm)</div>
            </div>
            <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
              <div className="text-xl font-bold">{metrics.totalDistance}</div>
              <div className="text-xs text-gray-500">Distance (nm)</div>
            </div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="aviation-glass p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center text-aviation-blue-dark dark:text-aviation-blue-light">
            <Gauge size={16} className="mr-1" /> Efficiency
          </h4>
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <div className="w-32 text-xs">Flight Efficiency</div>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500" 
                  style={{ 
                    width: `${metrics.efficiencyScore}%`, 
                    background: efficiencyColor 
                  }}
                ></div>
              </div>
              <div className="ml-2 text-xs font-semibold">{Math.round(metrics.efficiencyScore)}%</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-32 text-xs">Fuel Efficiency</div>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500" 
                  style={{ 
                    width: `${metrics.fuelEfficiency}%`, 
                    background: fuelEfficiencyColor 
                  }}
                ></div>
              </div>
              <div className="ml-2 text-xs font-semibold">{Math.round(metrics.fuelEfficiency)}%</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-32 text-xs">On-Time Performance</div>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500" 
                  style={{ 
                    width: `${metrics.onTimePerformance}%`, 
                    background: onTimeColor 
                  }}
                ></div>
              </div>
              <div className="ml-2 text-xs font-semibold">{Math.round(metrics.onTimePerformance)}%</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Delay */}
        <div className="aviation-glass p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center text-aviation-blue-dark dark:text-aviation-blue-light">
            <Timer size={16} className="mr-1" /> Delay
          </h4>
          <div className="flex items-center justify-center h-20">
            <div className="text-3xl font-bold">
              {metrics.delayMinutes}
              <span className="text-sm font-normal ml-1">min</span>
            </div>
          </div>
        </div>
        
        {/* Route Deviation */}
        <div className="aviation-glass p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center text-aviation-blue-dark dark:text-aviation-blue-light">
            <Route size={16} className="mr-1" /> Route Deviation
          </h4>
          <div className="flex items-center justify-center h-20">
            <div className="relative h-16 w-16 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={routeColor}
                  strokeWidth="3"
                  strokeDasharray={`${metrics.routeDeviation}, 100`}
                />
                <text x="18" y="20.5" textAnchor="middle" fontSize="8.5" fontWeight="bold">
                  {metrics.routeDeviation}%
                </text>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Weather Impact */}
        <div className="aviation-glass p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center text-aviation-blue-dark dark:text-aviation-blue-light">
            <CloudLightning size={16} className="mr-1" /> Weather Impact
          </h4>
          <div className="flex items-center justify-center h-20">
            <div className="text-2xl font-bold" style={{ color: weatherColor }}>
              {getWeatherImpactText(metrics.weatherImpact)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500 italic text-center">
        Performance analytics are calculated based on real-time and historical flight data
      </div>
    </div>
  );
}

// Helper functions for color coding
function getEfficiencyColor(score: number): string {
  if (score >= 85) return 'var(--aviation-success)';
  if (score >= 70) return 'var(--aviation-blue-medium)';
  if (score >= 50) return 'var(--aviation-warning)';
  return 'var(--aviation-alert)';
}

function getOnTimeColor(score: number): string {
  if (score >= 90) return 'var(--aviation-success)';
  if (score >= 75) return 'var(--aviation-blue-medium)';
  if (score >= 60) return 'var(--aviation-warning)';
  return 'var(--aviation-alert)';
}

function getDeviationColor(deviation: number): string {
  if (deviation <= 5) return 'var(--aviation-success)';
  if (deviation <= 10) return 'var(--aviation-blue-medium)';
  if (deviation <= 15) return 'var(--aviation-warning)';
  return 'var(--aviation-alert)';
}

function getWeatherImpactColor(impact: number): string {
  if (impact <= 2.5) return 'var(--aviation-success)';
  if (impact <= 5) return 'var(--aviation-blue-medium)';
  if (impact <= 7.5) return 'var(--aviation-warning)';
  return 'var(--aviation-alert)';
}

function getWeatherImpactText(impact: number): string {
  if (impact <= 2.5) return 'Minimal';
  if (impact <= 5) return 'Moderate';
  if (impact <= 7.5) return 'Significant';
  return 'Severe';
}