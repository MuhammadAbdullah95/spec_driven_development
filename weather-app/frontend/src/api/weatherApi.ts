import axios from 'axios'
import type { WeatherData, Location, ForecastDay, ApiResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface WeatherApiResponse extends ApiResponse<WeatherData> {
  success: true
  data: WeatherData
  cached?: boolean
  timestamp: number
}

export interface LocationApiResponse extends ApiResponse<Location> {
  success: true
  data: Location
  cached?: boolean
  timestamp: number
}

export interface ForecastApiResponse extends ApiResponse<ForecastDay[]> {
  success: true
  data: ForecastDay[]
  cached?: boolean
  timestamp: number
}

export interface ErrorApiResponse {
  success: false
  error: string
  code: string
  retryAfter?: number
}

/**
 * Fetches current weather for given coordinates
 */
export async function getCurrentWeather(
  lat: number,
  lon: number,
  units: 'celsius' | 'fahrenheit'
): Promise<WeatherApiResponse> {
  const response = await apiClient.get<WeatherApiResponse>('/weather/current', {
    params: { lat, lon, units },
  })
  return response.data
}

/**
 * Converts city name to coordinates
 */
export async function getCoordinatesFromCity(city: string): Promise<LocationApiResponse> {
  const response = await apiClient.get<LocationApiResponse>('/weather/geocode', {
    params: { city },
  })
  return response.data
}

/**
 * Fetches 3-day weather forecast for given coordinates
 */
export async function getWeatherForecast(
  lat: number,
  lon: number,
  units: 'celsius' | 'fahrenheit'
): Promise<ForecastApiResponse> {
  const response = await apiClient.get<ForecastApiResponse>('/weather/forecast', {
    params: { lat, lon, units },
  })
  return response.data
}
