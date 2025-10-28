/**
 * Date Utilities for Analytics Filtering
 * Helper functions for filtering log entries by date ranges.
 * Supports common date ranges like today, yesterday, and last N days.
 */

/**
 * Get the start of today at midnight (00:00:00)
 * @returns {Date} Today's date at 00:00:00
 */
export const getStartOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
};

/**
 * Get the end of today at 23:59:59
 * @returns {Date} Today's date at 23:59:59
 */
export const getEndOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
};

/**
 * Get the start of yesterday at midnight
 * @returns {Date} Yesterday's date at 00:00:00
 */
export const getStartOfYesterday = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
};

/**
 * Get the end of yesterday at 23:59:59
 * @returns {Date} Yesterday's date at 23:59:59
 */
export const getEndOfYesterday = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
};

/**
 * Get a date N days ago at midnight
 * @param {number} days - Number of days to go back
 * @returns {Date} Date N days ago at 00:00:00
 */
export const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

/**
 * Check if a date is within today
 * @param {Date|string|number} date - Date to check (can be Date object, ISO string, or timestamp)
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const checkDate = new Date(date);
  const today = new Date();
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is yesterday
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is yesterday
 */
export const isYesterday = (date) => {
  const checkDate = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    checkDate.getDate() === yesterday.getDate() &&
    checkDate.getMonth() === yesterday.getMonth() &&
    checkDate.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * Check if a date is within the last N days (inclusive)
 * @param {Date|string|number} date - Date to check
 * @param {number} days - Number of days to check back
 * @returns {boolean} True if date is within last N days
 */
export const isWithinLastDays = (date, days) => {
  const checkDate = new Date(date);
  const startDate = getDaysAgo(days);
  const endDate = getEndOfToday();
  return checkDate >= startDate && checkDate <= endDate;
};

/**
 * Filter entries by date range
 * @param {Array} entries - Array of log entries to filter
 * @param {string} dateRange - Date range option ("all", "today", "yesterday", "last7days")
 * @param {string} dateField - Name of the date field in entry object (default: "createdAt")
 * @returns {Array} Filtered array of entries
 */
export const filterByDateRange = (entries, dateRange, dateField = "createdAt") => {
  if (!entries || entries.length === 0) return [];
  if (dateRange === "all") return entries;

  return entries.filter((entry) => {
    const entryDate = entry[dateField];
    if (!entryDate) return false;

    switch (dateRange) {
      case "today":
        return isToday(entryDate);
      case "yesterday":
        return isYesterday(entryDate);
      case "last7days":
        return isWithinLastDays(entryDate, 7);
      default:
        return true;
    }
  });
};

/**
 * Sort entries by date
 * @param {Array} entries - Array of entries to sort
 * @param {string} order - Sort order ("asc" for oldest first, "desc" for newest first)
 * @param {string} dateField - Name of the date field in entry object (default: "createdAt")
 * @returns {Array} Sorted array of entries
 */
export const sortByDate = (entries, order = "desc", dateField = "createdAt") => {
  if (!entries || entries.length === 0) return [];

  return [...entries].sort((a, b) => {
    const dateA = new Date(a[dateField] || 0);
    const dateB = new Date(b[dateField] || 0);
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Sort entries by a numeric field
 * @param {Array} entries - Array of entries to sort
 * @param {string} field - Field name to sort by (e.g., "calories", "weight")
 * @param {string} order - Sort order ("asc" or "desc")
 * @returns {Array} Sorted array of entries
 */
export const sortByNumericField = (entries, field, order = "desc") => {
  if (!entries || entries.length === 0) return [];

  return [...entries].sort((a, b) => {
    const valueA = Number(a[field]) || 0;
    const valueB = Number(b[field]) || 0;
    return order === "asc" ? valueA - valueB : valueB - valueA;
  });
};

/**
 * Sort entries by a string field (alphabetically)
 * @param {Array} entries - Array of entries to sort
 * @param {string} field - Field name to sort by (e.g., "name")
 * @param {string} order - Sort order ("asc" for A-Z, "desc" for Z-A)
 * @returns {Array} Sorted array of entries
 */
export const sortByStringField = (entries, field, order = "asc") => {
  if (!entries || entries.length === 0) return [];

  return [...entries].sort((a, b) => {
    const valueA = (a[field] || "").toString().toLowerCase();
    const valueB = (b[field] || "").toString().toLowerCase();
    if (order === "asc") {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });
};