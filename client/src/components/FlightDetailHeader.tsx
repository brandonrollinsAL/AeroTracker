import { Badge } from "@/components/ui/badge";
import { LiveFlight } from "@/types";
import { formatTime, getStatusColor } from "@/lib/utils";

interface FlightDetailHeaderProps {
  flight: LiveFlight;
}

export default function FlightDetailHeader({ flight }: FlightDetailHeaderProps) {
  // Format flight status for display
  const formattedStatus = flight.status.charAt(0).toUpperCase() + flight.status.slice(1);
  
  // Get status color
  const statusColor = getStatusColor(flight.status);
  
  // Calculate flight duration
  const calculateDuration = () => {
    if (!flight.departure?.time || !flight.arrival?.time) return 'N/A';
    
    const departureTime = new Date(flight.departure.time).getTime();
    const arrivalTime = new Date(flight.arrival.time).getTime();
    
    const durationMs = arrivalTime - departureTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-neutral-100 rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full mr-3">
              <span className="material-icons text-sm">flight</span>
            </div>
            <div>
              <h3 className="font-semibold">{flight.airline?.name || 'Unknown Airline'}</h3>
              <p className="text-sm text-neutral-600">
                Flight {flight.callsign || flight.flightNumber || 'N/A'} • {flight.aircraftType || 'Unknown Aircraft'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-3 md:mt-0">
          <Badge variant="outline" className={`bg-${statusColor} bg-opacity-10 text-${statusColor} px-3 py-1`}>
            <span className="material-icons text-sm mr-1">
              {flight.status === 'active' ? 'check_circle' : 
               flight.status === 'delayed' ? 'schedule' : 
               flight.status === 'cancelled' ? 'cancel' : 'info'}
            </span>
            {formattedStatus}
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center mt-6">
        <div className="text-center mb-4 md:mb-0">
          <p className="text-sm text-neutral-500">Departure</p>
          <h4 className="text-2xl font-semibold font-mono">{flight.departure?.icao || 'N/A'}</h4>
          <p className="text-sm font-medium">{flight.departure?.name || 'Unknown Airport'}</p>
          <p className="text-sm text-neutral-600">{flight.departure?.time ? formatTime(flight.departure.time) : 'N/A'}</p>
        </div>
        
        <div className="flex flex-col items-center mb-4 md:mb-0">
          <div className="text-sm text-neutral-500">{calculateDuration()}</div>
          <div className="relative w-40 md:w-64 h-4 mt-1 mb-1">
            <div className="absolute w-full h-[1px] bg-primary top-1/2"></div>
            <div className="absolute left-0 w-2 h-2 rounded-full bg-primary"></div>
            <div className="absolute right-0 w-2 h-2 rounded-full bg-primary"></div>
            <div 
              className="absolute" 
              style={{ left: `${flight.progress || 0}%`, top: '-7px' }}
            >
              <span 
                className="material-icons text-primary"
                style={{ transform: `rotate(${flight.position.heading}deg)` }}
              >
                flight
              </span>
            </div>
          </div>
          <div className="text-xs text-neutral-600">
            {flight.route ? flight.route : 'Non-stop'}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-neutral-500">Arrival</p>
          <h4 className="text-2xl font-semibold font-mono">{flight.arrival?.icao || 'N/A'}</h4>
          <p className="text-sm font-medium">{flight.arrival?.name || 'Unknown Airport'}</p>
          <p className="text-sm text-neutral-600">{flight.arrival?.time ? formatTime(flight.arrival.time) : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
