import { openWeatherClient } from '../config/axios.js'
import { weatherCache, generateWeatherCacheKey, forecastCache, generateForecastCacheKey } from '../logic/caching.js'
import { mapApiError, ErrorResponse } from '../utils/errorHandler.js'

interface Location {
  name: string
  latitude: number
  longitude: number
  country?: string
}

interface WeatherData {
  location: Location
  temperature: number
  temperatureUnit: 'celsius' | 'fahrenheit'
  condition: string
  conditionDescription: string
  humidity: number
  windSpeed: number
  windSpeedUnit: 'm/s' | 'mph'
  iconCode: string
  timestamp: number
  feelsLike?: number
}

interface ForecastDay {
  location: Location
  date: string // ISO 8601 format (YYYY-MM-DD)
  dayOfWeek: string
  condition: string
  conditionDescription: string
  iconCode: string
  temperatureMin: number
  temperatureMax: number
  temperatureUnit: 'celsius' | 'fahrenheit'
  timestamp: number
}

export interface ApiResponse<T> {
  success: true
  data: T
  cached?: boolean
  timestamp: number
}

/**
 * Fetches current weather data for given coordinates
 * Includes caching, timeout handling, and error mapping
 */
export async function getCurrentWeather(
  lat: number,
  lon: number,
  units: 'metric' | 'imperial'
): Promise<ApiResponse<WeatherData> | ErrorResponse> {
  try {
    // Check cache first
    const cacheKey = generateWeatherCacheKey(lat, lon, units)
    const cached = weatherCache.get<WeatherData>(cacheKey)

    if (cached) {
      console.log(`[Weather Service] Cache hit for ${cacheKey}`)
      return {
        success: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      }
    }

    // Fetch from API
    console.log(`[Weather Service] Fetching weather for lat=${lat}, lon=${lon}, units=${units}`)
    const response = await openWeatherClient.get('/data/2.5/weather', {
      params: {
        lat,
        lon,
        units,
      },
    })

    const apiData = response.data

    // Transform to our data model
    const weatherData: WeatherData = {
      location: {
        name: apiData.name,
        latitude: apiData.coord.lat,
        longitude: apiData.coord.lon,
        country: apiData.sys?.country,
      },
      temperature: Math.round(apiData.main.temp),
      temperatureUnit: units === 'metric' ? 'celsius' : 'fahrenheit',
      condition: apiData.weather[0].main,
      conditionDescription: apiData.weather[0].description,
      humidity: apiData.main.humidity,
      windSpeed: Math.round(apiData.wind.speed * 10) / 10, // Round to 1 decimal
      windSpeedUnit: units === 'metric' ? 'm/s' : 'mph',
      iconCode: apiData.weather[0].icon,
      timestamp: apiData.dt * 1000, // Convert to milliseconds
      feelsLike: Math.round(apiData.main.feels_like),
    }

    // Cache the result
    weatherCache.set(cacheKey, weatherData)
    console.log(`[Weather Service] Cached weather data for ${cacheKey}`)

    return {
      success: true,
      data: weatherData,
      cached: false,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('[Weather Service] Error fetching weather:', error)
    return mapApiError(error)
  }
}

/**
 * Fetches 3-day weather forecast for given coordinates
 * Uses OpenWeather 5-day forecast API and filters to get next 3 days
 */
export async function getWeatherForecast(
  lat: number,
  lon: number,
  units: 'metric' | 'imperial'
): Promise<ApiResponse<ForecastDay[]> | ErrorResponse> {
  try {
    // Check cache first
    const cacheKey = generateForecastCacheKey(lat, lon, units)
    const cached = forecastCache.get<ForecastDay[]>(cacheKey)

    if (cached) {
      console.log(`[Weather Service] Forecast cache hit for ${cacheKey}`)
      return {
        success: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      }
    }

    // Fetch from API - using 5-day forecast endpoint
    console.log(`[Weather Service] Fetching forecast for lat=${lat}, lon=${lon}, units=${units}`)
    const response = await openWeatherClient.get('/data/2.5/forecast', {
      params: {
        lat,
        lon,
        units,
        cnt: 24, // Get 24 forecasts (3 days * 8 forecasts per day)
      },
    })

    const apiData = response.data

    // Group forecasts by date and get daily min/max temperatures
    const dailyForecasts = new Map<string, any[]>()
    
    apiData.list.forEach((forecast: any) => {
      const date = new Date(forecast.dt * 1000).toISOString().split('T')[0]
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, [])
      }
      dailyForecasts.get(date)!.push(forecast)
    })

    // Convert to our forecast format - take only first 3 days
    const forecastDays: ForecastDay[] = Array.from(dailyForecasts.entries())
      .slice(0, 3)
      .map(([date, forecasts]) => {
        // Get temperatures for the day
        const temps = forecasts.map(f => f.main.temp)
        const minTemp = Math.min(...temps)
        const maxTemp = Math.max(...temps)

        // Use the forecast closest to noon for weather condition
        const noonForecast = forecasts.reduce((prev, curr) => {
          const prevHour = new Date(prev.dt * 1000).getHours()
          const currHour = new Date(curr.dt * 1000).getHours()
          return Math.abs(currHour - 12) < Math.abs(prevHour - 12) ? curr : prev
        })

        const dateObj = new Date(date)
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' })

        return {
          location: {
            name: apiData.city.name,
            latitude: apiData.city.coord.lat,
            longitude: apiData.city.coord.lon,
            country: apiData.city.country,
          },
          date,
          dayOfWeek,
          condition: noonForecast.weather[0].main,
          conditionDescription: noonForecast.weather[0].description,
          iconCode: noonForecast.weather[0].icon,
          temperatureMin: Math.round(minTemp),
          temperatureMax: Math.round(maxTemp),
          temperatureUnit: units === 'metric' ? 'celsius' : 'fahrenheit',
          timestamp: noonForecast.dt * 1000,
        }
      })

    // Cache the result
    forecastCache.set(cacheKey, forecastDays)
    console.log(`[Weather Service] Cached forecast data for ${cacheKey}`)

    return {
      success: true,
      data: forecastDays,
      cached: false,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('[Weather Service] Error fetching forecast:', error)
    return mapApiError(error)
  }
}
