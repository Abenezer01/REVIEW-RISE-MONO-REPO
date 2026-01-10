/**
 * Date Helper Utility
 * Provides consistent date formatting across the application
 */

/**
 * Format a date to a relative time string (e.g., "2 minutes ago", "1 hour ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return diffInSeconds <= 1 ? 'just now' : `${diffInSeconds} seconds ago`;
  } else if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  } else if (diffInDays < 30) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  } else if (diffInMonths < 12) {
    return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
  } else {
    return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
  }
};

/**
 * Format a date to a short date string (e.g., "Jan 8, 2026")
 */
export const formatShortDate = (date: string | Date): string => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;

  
return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format a date to a long date string (e.g., "January 8, 2026")
 */
export const formatLongDate = (date: string | Date): string => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;

  
return targetDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format a date to a date and time string (e.g., "Jan 8, 2026 at 11:30 AM")
 */
export const formatDateTime = (date: string | Date): string => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;

  
return targetDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format a duration in milliseconds to a human-readable string (e.g., "4m 23s")
 */
export const formatDuration = (durationMs: number): string => {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;

    
return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;

    
return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;

    
return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Check if a date is within the last 24 hours
 */
export const isWithinLast24Hours = (date: string | Date): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - targetDate.getTime();

  
return diffInMs < 86400000; // 24 hours in milliseconds
};

/**
 * Format a date for API requests (ISO 8601 format)
 */
export const formatForAPI = (date: Date): string => {
  return date.toISOString();
};
