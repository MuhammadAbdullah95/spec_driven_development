/**
 * Formatting utilities using Intl API
 */

/**
 * Format amount as currency
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code (default: USD)
 * @returns {string} - Formatted currency string
 */
import { formatCurrency as formatCurrencyWithCode } from './currencyFormatter.js';

export const formatCurrency = (amount, currencyCode) => {
  // Get currency from settings if not provided
  if (!currencyCode) {
    const savedSettings = localStorage.getItem('expenseTrackerSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    currencyCode = settings.currency || 'USD';
  }
  
  return formatCurrencyWithCode(amount, currencyCode);
};

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale (default: en-US)
 * @returns {string} - Formatted date string
 */
export function formatDate(date, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

/**
 * Format relative time (e.g., "2 hours ago", "Yesterday")
 * @param {string|Date} date - Date to format
 * @returns {string} - Relative time string
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = Math.abs(now - targetDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays === 0) {
    return 'Today';
  } else if (diffDays <= 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return targetDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: targetDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted percentage string
 */
export function formatPercentage(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
export function formatLargeNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
