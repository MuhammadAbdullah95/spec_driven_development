import { Router, Request, Response } from 'express'
import { getCurrentWeather, getWeatherForecast } from '../services/openWeatherService.js'
import { getCoordinatesFromCity } from '../services/geocodingService.js'
import { weatherRateLimiter, geocodeRateLimiter } from '../logic/rateLimit.js'
import { validateCoordinates } from '../logic/validation.js'
import { getUnitParam } from '../logic/unitConversion.js'

const router = Router()

/**
 * GET /api/weather/current
 * Query params: lat, lon, units (celsius|fahrenheit)
 * Returns current weather for coordinates
 */
router.get('/current', weatherRateLimiter, async (req: Request, res: Response) => {
  try {
    const { lat, lon, units = 'celsius' } = req.query

    // Validate coordinates
    const latitude = parseFloat(lat as string)
    const longitude = parseFloat(lon as string)

    if (!validateCoordinates(latitude, longitude)) {
      res.status(400).json({
        success: false,
        error: 'Invalid coordinates. Latitude must be -90 to 90, longitude must be -180 to 180',
        code: 'INVALID_REQUEST',
      })
      return
    }

    // Validate units
    if (units !== 'celsius' && units !== 'fahrenheit') {
      res.status(400).json({
        success: false,
        error: 'Invalid units. Must be "celsius" or "fahrenheit"',
        code: 'INVALID_REQUEST',
      })
      return
    }

    // Get weather data
    const unitParam = getUnitParam(units as string)
    const result = await getCurrentWeather(latitude, longitude, unitParam)

    if (result.success) {
      res.json(result)
    } else {
      // Error response
      const statusCode = result.code === 'RATE_LIMIT_EXCEEDED' ? 429 :
                         result.code === 'LOCATION_NOT_FOUND' ? 404 :
                         result.code === 'INVALID_REQUEST' ? 400 :
                         result.code === 'TIMEOUT' ? 504 :
                         result.code === 'NETWORK_ERROR' ? 503 : 500
      res.status(statusCode).json(result)
    }
  } catch (error) {
    console.error('[Weather Routes] Unexpected error:', error)
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again',
      code: 'INTERNAL_ERROR',
    })
  }
})

/**
 * GET /api/weather/geocode
 * Query params: city
 * Returns coordinates for city name
 */
router.get('/geocode', geocodeRateLimiter, async (req: Request, res: Response) => {
  try {
    const { city } = req.query

    if (!city || typeof city !== 'string') {
      res.status(400).json({
        success: false,
        error: 'City name is required',
        code: 'INVALID_REQUEST',
      })
      return
    }

    // Get coordinates
    const result = await getCoordinatesFromCity(city)

    if (result.success) {
      res.json(result)
    } else {
      // Error response
      const statusCode = result.code === 'RATE_LIMIT_EXCEEDED' ? 429 :
                         result.code === 'LOCATION_NOT_FOUND' ? 404 :
                         result.code === 'INVALID_REQUEST' ? 400 :
                         result.code === 'TIMEOUT' ? 504 :
                         result.code === 'NETWORK_ERROR' ? 503 : 500
      res.status(statusCode).json(result)
    }
  } catch (error) {
    console.error('[Weather Routes] Unexpected error:', error)
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again',
      code: 'INTERNAL_ERROR',
    })
  }
})

/**
 * GET /api/weather/forecast
 * Query params: lat, lon, units (celsius|fahrenheit)
 * Returns 3-day weather forecast for coordinates
 */
router.get('/forecast', weatherRateLimiter, async (req: Request, res: Response) => {
  try {
    const { lat, lon, units = 'celsius' } = req.query

    // Validate coordinates
    const latitude = parseFloat(lat as string)
    const longitude = parseFloat(lon as string)

    if (!validateCoordinates(latitude, longitude)) {
      res.status(400).json({
        success: false,
        error: 'Invalid coordinates. Latitude must be -90 to 90, longitude must be -180 to 180',
        code: 'INVALID_REQUEST',
      })
      return
    }

    // Validate units
    if (units !== 'celsius' && units !== 'fahrenheit') {
      res.status(400).json({
        success: false,
        error: 'Invalid units. Must be "celsius" or "fahrenheit"',
        code: 'INVALID_REQUEST',
      })
      return
    }

    // Get forecast data
    const unitParam = getUnitParam(units as string)
    const result = await getWeatherForecast(latitude, longitude, unitParam)

    if (result.success) {
      res.json(result)
    } else {
      // Error response
      const statusCode = result.code === 'RATE_LIMIT_EXCEEDED' ? 429 :
                         result.code === 'LOCATION_NOT_FOUND' ? 404 :
                         result.code === 'INVALID_REQUEST' ? 400 :
                         result.code === 'TIMEOUT' ? 504 :
                         result.code === 'NETWORK_ERROR' ? 503 : 500
      res.status(statusCode).json(result)
    }
  } catch (error) {
    console.error('[Weather Routes] Unexpected forecast error:', error)
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again',
      code: 'INTERNAL_ERROR',
    })
  }
})

export default router
