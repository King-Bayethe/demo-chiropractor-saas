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
  try {
    if (!date) return 'Invalid Date';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return dateObj.toLocaleString("en-US", { 
      timeZone: COMPANY_TIMEZONE,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'Input:', date);
    return 'Invalid Date';
  }
};

/**
 * Safely formats time slots for display
 */
export const formatTimeSlot = (startTime: string | Date | null, endTime: string | Date | null): string => {
  try {
    if (!startTime || !endTime) return 'Invalid Date';
    
    const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid Date';
    }
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      timeZone: COMPANY_TIMEZONE,
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    
    const startFormatted = start.toLocaleString("en-US", formatOptions);
    const endFormatted = end.toLocaleString("en-US", formatOptions);
    
    return `${startFormatted} - ${endFormatted}`;
  } catch (error) {
    console.error('Error formatting time slot:', error, 'Start:', startTime, 'End:', endTime);
    return 'Invalid Date';
  }
};