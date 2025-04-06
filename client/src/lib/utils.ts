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
export function formatDuration(
  startTime?: string | Date,
  endTime?: string | Date,
  durationMinutes?: number
): string {
  if (durationMinutes) {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
  
  if (!startTime || !endTime) return 'Unknown';
  
  try {
    const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
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
