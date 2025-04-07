import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistance } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a timestamp into a readable time
export function formatTime(timestamp: string | undefined): string {
  if (!timestamp) return 'Unknown';
  try {
    return format(new Date(timestamp), 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
}

// Format the duration between two timestamps or return a duration in minutes
// Also handles milliseconds value as a string for ETA calculation
export function formatDuration(
  startTimeOrMillis?: string | Date,
  endTime?: string | Date,
  durationMinutes?: number
): string {
  // If duration in minutes is provided directly
  if (durationMinutes) {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
  
  // If a millisecond value is provided as a string (for ETA calculation)
  if (startTimeOrMillis && typeof startTimeOrMillis === 'string' && !isNaN(Number(startTimeOrMillis))) {
    const milliseconds = Number(startTimeOrMillis);
    const minutes = Math.floor(milliseconds / 60000);
    
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  }
  
  // For normal duration between two dates
  if (!startTimeOrMillis || !endTime) return 'Unknown';
  
  try {
    const start = typeof startTimeOrMillis === 'string' ? new Date(startTimeOrMillis) : startTimeOrMillis;
    const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
    return formatDistance(start, end);
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 'Unknown';
  }
}

// Get color for flight status
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-500';
    case 'scheduled':
      return 'bg-blue-500';
    case 'landed':
      return 'bg-emerald-500';
    case 'delayed':
      return 'bg-amber-500';
    case 'cancelled':
      return 'bg-red-500';
    case 'diverted':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
}
