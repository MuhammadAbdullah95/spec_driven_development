import axios from 'axios'
import { env } from './env.js'

export const openWeatherClient = axios.create({
  baseURL: env.OPENWEATHER_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add API key to all requests
openWeatherClient.interceptors.request.use((config) => {
  if (!config.params) {
    config.params = {}
  }
  config.params.appid = env.OPENWEATHER_API_KEY
  return config
})

// Response interceptor for logging
openWeatherClient.interceptors.response.use(
  (response) => {
    console.log(`[OpenWeather API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
    return response
  },
  (error) => {
    console.error(`[OpenWeather API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'}`)
    return Promise.reject(error)
  }
)
