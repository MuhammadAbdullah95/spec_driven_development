export interface SearchQuery {
  rawInput: string
  queryType: 'city' | 'coordinates'
  cityName?: string
  latitude?: number
  longitude?: number
  isValid: boolean
  errorMessage: string | null
}
