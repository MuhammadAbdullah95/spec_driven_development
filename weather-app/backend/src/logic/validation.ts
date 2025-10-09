/**
 * Validates city name input
 * - Must be 2-100 characters
 * - Must contain only letters, spaces, hyphens, apostrophes
 */
export function validateCityName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false
  }

  const trimmed = name.trim()

  // Length check
  if (trimmed.length < 2 || trimmed.length > 100) {
    return false
  }

  // Character check: letters, spaces, hyphens, apostrophes, periods
  const validPattern = /^[a-zA-Z\s\-'.]+$/
  return validPattern.test(trimmed)
}

/**
 * Validates geographic coordinates
 * - Latitude: -90 to 90
 * - Longitude: -180 to 180
 */
export function validateCoordinates(lat: number, lon: number): boolean {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return false
  }

  if (isNaN(lat) || isNaN(lon)) {
    return false
  }

  if (lat < -90 || lat > 90) {
    return false
  }

  if (lon < -180 || lon > 180) {
    return false
  }

  return true
}

/**
 * Sanitizes city name by trimming and normalizing whitespace
 */
export function sanitizeCityName(name: string): string {
  if (!name || typeof name !== 'string') {
    return ''
  }

  // Trim and normalize multiple spaces to single space
  return name.trim().replace(/\s+/g, ' ')
}
