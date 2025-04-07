import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LiveFlight } from "@/types";
import { formatDuration, formatTime, getStatusColor } from "@/lib/utils";

interface FlightItemProps {
  flight: LiveFlight;
  onClick: () => void;
}

export default function FlightItem({ flight, onClick }: FlightItemProps) {
  // Calculate flight progress for the progress bar
  const progress = flight.progress ?? 0;
  
  // Format flight status for display
  const formattedStatus = flight.status.charAt(0).toUpperCase() + flight.status.slice(1);
  
  // Get class name based on status
  const statusColor = getStatusColor(flight.status);
  
  // Calculate ETA based on progress and timestamps
  const calculateETA = () => {
    if (!flight.departure?.time || !flight.arrival?.time) return 'N/A';
    
    const departureTime = new Date(flight.departure.time).getTime();
    const arrivalTime = new Date(flight.arrival.time).getTime();
    const currentTime = Date.now();
    
    if (currentTime >= arrivalTime) return '0m';
    
    const timeRemaining = arrivalTime - currentTime;
    // Convert timeRemaining from number to string for formatDuration
    return formatDuration(timeRemaining.toString());
  };

  return (
    <div 
      className="border-b aviation-flight-item p-4 cursor-pointer transition-all"
      style={{ 
        borderColor: 'rgba(85, 255, 221, 0.15)', 
        background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(248,252,255,0.5))'
      }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <span 
              className="font-medium text-base bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, var(--aviation-blue-dark), var(--aviation-blue-medium))' }}
            >
              {flight.callsign || flight.flightNumber || 'N/A'}
            </span>
            <Badge 
              variant="outline" 
              className={`ml-2 text-white aviation-status-badge aviation-status-${flight.status}`}
            >
              {formattedStatus}
            </Badge>
          </div>
          <div className="text-sm mt-1 flex items-center">
            <span className="font-medium" style={{ color: 'var(--aviation-blue-dark)' }}>
              {flight.departure?.icao || 'N/A'}
            </span>
            <span className="mx-1.5 opacity-60">→</span>
            <span className="font-medium" style={{ color: 'var(--aviation-blue-dark)' }}>
              {flight.arrival?.icao || 'N/A'}
            </span>
            {flight.status === 'active' && (
              <span 
                className="ml-2 inline-block px-1.5 py-0.5 text-[9px] rounded-sm text-white font-semibold aviation-pulse"
                style={{ backgroundColor: 'var(--aviation-blue-accent)' }}
              >
                LIVE
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div 
            className="font-mono text-sm font-medium aviation-data-highlight py-0.5 px-2 rounded-sm inline-block"
            style={{ background: 'rgba(10, 73, 149, 0.08)' }}
          >
            {flight.aircraftType || 'Unknown'}
          </div>
          <div className="text-xs mt-1 opacity-80">{flight.airline?.name || 'Unknown Airline'}</div>
        </div>
      </div>
      
      <div className="mt-3 aviation-progress-container p-3 rounded-md">
        <div className="relative pt-2">
          <div className="flex justify-between mb-1">
            <span 
              className="text-xs font-medium font-mono"
              style={{ color: 'var(--aviation-blue-dark)' }}
            >
              {flight.departure?.icao || 'DEP'}
            </span>
            <span 
              className="text-xs font-medium font-mono"
              style={{ color: 'var(--aviation-blue-dark)' }}
            >
              {flight.arrival?.icao || 'ARR'}
            </span>
          </div>
          
          <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden relative aviation-progress-bar">
            <div 
              className="h-full absolute left-0 top-0 rounded-full" 
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(to right, var(--aviation-blue-dark), var(--aviation-blue-light))',
                boxShadow: '0 0 8px var(--aviation-blue-accent)'
              }}
            />
          </div>
          
          <div 
            className="absolute transition-all duration-300" 
            style={{ 
              left: `${progress}%`, 
              top: '-2px',
              transform: 'translateX(-50%)',
            }}
          >
            <div
              className="h-6 w-6 flex items-center justify-center"
              style={{ 
                filter: 'drop-shadow(0 0 2px rgba(85, 255, 221, 0.8))',
                transform: `rotate(${flight.position.heading}deg)`
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0a4995" stroke="none">
                <path d="M21,16V14L13,9V3.5A1.5,1.5,0,0,0,11.5,2A1.5,1.5,0,0,0,10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z" />
              </svg>
            </div>
          </div>
          
          <div className="flex justify-between mt-1">
            <span className="text-xs opacity-70">
              {flight.departure?.time ? formatTime(flight.departure.time) : 'N/A'}
            </span>
            <span className="text-xs opacity-70">
              {flight.arrival?.time ? formatTime(flight.arrival.time) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="aviation-data-metric text-center p-1 rounded-md">
          <div className="text-xs uppercase opacity-70">Altitude</div>
          <div 
            className="font-mono text-sm font-semibold" 
            style={{ color: 'var(--aviation-blue-dark)' }}
          >
            {flight.position.altitude.toLocaleString()} ft
          </div>
        </div>
        <div className="aviation-data-metric text-center p-1 rounded-md">
          <div className="text-xs uppercase opacity-70">Speed</div>
          <div 
            className="font-mono text-sm font-semibold" 
            style={{ color: 'var(--aviation-blue-dark)' }}
          >
            {flight.position.groundSpeed} mph
          </div>
        </div>
        <div className="aviation-data-metric text-center p-1 rounded-md">
          <div className="text-xs uppercase opacity-70">ETA</div>
          <div 
            className="font-mono text-sm font-semibold" 
            style={{ color: 'var(--aviation-blue-dark)' }}
          >
            {calculateETA()}
          </div>
        </div>
      </div>
    </div>
  );
}
