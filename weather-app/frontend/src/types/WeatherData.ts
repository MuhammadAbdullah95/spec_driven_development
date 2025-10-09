import { Location } from './Location'

export interface WeatherData {
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
