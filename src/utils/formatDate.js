/**
 * Formats a Firestore Timestamp, JavaScript Date object, or a date string into a readable string.
 * @param {object|Date|string} dateInput - The date to format (Timestamp, Date object, or ISO string).
 * @param {object} options - Intl.DateTimeFormat options.
 * @returns {string} Formatted date string, or 'Invalid Date' if input is problematic.
 */
export const formatDate = (dateInput, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
  if (!dateInput) return 'N/A';

  let date;
  if (dateInput.seconds) { // Firestore Timestamp
    date = new Date(dateInput.seconds * 1000 + (dateInput.nanoseconds || 0) / 1000000);
  } else if (dateInput instanceof Date) { // JavaScript Date object
    date = dateInput;
  } else if (typeof dateInput === 'string') { // Date string (attempt to parse)
    date = new Date(dateInput);
  } else {
    return 'Invalid Date Input';
  }

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  try {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Formatting Error';
  }
};

/**
 * Formats a date into a relative time string (e.g., "2 days ago", "in 3 hours").
 * Requires Intl.RelativeTimeFormat support (modern browsers).
 * @param {object|Date|string} dateInput - The date to format.
 * @returns {string} Relative time string or formatted date if Intl.RelativeTimeFormat is not supported/fails.
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  let date;
  if (dateInput.seconds) {
    date = new Date(dateInput.seconds * 1000 + (dateInput.nanoseconds || 0) / 1000000);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else {
    return 'Invalid Date Input';
  }

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  if (typeof Intl.RelativeTimeFormat !== 'function') {
    return formatDate(date); // Fallback for older browsers
  }

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const diffInSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

  const units = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    const value = Math.round(diffInSeconds / seconds);
    if (Math.abs(value) >= 1) {
      try {
        return rtf.format(value, unit);
      } catch (error) {
        console.error("Error formatting relative time:", error);
        return formatDate(date); // Fallback on error
      }
    }
  }
  return 'just now';
};
