// Timezone utilities for the application
export const COMPANY_TIMEZONE = 'America/New_York'; // EST/EDT

/**
 * Formats a time string to display with timezone indicator
 */
export const formatTimeWithTimezone = (time: string): string => {
  if (!time) return '';
  return `${time} EST`;
};

/**
 * Gets the current time in the company timezone
 */
export const getCurrentTimeInCompanyTimezone = (): Date => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: COMPANY_TIMEZONE }));
};

/**
 * Converts a time to company timezone
 */
export const convertToCompanyTimezone = (date: Date): Date => {
  return new Date(date.toLocaleString("en-US", { timeZone: COMPANY_TIMEZONE }));
};

/**
 * Formats a date to show timezone
 */
export const formatDateTimeWithTimezone = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString("en-US", { 
    timeZone: COMPANY_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};