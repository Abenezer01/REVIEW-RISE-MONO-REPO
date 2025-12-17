import moment from 'moment';
// Function to format a date
export function formatDate(date: any, format = 'YYYY-MM-DD') {
  return moment(date).format(format);
}

// Function to format a created at
export function formatCreatedAt(date: any, format = 'MMM D, YYYY, HH:MM') {
  return moment(date).format(format);
}
export function formatDynamicDate(date: any, format = 'MMM D, YYYY') {
  return moment(date).format(format);
}

// Function to format a date as a human-readable string (e.g., "3 days ago")
export function formatRelative(date: any) {
  return moment(date).fromNow();
}

// Function to format a date as a calendar date (e.g., "Mar 1, 2024")
export function formatCalendar(date: any) {
  return moment(date).format('MMM D, YYYY');
}

// Function to format a date as a time (e.g., "12:30 PM")
export function formatTime(date: any) {
  return moment(date).format('h:mm A');
}

// Function to format a date as a time with seconds (e.g., "12:30:45 PM")
export function formatTimeWithSeconds(date: any) {
  return moment(date).format('h:mm:ss A');
}

// Function to check if a date is in the past
export function isPast(date: any) {
  return moment(date).isBefore(moment(), 'day');
}

// Function to check if a date is in the future
export function isFuture(date: any) {
  return moment(date).isAfter(moment(), 'day');
}

// Function to check if a date is today
export function isToday(date: any) {
  return moment(date).isSame(moment(), 'day');
}

// Function to check if a date is tomorrow
export function isTomorrow(date: any) {
  return moment(date).isSame(moment().add(1, 'day'), 'day');
}

// Function to check if a date is yesterday
export function isYesterday(date: any) {
  return moment(date).isSame(moment().subtract(1, 'day'), 'day');
}

export const getCurrentDate = (format = 'YYYY-MM-DD'): string => {
  return moment().format(format);
};

export const convertUtcToLocal = (utcDate: string, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  return moment.utc(utcDate).local().format(format);
};

// Additional functions for human-readable formats

export const formatToRelative = (date: string | Date): string => {
  return moment(date).fromNow();
};

export const formatToCalendar = (date: string | Date): string => {
  return moment(date).calendar();
};

export const formatToLongString = (date: string | Date): string => {
  return moment(date).format('dddd, MMMM Do YYYY [at] h:mm:ss a');
};
export const timeGreating = (date: string | Date): { greating: string; greatingName: string } => {
  const givenHour = moment(date).hour();

  let newGreeting = '';
  let greatingName = '';
  if (givenHour >= 5 && givenHour < 12) {
    newGreeting = 'greating.good-morning';
    greatingName = 'morning';
  } else if (givenHour >= 12 && givenHour < 18) {
    newGreeting = 'greating.good-afternoon';
    greatingName = 'afternoon';
  } else {
    newGreeting = 'greating.good-evening';
    greatingName = 'evening';
  }
  return { greating: newGreeting, greatingName };
};

