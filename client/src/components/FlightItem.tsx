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
    return formatDuration(timeRemaining);
  };

  return (
    <div 
      className="border-b border-neutral-200 p-4 hover:bg-neutral-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <span className="font-medium text-neutral-800">
              {flight.callsign || flight.flightNumber || 'N/A'}
            </span>
            <Badge variant="outline" className={`ml-2 bg-${statusColor} text-white`}>
              {formattedStatus}
            </Badge>
          </div>
          <div className="text-sm text-neutral-600 mt-1">
            {flight.departure?.icao || 'N/A'} → {flight.arrival?.icao || 'N/A'}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-medium">{flight.aircraftType || 'Unknown'}</div>
          <div className="text-xs text-neutral-500 mt-1">{flight.airline?.name || 'Unknown Airline'}</div>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="relative pt-2">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-neutral-900 font-mono">
              {flight.departure?.icao || 'DEP'}
            </span>
            <span className="text-xs font-medium text-neutral-900 font-mono">
              {flight.arrival?.icao || 'ARR'}
            </span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div 
            className="absolute" 
            style={{ left: `${progress}%`, top: '0' }}
          >
            <span 
              className="material-icons text-primary text-base"
              style={{ transform: `rotate(${flight.position.heading}deg)` }}
            >
              flight
            </span>
          </div>
          
          <div className="flex justify-between mt-1">
            <span className="text-xs text-neutral-500">
              {flight.departure?.time ? formatTime(flight.departure.time) : 'N/A'}
            </span>
            <span className="text-xs text-neutral-500">
              {flight.arrival?.time ? formatTime(flight.arrival.time) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-3 text-xs text-neutral-600">
        <div>Altitude: <span className="font-medium font-mono">{flight.position.altitude.toLocaleString()} ft</span></div>
        <div>Speed: <span className="font-medium font-mono">{flight.position.groundSpeed} mph</span></div>
        <div>ETA: <span className="font-medium font-mono">{calculateETA()}</span></div>
      </div>
    </div>
  );
}
