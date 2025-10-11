/**
 * Date utility functions using ISO 8601 (Monday-start weeks)
 */

/**
 * Get the start of the week (Monday 00:00:00)
 * @param {Date} date - Reference date
 * @returns {Date} - Start of week
 */
export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Sunday = 0, Monday = 1
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the week (Sunday 23:59:59)
 * @param {Date} date - Reference date
 * @returns {Date} - End of week
 */
export function getWeekEnd(date = new Date()) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Get the start of the month
 * @param {Date} date - Reference date
 * @returns {Date} - Start of month
 */
export function getMonthStart(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the month
 * @param {Date} date - Reference date
 * @returns {Date} - End of month
 */
export function getMonthEnd(date = new Date()) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}
