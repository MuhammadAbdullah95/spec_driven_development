import { openWeatherClient } from '../config/axios.js'
import { geocodeCache, generateGeocodeCacheKey } from '../logic/caching.js'
import { mapApiError, ErrorResponse } from '../utils/errorHandler.js'
import { validateCityName, sanitizeCityName } from '../logic/validation.js'

interface Location {
  name: string
  latitude: number
  longitude: number
  country?: string
}

export interface ApiResponse<T> {
  success: true
  data: T
  cached?: boolean
  timestamp: number
}

/**
 * Converts city name to coordinates using OpenWeather Geocoding API
 * Includes validation, caching, and error handling
 */
export async function getCoordinatesFromCity(
  cityName: string
): Promise<ApiResponse<Location> | ErrorResponse> {
  try {
    // Validate input
    if (!validateCityName(cityName)) {
      return {
        success: false,
        error: 'Invalid city name. Please use 2-100 characters with letters, spaces, and hyphens only',
        code: 'INVALID_REQUEST',
      }
    }

    // Sanitize input
    const sanitized = sanitizeCityName(cityName)

    // Check cache first
    const cacheKey = generateGeocodeCacheKey(sanitized)
    const cached = geocodeCache.get<Location>(cacheKey)

    if (cached) {
      console.log(`[Geocoding Service] Cache hit for ${cacheKey}`)
      return {
        success: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      }
    }

    // Fetch from API
    console.log(`[Geocoding Service] Fetching coordinates for city: ${sanitized}`)
    const response = await openWeatherClient.get('/geo/1.0/direct', {
      params: {
        q: sanitized,
        limit: 1,
      },
    })

    const apiData = response.data

    // Check if location was found
    if (!apiData || apiData.length === 0) {
      return {
        success: false,
        error: 'Location not found. Please check your input and try again',
        code: 'LOCATION_NOT_FOUND',
      }
    }

    // Transform to our data model
    const location: Location = {
      name: apiData[0].name,
      latitude: apiData[0].lat,
      longitude: apiData[0].lon,
      country: apiData[0].country,
    }

    // Cache the result (24-hour TTL)
    geocodeCache.set(cacheKey, location)
    console.log(`[Geocoding Service] Cached location for ${cacheKey}`)

    return {
      success: true,
      data: location,
      cached: false,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('[Geocoding Service] Error fetching coordinates:', error)
    return mapApiError(error)
  }
}
