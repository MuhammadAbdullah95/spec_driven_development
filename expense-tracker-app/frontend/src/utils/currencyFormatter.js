/**
 * Currency formatting utilities
 * Handles different currencies with proper symbols and formatting
 */

// Currency symbols and formatting rules
export const CURRENCY_CONFIG = {
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸', position: 'before' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺', position: 'after' },
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧', position: 'before' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', position: 'before' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', position: 'before' },
  JPY: { symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', position: 'before' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', position: 'after' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', position: 'before' },
  INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', position: 'before' },
  KRW: { symbol: '₩', name: 'South Korean Won', flag: '🇰🇷', position: 'before' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', position: 'before' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', flag: '🇭🇰', position: 'before' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴', position: 'after' },
  SEK: { symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪', position: 'after' },
  DKK: { symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰', position: 'after' },
  PLN: { symbol: 'zł', name: 'Polish Złoty', flag: '🇵🇱', position: 'after' },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', flag: '🇨🇿', position: 'after' },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', flag: '🇭🇺', position: 'after' },
  RUB: { symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺', position: 'after' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷', position: 'before' },
  MXN: { symbol: '$', name: 'Mexican Peso', flag: '🇲🇽', position: 'before' },
  ARS: { symbol: '$', name: 'Argentine Peso', flag: '🇦🇷', position: 'before' },
  CLP: { symbol: '$', name: 'Chilean Peso', flag: '🇨🇱', position: 'before' },
  COP: { symbol: '$', name: 'Colombian Peso', flag: '🇨🇴', position: 'before' },
  PEN: { symbol: 'S/', name: 'Peruvian Sol', flag: '🇵🇪', position: 'before' },
  ZAR: { symbol: 'R', name: 'South African Rand', flag: '🇿🇦', position: 'before' },
  EGP: { symbol: '£', name: 'Egyptian Pound', flag: '🇪🇬', position: 'before' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', position: 'before' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪', position: 'before' },
  MAD: { symbol: 'DH', name: 'Moroccan Dirham', flag: '🇲🇦', position: 'after' },
  TND: { symbol: 'DT', name: 'Tunisian Dinar', flag: '🇹🇳', position: 'after' },
  AED: { symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪', position: 'after' },
  SAR: { symbol: 'SR', name: 'Saudi Riyal', flag: '🇸🇦', position: 'after' },
  QAR: { symbol: 'QR', name: 'Qatari Riyal', flag: '🇶🇦', position: 'after' },
  KWD: { symbol: 'KD', name: 'Kuwaiti Dinar', flag: '🇰🇼', position: 'after' },
  BHD: { symbol: 'BD', name: 'Bahraini Dinar', flag: '🇧🇭', position: 'after' },
  OMR: { symbol: 'OR', name: 'Omani Rial', flag: '🇴🇲', position: 'after' },
  JOD: { symbol: 'JD', name: 'Jordanian Dinar', flag: '🇯🇴', position: 'after' },
  LBP: { symbol: 'LL', name: 'Lebanese Pound', flag: '🇱🇧', position: 'after' },
  ILS: { symbol: '₪', name: 'Israeli Shekel', flag: '🇮🇱', position: 'before' },
  TRY: { symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷', position: 'after' },
  PKR: { symbol: 'Rs', name: 'Pakistani Rupee', flag: '🇵🇰', position: 'before' },
  BDT: { symbol: '৳', name: 'Bangladeshi Taka', flag: '🇧🇩', position: 'before' },
  LKR: { symbol: 'Rs', name: 'Sri Lankan Rupee', flag: '🇱🇰', position: 'before' },
  NPR: { symbol: 'Rs', name: 'Nepalese Rupee', flag: '🇳🇵', position: 'before' },
  MMK: { symbol: 'K', name: 'Myanmar Kyat', flag: '🇲🇲', position: 'after' },
  THB: { symbol: '฿', name: 'Thai Baht', flag: '🇹🇭', position: 'before' },
  VND: { symbol: '₫', name: 'Vietnamese Dong', flag: '🇻🇳', position: 'after' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩', position: 'before' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾', position: 'before' },
  PHP: { symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭', position: 'before' },
  TWD: { symbol: 'NT$', name: 'Taiwan Dollar', flag: '🇹🇼', position: 'before' }
};

/**
 * Format currency amount with proper symbol and positioning
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (e.g., 'USD', 'EUR')
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'USD', options = {}) => {
  const {
    showDecimals = true,
    showSymbol = true,
    locale = 'en-US'
  } = options;

  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? `${CURRENCY_CONFIG[currencyCode]?.symbol || '$'}0${showDecimals ? '.00' : ''}` : '0';
  }

  const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  
  // Format the number with proper locale
  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  }).format(Math.abs(amount));

  if (!showSymbol) {
    return amount < 0 ? `-${formattedAmount}` : formattedAmount;
  }

  const symbol = config.symbol;
  const isNegative = amount < 0;
  
  if (config.position === 'before') {
    return isNegative ? `-${symbol}${formattedAmount}` : `${symbol}${formattedAmount}`;
  } else {
    return isNegative ? `-${formattedAmount} ${symbol}` : `${formattedAmount} ${symbol}`;
  }
};

/**
 * Get currency symbol for a given currency code
 * @param {string} currencyCode - The currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode = 'USD') => {
  return CURRENCY_CONFIG[currencyCode]?.symbol || '$';
};

/**
 * Get currency info including flag and name
 * @param {string} currencyCode - The currency code
 * @returns {object} Currency information
 */
export const getCurrencyInfo = (currencyCode = 'USD') => {
  return CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
};

/**
 * Get all available currencies for dropdown
 * @returns {array} Array of currency options
 */
export const getAllCurrencies = () => {
  return Object.entries(CURRENCY_CONFIG).map(([code, info]) => ({
    code,
    ...info,
    label: `${info.flag} ${code} - ${info.name} (${info.symbol})`
  }));
};

/**
 * Format currency for display in different contexts
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @param {string} context - Display context ('compact', 'full', 'symbol-only')
 * @returns {string} Formatted currency
 */
export const formatCurrencyForContext = (amount, currencyCode = 'USD', context = 'full') => {
  switch (context) {
    case 'compact':
      if (Math.abs(amount) >= 1000000) {
        return formatCurrency(amount / 1000000, currencyCode, { showDecimals: false }) + 'M';
      } else if (Math.abs(amount) >= 1000) {
        return formatCurrency(amount / 1000, currencyCode, { showDecimals: false }) + 'K';
      }
      return formatCurrency(amount, currencyCode);
    
    case 'symbol-only':
      return getCurrencySymbol(currencyCode);
    
    case 'full':
    default:
      return formatCurrency(amount, currencyCode);
  }
};

export default {
  formatCurrency,
  getCurrencySymbol,
  getCurrencyInfo,
  getAllCurrencies,
  formatCurrencyForContext,
  CURRENCY_CONFIG
};
