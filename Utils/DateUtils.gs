/**
 * Utils/DateUtils.js
 * Date manipulation and formatting utilities.
 */

/**
 * Format a date to ISO string (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateISO(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Format a date to datetime string (YYYY-MM-DD HH:mm:ss)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted datetime string
 */
function formatDateTime(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  const datePart = formatDateISO(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${datePart} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get the start of week (Monday) for a given date
 * @param {Date|string} date - Input date
 * @returns {Date} Monday of the week
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the end of week (Sunday) for a given date
 * @param {Date|string} date - Input date
 * @returns {Date} Sunday of the week
 */
function getWeekEnd(date) {
  const start = getWeekStart(date);
  return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
}

/**
 * Get week number for a given date (ISO week)
 * @param {Date|string} date - Input date
 * @returns {number} Week number (1-53)
 */
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Validate if date1 is before date2
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if date1 < date2
 */
function isDateBefore(date1, date2) {
  return new Date(date1) < new Date(date2);
}

/**
 * Validate if date1 is after date2
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if date1 > date2
 */
function isDateAfter(date1, date2) {
  return new Date(date1) > new Date(date2);
}

/**
 * Check if two date ranges overlap
 * @param {Date|string} start1 - Start of first range
 * @param {Date|string} end1 - End of first range
 * @param {Date|string} start2 - Start of second range
 * @param {Date|string} end2 - End of second range
 * @returns {boolean} True if ranges overlap
 */
function dateRangesOverlap(start1, end1, start2, end2) {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  
  return s1 <= e2 && s2 <= e1;
}

/**
 * Get number of days between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Number of days
 */
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date
 * @param {Date|string} date - Input date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} New date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get quarter from month (1-4)
 * @param {number} month - Month (1-12)
 * @returns {number} Quarter (1-4)
 */
function getQuarterFromMonth(month) {
  return Math.ceil(month / 3);
}

/**
 * Get current fiscal year (assuming April-March)
 * @param {Date|string} date - Input date
 * @returns {string} Fiscal year string (e.g., "2024-2025")
 */
function getFiscalYear(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  
  if (month >= 4) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

/**
 * Validate date string format (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid
 */
function isValidDateString(dateString) {
  if (!dateString) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
