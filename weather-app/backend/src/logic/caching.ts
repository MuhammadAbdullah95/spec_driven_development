import NodeCache from 'node-cache'

// Cache with 10-minute TTL for weather data
export const weatherCache = new NodeCache({
  stdTTL: 600, // 10 minutes in seconds
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Performance optimization
})

// Cache with 15-minute TTL for forecast data
export const forecastCache = new NodeCache({
  stdTTL: 900, // 15 minutes in seconds
  checkperiod: 180, // Check for expired keys every 3 minutes
  useClones: false,
})

// Cache with 24-hour TTL for geocoding results
export const geocodeCache = new NodeCache({
  stdTTL: 86400, // 24 hours in seconds
  checkperiod: 3600, // Check for expired keys every hour
  useClones: false,
})

/**
 * Generate cache key for weather data
 */
export function generateWeatherCacheKey(lat: number, lon: number, units: string): string {
  // Round coordinates to 2 decimal places for cache key consistency
  const roundedLat = Math.round(lat * 100) / 100
  const roundedLon = Math.round(lon * 100) / 100
  return `weather:${roundedLat},${roundedLon}:${units}`
}

/**
 * Generate cache key for forecast data
 */
export function generateForecastCacheKey(lat: number, lon: number, units: string): string {
  const roundedLat = Math.round(lat * 100) / 100
  const roundedLon = Math.round(lon * 100) / 100
  return `forecast:${roundedLat},${roundedLon}:${units}`
}

/**
 * Generate cache key for geocoding
 */
export function generateGeocodeCacheKey(cityName: string): string {
  return `geocode:${cityName.toLowerCase().trim()}`
}
