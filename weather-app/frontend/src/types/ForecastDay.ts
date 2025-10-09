import { Location } from './Location'

export interface ForecastDay {
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
